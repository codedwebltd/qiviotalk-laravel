<?php

namespace App\Http\Controllers\Api;

use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Str;
use App\Traits\EmailNotificationTrait;

class SubscriptionController extends Controller
{
    use EmailNotificationTrait;

    public function index()
    {
        $subscriptions = Subscription::where('is_active', true)->get();
        return response()->json(['status' => 'success', 'subscriptions' => $subscriptions]);
    }

    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'payment_reference' => 'required|string',
        ]);

        $user = $request->user();
        $subscription = Subscription::find($validated['subscription_id']);

        DB::beginTransaction();
        try {
            Transaction::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'type' => 'subscription',
                'amount' => $subscription->price,
                'status' => 'completed',
                'description' => "Subscription: {$subscription->name}",
                'reference' => $validated['payment_reference'],
            ]);

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

            DB::commit();

            // Send notification
            $this->sendSubscriptionNotification(
                $user,
                'Subscription Activated',
                "Your {$subscription->name} subscription has been successfully activated!",
                'subscription_purchased',
                [
                    'subscription_id' => $subscription->id,
                    'subscription_name' => $subscription->name,
                    'amount' => $subscription->price,
                    'expires_at' => $expiresAt?->toDateTimeString() ?? 'lifetime',
                ]
            );

            $user->load([
                'notifications' => function($query) {
                  $query->latest()->limit(5);
                },
                'wallet', 'onboarding', 'widget.websiteContexts','devices','aiSetting','usersettings','subscription']);

            // Get paginated transactions separately
            $perPage = $request->input('per_page', 15);
            $transactions = $user->transactions()
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Subscription purchased',
                'user' => $user,
                'transactions' => $transactions
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    public function renew(Request $request)
{
    $validated = $request->validate([
        'subscription_id' => 'required|exists:subscriptions,id',
        'payment_reference' => 'required|string',
        'amount' => 'required|numeric|min:0',
    ]);

    $user = $request->user();
    $subscription = Subscription::find($validated['subscription_id']);
    
    // Check if user has an existing subscription
    $currentSubscription = $user->subscription;
    $isDowngradeToFree = $subscription->price == 0 && $currentSubscription && $currentSubscription->price > 0;
    
    // Verify the amount matches the subscription price
    if ($validated['amount'] != $subscription->price) {
        return response()->json([
            'status' => 'error',
            'message' => 'Payment amount does not match subscription price'
        ], 400);
    }

    DB::beginTransaction();

    try {
        $refundAmount = 0;
        
        // Calculate refund if downgrading to free plan
        if ($isDowngradeToFree && $user->membership_expires_at && $user->membership_expires_at > now()) {
            $refundAmount = $this->calculateProRataRefund(
                $user->membership_expires_at,
                $currentSubscription
            );
            
            if ($refundAmount > 0) {
                // Get or create user wallet
                $wallet = $user->wallet()->firstOrCreate(
                    ['currency' => 'USD'],
                    ['balance' => 0.00, 'is_active' => true]
                );

                // Add refund to wallet
                $wallet->increment('balance', $refundAmount);

                // Create refund transaction record with pending status for admin review
                Transaction::create([
                    'user_id' => $user->id,
                    'type' => 'refund',
                    'amount' => $refundAmount,
                    'status' => 'pending',
                    'description' => "Refund for unused subscription period: {$currentSubscription->name}",
                    'reference' => 'REFUND-' . $validated['payment_reference'],
                ]);
            }
        }
        
        // Create transaction record for the renewal (only if not free)
        if ($subscription->price > 0) {
            Transaction::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'type' => 'subscription_renewal',
                'amount' => $validated['amount'],
                'status' => 'completed',
                'description' => "Subscription Renewal: {$subscription->name}",
                'reference' => $validated['payment_reference'],
            ]);
        }

        // Calculate new expiry date
        $currentExpiry = $user->membership_expires_at;
        
        // For free plan or immediate start, start from now
        // For paid renewals, extend from current expiry if still active
        if ($subscription->price == 0) {
            $baseDate = now();
        } else {
            $baseDate = $currentExpiry && $currentExpiry > now() ? $currentExpiry : now();
        }
        
        $newExpiresAt = match($subscription->duration) {
            'monthly' => $baseDate->copy()->addMonth(),
            'yearly' => $baseDate->copy()->addYear(),
            'lifetime' => null,
            default => $baseDate->copy()->addMonth(),
        };

        // Update user subscription details
        $user->update([
            'subscription_id' => $subscription->id,
            'membership_type' => strtolower($subscription->name),
            'membership_expires_at' => $newExpiresAt,
        ]);

        DB::commit();

        // Send notification
        $notificationBody = $refundAmount > 0
            ? "Your {$subscription->name} subscription has been renewed. ₦{$refundAmount} refund credited to your wallet."
            : "Your {$subscription->name} subscription has been successfully renewed!";

        $this->sendSubscriptionNotification(
            $user,
            'Subscription Renewed',
            $notificationBody,
            'subscription_renewed',
            [
                'subscription_id' => $subscription->id,
                'subscription_name' => $subscription->name,
                'amount' => $validated['amount'],
                'expires_at' => $newExpiresAt?->toDateTimeString() ?? 'lifetime',
                'refund_amount' => $refundAmount,
            ]
        );

        // Load user relationships (excluding transactions)
        $user->load([
            'notifications' => function($query) {
                $query->latest()->limit(5);
            },
            'wallet',
            'onboarding',
            'widget.websiteContexts',
            'devices',
            'aiSetting',
            'usersettings',
            'subscription'
        ]);

        // Get paginated transactions separately
        $perPage = $request->input('per_page', 15);
        $transactions = $user->transactions()
            ->latest()
            ->paginate($perPage);

        $response = [
            'status' => 'success',
            'message' => 'Subscription renewed successfully',
            'user' => $user,
            'transactions' => $transactions,
            'new_expiry' => $newExpiresAt?->toDateTimeString()
        ];

        // Add refund info if applicable
        if ($refundAmount > 0) {
            $response['refund'] = [
                'amount' => $refundAmount,
                'message' => "₦{$refundAmount} has been credited to your wallet"
            ];
        }

        return response()->json($response);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
}

