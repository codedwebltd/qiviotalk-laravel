<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use App\Traits\EmailNotificationTrait;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

class PaymentApiController extends Controller
{
    use EmailNotificationTrait;

    /**
     * Cryptomus API endpoint for creating payments
     */
    private const CRYPTOMUS_PAYMENT_URL = 'https://api.cryptomus.com/v1/payment';

    /**
     * Get Cryptomus credentials from GlobalSettings
     */
    private function getCryptomusConfig()
    {
        $settings = \App\Models\GlobalSetting::get();

        return [
            'merchant_id' => $settings->cryptomus_merchant_id ?? '',
            'api_key' => $settings->cryptomus_api_key ?? '',
        ];
    }

    /**
     * Create a payment invoice using Cryptomus
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createCryptomusPayment(Request $request)
    {
        // Step 1: Validate amount
        if (empty($request->amount)) {
            return response()->json([
                'error' => 'amount_required',
                'message' => 'The amount field is required.'
            ], 422);
        }

        // Step 2: Validate amount is numeric and greater than minimum
        if (!is_numeric($request->amount) || $request->amount < 5) {
            return response()->json([
                'error' => 'amount_invalid',
                'message' => 'Amount must be a number greater than 5.'
            ], 422);
        }

        // Step 3: Validate subscription_id if provided
        if (!empty($request->subscription_id)) {
            $subscription = \App\Models\Subscription::find($request->subscription_id);
            if (!$subscription) {
                return response()->json([
                    'error' => 'subscription_not_found',
                    'message' => 'Invalid subscription ID.'
                ], 404);
            }

            // Verify amount matches subscription price
            if ($request->amount != $subscription->price) {
                return response()->json([
                    'error' => 'amount_mismatch',
                    'message' => 'Amount does not match subscription price.'
                ], 422);
            }
        }

        try {
            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'authentication_required',
                    'message' => 'You must be logged in to make a payment.'
                ], 401);
            }

            // Generate a unique order ID
            $orderId = 'CRYP-' . strtoupper(Str::random(8));

            // Set fixed parameters
            $currency = 'USD'; // Default currency

            // Prepare additional data
            $additionalData = [
                'user_id' => $user->id,
                'email' => $user->email
            ];

            // Add subscription_id if provided
            if (!empty($request->subscription_id)) {
                $additionalData['subscription_id'] = $request->subscription_id;
            }

            // Prepare the API payload
            $payload = [
                'amount' => (string)$request->amount,
                'currency' => $currency,
                'order_id' => $orderId,
                'url_callback' => route('api.crypto.webhook'),
                'url_return' => url('/dashboard'), // Change this to your success page
                'is_payment_multiple' => false,
                'lifetime' => 300, // 5 minutes expiry
                'additional_data' => json_encode($additionalData)
            ];

            // Generate signature as per Cryptomus documentation
            $payloadJson = json_encode($payload);
            $payloadBase64 = base64_encode($payloadJson);

            // MD5 HASH signature
            $signature = md5($payloadBase64 . $this->getCryptomusConfig()["api_key"]);

            // Make API request to Cryptomus
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'merchant' => $this->getCryptomusConfig()["merchant_id"],
                'sign' => $signature
            ])->post(self::CRYPTOMUS_PAYMENT_URL, $payload);

            // Log the request details for debugging
            Log::info('Cryptomus API Request', [
                'payload' => $payload,
                'signature' => $signature,
                'merchant' => $this->getCryptomusConfig()["merchant_id"]
            ]);

            // Check if the request was successful
            if ($response->successful()) {
                $responseData = $response->json();

                // Log the response for debugging
                Log::info('Cryptomus API Response', [
                    'response' => $responseData
                ]);

                // Verify the response has the expected structure
                if (isset($responseData['state']) && $responseData['state'] === 0) {
                    // Build metadata
                    $metadata = [
                        'order_id' => $orderId,
                        'payment_method' => 'Crypto Payment',
                        'cryptomus_uuid' => $responseData['result']['uuid'] ?? null
                    ];

                    // If subscription purchase, add to metadata
                    if (!empty($request->subscription_id)) {
                        $metadata['subscription_id'] = $request->subscription_id;
                    }

                    // Determine transaction type and description
                    $transactionData = [
                        'user_id' => $user->id,
                        'amount' => $request->amount,
                        'currency' => $currency,
                        'status' => 'pending',
                        'reference' => $orderId,
                        'metadata' => $metadata
                    ];

                    // If subscription purchase
                    if (!empty($request->subscription_id)) {
                        $subscription = \App\Models\Subscription::find($request->subscription_id);
                        $transactionData['type'] = 'subscription';
                        $transactionData['description'] = 'Subscription Purchase: ' . $subscription->name;
                    } else {
                        // Wallet topup
                        $transactionData['type'] = 'deposit';
                        $transactionData['description'] = 'Crypto payment via Cryptomus';
                    }

                    // Create a transaction record
                    $transaction = Transaction::create($transactionData);

                    // Send payment initiated notification
                    $notificationData = [
                        'order_id' => $orderId,
                        'amount' => $request->amount,
                        'currency' => $currency,
                        'expires_in' => 5, // 5 minutes
                        'payment_url' => $responseData['result']['url'],
                        'expires_at' => $responseData['result']['expired_at'] ?? null,
                    ];

                    // Add subscription details if it's a subscription payment
                    if (!empty($request->subscription_id)) {
                        $subscription = \App\Models\Subscription::find($request->subscription_id);
                        $notificationData['subscription_name'] = $subscription->name;
                        $notificationData['transaction_type'] = 'subscription';
                    } else {
                        $notificationData['transaction_type'] = 'wallet_topup';
                    }

                    // Send notification with user preferences respected
                    $this->sendPaymentNotification($user, $transaction, 'payment_initiated', $notificationData);

                    // Return successful response with payment details
                    return response()->json([
                        'success' => true,
                        'message' => 'Payment invoice created successfully',
                        'data' => [
                            'payment_url' => $responseData['result']['url'],
                            'amount' => $responseData['result']['amount'],
                            'currency' => $responseData['result']['currency'],
                            'order_id' => $orderId,
                            'expires_at' => $responseData['result']['expired_at'],
                            'uuid' => $responseData['result']['uuid']
                        ]
                    ]);
                }
            }

            // Handle unsuccessful response
            Log::error('Cryptomus API Error', [
                'response' => $response->json(),
                'status' => $response->status()
            ]);

            return response()->json([
                'error' => 'payment_creation_failed',
                'message' => $response->json()['message'] ?? 'Could not create payment',
            ], $response->status() !== 200 ? $response->status() : 500);

        } catch (\Exception $e) {
            Log::error('Cryptomus payment creation error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'server_error',
                'message' => 'An error occurred while creating the payment'
            ], 500);
        }
    }

    /**
     * Handle Cryptomus payment webhook
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handleCryptomusWebhook(Request $request)
    {
        try {
            // Get the request payload
            $payload = $request->getContent();
            $webhookData = json_decode($payload, true);

            // Log the entire webhook data
            Log::info('Cryptomus Webhook Received', ['data' => $webhookData]);

            // Extract the sign from the payload
            $receivedSignature = isset($webhookData['sign']) ? $webhookData['sign'] : null;

            // Create a copy of the payload without the sign field for verification
            if (isset($webhookData['sign'])) {
                $payloadCopy = $webhookData;
                unset($payloadCopy['sign']);
                $payloadForVerification = json_encode($payloadCopy);
                $payloadBase64 = base64_encode($payloadForVerification);
                $calculatedSignature = md5($payloadBase64 . $this->getCryptomusConfig()["api_key"]);
            } else {
                // Fallback
                $payloadBase64 = base64_encode($payload);
                $calculatedSignature = md5($payloadBase64 . $this->getCryptomusConfig()["api_key"]);
            }

            Log::info('Webhook Signature Verification', [
                'received' => $receivedSignature,
                'calculated' => $calculatedSignature
            ]);

            // Verify signature
            if ($receivedSignature !== $calculatedSignature) {
                Log::warning('Invalid Cryptomus webhook signature');
                return response()->json(['error' => 'Invalid signature'], 403);
            }

            // Validate the webhook data structure
            if (!isset($webhookData['status']) || !isset($webhookData['order_id'])) {
                Log::warning('Invalid Cryptomus webhook data structure', $webhookData);
                return response()->json(['error' => 'Invalid data structure'], 400);
            }

            // Find transaction by reference (order_id)
            $transaction = Transaction::where('reference', $webhookData['order_id'])->first();

            if (!$transaction) {
                Log::warning('Transaction not found for webhook', ['order_id' => $webhookData['order_id']]);
                return response()->json(['error' => 'Transaction not found'], 404);
            }

            // Get the user associated with the transaction
            $user = User::findOrFail($transaction->user_id);

            // Update transaction status based on the webhook status
            switch ($webhookData['status']) {
                case 'paid':
                    // Ensure we don't process the same payment twice
                    if ($transaction->status == 'completed') {
                        Log::info('Payment already processed', ['order_id' => $webhookData['order_id']]);
                        return response()->json(['success' => true, 'message' => 'Payment already processed']);
                    }

                    // Update metadata with full webhook response
                    $metadata = $transaction->metadata ?? [];
                    $metadata['webhook_response'] = $webhookData;
                    $metadata['completed_at'] = now()->toDateTimeString();

                    $transaction->status = 'completed';
                    $transaction->metadata = $metadata;
                    $transaction->save();

                    // Check if this is a subscription purchase (check metadata)
                    if ($transaction->type === 'subscription' && !empty($metadata['subscription_id'])) {
                        // Activate subscription
                        $subscription = \App\Models\Subscription::find($metadata['subscription_id']);
                        if ($subscription) {
                            $expiresAt = match($subscription->duration) {
                                'monthly' => now()->addMonth(),
                                'yearly' => now()->addYear(),
                                'lifetime' => null,
                                default => now()->addMonth(),
                            };

                            $user->update([
                                'subscription_id' => $subscription->id,
                                'membership_type' => strtolower($subscription->name),
                                'membership_expires_at' => $expiresAt,
                            ]);

                            Log::info('Subscription activated', [
                                'user_id' => $user->id,
                                'subscription_id' => $subscription->id,
                                'subscription_name' => $subscription->name,
                                'expires_at' => $expiresAt
                            ]);

                            // Send notifications for subscription activation
                            $this->sendPaymentNotification($user, $transaction, 'subscription_activated', [
                                'subscription_name' => $subscription->name,
                                'amount' => $transaction->amount,
                                'expires_at' => $expiresAt?->toDateTimeString()
                            ]);
                        }
                    } else {
                        // Update user wallet for topup
                        $wallet = $user->wallet;
                        if ($wallet) {
                            $wallet->balance = $wallet->balance + $transaction->amount;
                            $wallet->save();

                            Log::info('Wallet updated', [
                                'user_id' => $user->id,
                                'amount_added' => $transaction->amount,
                                'new_balance' => $wallet->balance
                            ]);

                            // Send notifications for wallet credit
                            $this->sendPaymentNotification($user, $transaction, 'payment_completed', [
                                'amount' => $transaction->amount,
                                'new_balance' => $wallet->balance
                            ]);
                        }
                    }
                    break;

                case 'confirm_check':
                    // Pending confirmation state
                    Log::info('Payment in confirmation check state', ['order_id' => $webhookData['order_id']]);
                    break;

                case 'cancel':
                case 'cancelled':
                    // Update metadata with webhook response
                    $metadata = $transaction->metadata ?? [];
                    $metadata['webhook_response'] = $webhookData;
                    $metadata['cancelled_at'] = now()->toDateTimeString();

                    // Handle cancelled payments
                    $transaction->status = 'cancelled';
                    $transaction->metadata = $metadata;
                    $transaction->save();

                    // Send cancellation notification
                    $this->sendPaymentNotification($user, $transaction, 'payment_cancelled', [
                        'amount' => $transaction->amount,
                        'reason' => 'Payment was cancelled'
                    ]);
                    break;

                case 'failed':
                    // Update metadata with webhook response
                    $metadata = $transaction->metadata ?? [];
                    $metadata['webhook_response'] = $webhookData;
                    $metadata['failed_at'] = now()->toDateTimeString();

                    $transaction->status = 'failed';
                    $transaction->metadata = $metadata;
                    $transaction->save();

                    // Send failure notification
                    $this->sendPaymentNotification($user, $transaction, 'payment_failed', [
                        'amount' => $transaction->amount,
                        'reason' => 'Payment processing failed'
                    ]);
                    break;

                case 'expired':
                    // Update metadata with webhook response
                    $metadata = $transaction->metadata ?? [];
                    $metadata['webhook_response'] = $webhookData;
                    $metadata['expired_at'] = now()->toDateTimeString();

                    $transaction->status = 'expired';
                    $transaction->metadata = $metadata;
                    $transaction->save();

                    // Send expiry notification
                    $this->sendPaymentNotification($user, $transaction, 'payment_expired', [
                        'amount' => $transaction->amount,
                        'reason' => 'Payment session expired'
                    ]);
                    break;

                default:
                    Log::info('Unhandled payment status', [
                        'order_id' => $webhookData['order_id'],
                        'status' => $webhookData['status']
                    ]);
                    break;
            }

            // Log the webhook processing
            Log::info('Cryptomus webhook processed', [
                'order_id' => $webhookData['order_id'],
                'status' => $webhookData['status'],
                'transaction_status_updated' => $transaction->status
            ]);

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('Cryptomus webhook error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'Server error'], 500);
        }
    }

    /**
     * Check Cryptomus payment status
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkPaymentStatus(Request $request)
    {
        // Validate order_id parameter
        if (empty($request->order_id)) {
            return response()->json([
                'error' => 'order_id_required',
                'message' => 'The order_id parameter is required.'
            ], 422);
        }

        try {
            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'authentication_required',
                    'message' => 'You must be logged in to check payment status.'
                ], 401);
            }

            // Find transaction by reference (order_id)
            $transaction = Transaction::where('reference', $request->order_id)
                                     ->where('user_id', $user->id)
                                     ->first();

            if (!$transaction) {
                return response()->json([
                    'error' => 'transaction_not_found',
                    'message' => 'No transaction found with the provided order ID.'
                ], 404);
            }

            // Return transaction status information
            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $transaction->reference,
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                    'date' => $transaction->created_at,
                    'updated_at' => $transaction->updated_at
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error checking payment status', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'server_error',
                'message' => 'An error occurred while checking payment status'
            ], 500);
        }
    }

    /**
     * Cancel an in-progress payment
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function cancelPayment(Request $request)
    {
        // Validate the request input
        if (empty($request->order_id)) {
            return response()->json([
                'error' => 'order_id_required',
                'message' => 'Order ID is required to cancel a payment'
            ], 422);
        }

        try {
            // Get authenticated user
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'error' => 'authentication_required',
                    'message' => 'You must be logged in to cancel a payment'
                ], 401);
            }

            // Find the transaction by reference (order_id) and user_id (for security)
            $transaction = Transaction::where('reference', $request->order_id)
                ->where('user_id', $user->id)
                ->first();

            if (!$transaction) {
                return response()->json([
                    'error' => 'transaction_not_found',
                    'message' => 'Could not find the specified transaction'
                ], 404);
            }

            // Only allow cancellation of pending transactions
            if ($transaction->status != 'pending') {
                return response()->json([
                    'error' => 'invalid_transaction_status',
                    'message' => 'Only pending transactions can be cancelled'
                ], 400);
            }

            // Update transaction status to cancelled
            $transaction->status = 'cancelled';
            $transaction->save();

            // Send cancellation notification
            $this->sendPaymentNotification($user, $transaction, 'payment_cancelled', [
                'amount' => $transaction->amount,
                'reason' => 'Payment was cancelled by user'
            ]);

            // Return success response
            return response()->json([
                'success' => true,
                'message' => 'Payment cancelled successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling payment:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'server_error',
                'message' => 'An error occurred while cancelling the payment'
            ], 500);
        }
    }

    /**
     * Send payment notification via Email, Database, and Firebase
     *
     * @param User $user
     * @param Transaction $transaction
     * @param string $type
     * @param array $extraData
     * @return void
     */
    private function sendPaymentNotification($user, $transaction, $type, $extraData = [])
    {
        try {
            // Load user settings
            $user->load('usersettings');

            // Create default settings if they don't exist
            if (!$user->usersettings) {
                \App\Models\UserSetting::create([
                    'user_id' => $user->id,
                    'push_enabled' => true,
                    'email_enabled' => true,
                    'sound_enabled' => true,
                ]);
                $user->load('usersettings');
            }

            // Prepare notification messages based on type
            $amount = $extraData['amount'] ?? '0.00';
            $reason = $extraData['reason'] ?? 'No reason provided';
            $subscriptionName = $extraData['subscription_name'] ?? '';
            $orderId = $extraData['order_id'] ?? '';
            $expiresIn = $extraData['expires_in'] ?? 5;
            $newBalance = $extraData['new_balance'] ?? '0.00';

            $messages = [
                'payment_initiated' => [
                    'title' => 'Payment Initiated',
                    'body' => isset($extraData['subscription_name'])
                        ? "Payment of \${$amount} initiated for {$subscriptionName} subscription. Order: {$orderId}. Please complete payment within {$expiresIn} minutes."
                        : "Wallet topup payment of \${$amount} initiated. Order: {$orderId}. Please complete payment within {$expiresIn} minutes.",
                    'subject' => 'Payment Initiated - ' . config('app.name')
                ],
                'subscription_activated' => [
                    'title' => 'Subscription Activated',
                    'body' => "Your {$subscriptionName} subscription has been activated successfully! Payment of \${$amount} processed.",
                    'subject' => 'Subscription Activated - ' . config('app.name')
                ],
                'payment_completed' => [
                    'title' => 'Payment Completed',
                    'body' => "Your payment of \${$amount} has been processed successfully. New balance: \${$newBalance}",
                    'subject' => 'Payment Completed - ' . config('app.name')
                ],
                'payment_cancelled' => [
                    'title' => 'Payment Cancelled',
                    'body' => "Your payment of \${$amount} was cancelled. {$reason}",
                    'subject' => 'Payment Cancelled - ' . config('app.name')
                ],
                'payment_failed' => [
                    'title' => 'Payment Failed',
                    'body' => "Your payment of \${$amount} failed. {$reason}. Please try again.",
                    'subject' => 'Payment Failed - ' . config('app.name')
                ],
                'payment_expired' => [
                    'title' => 'Payment Expired',
                    'body' => "Your payment session of \${$amount} has expired. {$reason}",
                    'subject' => 'Payment Expired - ' . config('app.name')
                ],
            ];

            $notificationData = $messages[$type] ?? $messages['payment_completed'];

            // Send Email Notification using EmailNotificationTrait (respects email_enabled)
            $emailType = 'success'; // Default
            if (in_array($type, ['payment_failed', 'payment_cancelled', 'payment_expired'])) {
                $emailType = 'error';
            } elseif ($type === 'payment_initiated') {
                $emailType = 'info';
            }

            $emailMessage = [
                'response' => $notificationData['body'],
                'subject' => $notificationData['subject'],
                'type' => $emailType,
                'user_name' => $user->name,
                'notify_admin' => false
            ];

            $this->ActionNotification($user->id, $emailMessage);

            // Send Firebase + Database Notification (respects push_enabled)
            $this->sendFirebaseNotification($user, $notificationData['title'], $notificationData['body'], $type, array_merge([
                'order_id' => $transaction->reference,
                'amount' => (string)$transaction->amount,
                'status' => $transaction->status,
                'type' => $transaction->type,
            ], $extraData));

            Log::info('Payment notifications processed', [
                'user_id' => $user->id,
                'type' => $type,
                'transaction_id' => $transaction->reference,
                'email_enabled' => $user->usersettings->email_enabled ?? false,
                'push_enabled' => $user->usersettings->push_enabled ?? false
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send payment notification', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send Firebase notification to user devices and create database notification
     *
     * @param User $user
     * @param string $title
     * @param string $body
     * @param string $type
     * @param array $data
     * @return void
     */
    private function sendFirebaseNotification($user, $title, $body, $type, $data = [])
    {
        try {
            // Load user settings if not already loaded
            if (!$user->relationLoaded('usersettings')) {
                $user->load('usersettings');
            }

            // Check if user has push notifications enabled
            if (!$user->usersettings || !$user->usersettings->push_enabled) {
                Log::info("User {$user->id} has push notifications disabled, skipping Firebase and database notifications");
                return;
            }

            // Create database notification (controlled by push_enabled)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\Payment',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode(array_merge([
                    'title' => $title,
                    'body' => $body,
                ], $data)),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Database notification created for user {$user->id}: {$type}");

            // Get all devices with FCM tokens
            $devices = $user->devices()->whereNotNull('fcm_token')->get();

            if ($devices->isEmpty()) {
                Log::info("User {$user->id} has no devices with FCM tokens, skipping Firebase notification");
                return;
            }

            $messaging = Firebase::messaging();
            $notification = Notification::create($title, $body);

            $sentCount = 0;
            $failCount = 0;

            // Send to each device
            foreach ($devices as $device) {
                try {
                    $message = CloudMessage::withTarget('token', $device->fcm_token)
                        ->withNotification($notification)
                        ->withData(array_merge([
                            'type' => $type,
                            'timestamp' => (string)now()->timestamp,
                            'sound_enabled' => (string)($user->usersettings->sound_enabled ?? true),
                        ], array_map('strval', $data)));

                    $messaging->send($message);
                    $sentCount++;

                    // Update last_used_at
                    $device->update(['last_used_at' => now()]);

                    Log::info("Firebase payment notification sent to user {$user->id} device {$device->id}");

                } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                    // Token is invalid/expired, remove it
                    Log::warning("Invalid FCM token for device {$device->id}, removing");
                    $device->delete();
                    $failCount++;
                } catch (\Exception $e) {
                    Log::error("Failed to send to device {$device->id}: " . $e->getMessage());
                    $failCount++;
                }
            }

            Log::info("Firebase payment notification summary for user {$user->id}: {$sentCount} sent, {$failCount} failed");

        } catch (\Exception $e) {
            Log::error('Failed to send Firebase payment notification', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

}