/**
 * Calculate pro-rata refund for unused subscription period
 */
private function calculateProRataRefund($expiryDate, $subscription)
{
    if (!$expiryDate || $expiryDate <= now()) {
        return 0;
    }

    // Calculate remaining days
    $remainingDays = now()->diffInDays($expiryDate, false);

    if ($remainingDays <= 0) {
        return 0;
    }

    // Calculate total days based on subscription duration
    $totalDays = match($subscription->duration) {
        'monthly' => 30,
        'yearly' => 365,
        default => 30,
    };

    // Don't refund lifetime subscriptions
    if ($subscription->duration === 'lifetime') {
        return 0;
    }

    // Calculate pro-rata refund
    $refundAmount = ($subscription->price / $totalDays) * $remainingDays;

    // Round to 2 decimal places
    return round($refundAmount, 2);
}

/**
 * Send subscription notification to user (Email + Firebase + Database)
 */
private function sendSubscriptionNotification($user, $title, $body, $type, $subscriptionData = [])
{
    try {
        // Load user settings if not already loaded
        if (!$user->relationLoaded('usersettings')) {
            $user->load('usersettings');
        }

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

        // Send Email Notification using EmailNotificationTrait (respects email_enabled)
        $emailType = 'success'; // Default for subscription success
        if (in_array($type, ['subscription_failed', 'subscription_cancelled'])) {
            $emailType = 'error';
        } elseif ($type === 'subscription_pending') {
            $emailType = 'info';
        }

        $emailMessage = [
            'response' => $body,
            'subject' => $title . ' - ' . config('app.name'),
            'type' => $emailType,
            'user_name' => $user->name,
            'notify_admin' => false
        ];

        $this->ActionNotification($user->id, $emailMessage);

        Log::info("Email notification sent for user {$user->id}: {$type}");

        // Check if user has push notifications enabled
        if (!$user->usersettings->push_enabled) {
            Log::info("User {$user->id} has push notifications disabled, skipping Firebase and database notifications");
            return;
        }

        // Create database notification record (controlled by push_enabled)
        DB::table('notifications')->insert([
            'id' => (string) Str::uuid(),
            'type' => 'App\Notifications\Subscription',
            'notifiable_type' => 'App\Models\User',
            'notifiable_id' => $user->id,
            'data' => json_encode(array_merge([
                'title' => $title,
                'body' => $body,
            ], $subscriptionData)),
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
                    ], array_map('strval', $subscriptionData)));

                $messaging->send($message);
                $sentCount++;

                // Update last_used_at
                $device->update(['last_used_at' => now()]);

                Log::info("Firebase subscription notification sent to user {$user->id} device {$device->id} ({$device->platform})");

            } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                // Token is invalid/expired, remove it
                Log::warning("Invalid FCM token for device {$device->id}, removing: " . $e->getMessage());
                $device->delete();
                $failCount++;
            } catch (\Exception $e) {
                Log::error("Failed to send to device {$device->id}: " . $e->getMessage());
                $failCount++;
            }
        }

        Log::info("Firebase subscription notification summary for user {$user->id}: {$sentCount} sent, {$failCount} failed");

        Log::info('Subscription notifications processed (email/database/firebase)', [
            'user_id' => $user->id,
            'type' => $type,
            'email_enabled' => $user->usersettings->email_enabled ?? false,
            'push_enabled' => $user->usersettings->push_enabled ?? false
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to send subscription notification: ' . $e->getMessage());
        Log::error('Stack trace: ' . $e->getTraceAsString());
    }
}
}
