<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Illuminate\Support\Str;

class NewConversationService
{
    /**
     * Notify user of new conversation using their FCM token(s)
     * Sends to ALL user devices (Android & iOS)
     *
     * @param User $user The user to notify
     * @param int $conversationId The conversation ID
     * @param string|null $visitorName Optional visitor name for notification
     * @param bool $isReturning Whether this is a returning visitor
     * @param string|null $country Visitor's country
     * @return void
     */
    public function notifyUserOfNewConversation(User $user, $conversationId, $visitorName = null, $isReturning = false, $country = null)
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

            // Create notification with visitor info
            if ($isReturning) {
                // Returning visitor message
                $title = 'Returning Visitor';
                if ($visitorName) {
                    $body = "{$visitorName} has returned!";
                } else {
                    $body = $country
                        ? "Visitor from {$country} has returned!"
                        : "A visitor has returned!";
                }
            } else {
                // New visitor message
                $title = 'New Visitor';
                if ($visitorName) {
                    $body = $country
                        ? "New visitor {$visitorName} from {$country}"
                        : "New visitor {$visitorName}";
                } else {
                    $body = $country
                        ? "New visitor from {$country}"
                        : 'A new visitor has arrived';
                }
            }

            // Create database notification record (controlled by push_enabled)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\NewConversation',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode([
                    'title' => $title,
                    'body' => $body,
                    'conversation_id' => $conversationId,
                    'visitor_name' => $visitorName,
                    'is_returning' => $isReturning,
                    'country' => $country,
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Database notification created for user {$user->id}: new_conversation");

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
                        ->withData([
                            'conversation_id' => (string)$conversationId,
                            'type' => 'new_conversation',
                            'visitor_name' => (string)($visitorName ?? ''),
                            'is_returning' => (string)($isReturning ? '1' : '0'),
                            'country' => (string)($country ?? ''),
                            'timestamp' => (string)now()->timestamp,
                            'sound_enabled' => (string)($user->usersettings->sound_enabled ?? true),
                        ]);

                    $messaging->send($message);
                    $sentCount++;

                    // Update last_used_at to track active devices
                    $device->update(['last_used_at' => now()]);

                    Log::info("Firebase notification sent to user {$user->id} device {$device->id} ({$device->platform}) for conversation {$conversationId}");

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

            Log::info("Firebase notification summary for user {$user->id}: {$sentCount} sent, {$failCount} failed");

        } catch (\Exception $e) {
            Log::error('Failed to send Firebase notification: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
        }
    }

    /**
     * Notify user of new message in conversation
     * Sends to ALL user devices (Android & iOS)
     *
     * @param User $user
     * @param int $conversationId
     * @param string $messagePreview
     * @param string|null $senderName
     * @return void
     */
    public function notifyUserOfNewMessage(User $user, $conversationId, $messagePreview, $senderName = null)
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

            $title = $senderName ? $senderName : 'New Message';
            $body = substr($messagePreview, 0, 100); // Limit message preview

            // Create database notification record (controlled by push_enabled)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\NewMessage',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode([
                    'title' => $title,
                    'body' => $body,
                    'conversation_id' => $conversationId,
                    'sender_name' => $senderName,
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Database notification created for user {$user->id}: new_message");

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
                        ->withData([
                            'conversation_id' => (string)$conversationId,
                            'type' => 'new_message',
                            'timestamp' => (string)now()->timestamp,
                            'sound_enabled' => (string)($user->usersettings->sound_enabled ?? true),
                        ]);

                    $messaging->send($message);
                    $sentCount++;

                    // Update last_used_at
                    $device->update(['last_used_at' => now()]);

                    Log::info("Firebase message notification sent to user {$user->id} device {$device->id} ({$device->platform}) for conversation {$conversationId}");

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

            Log::info("Firebase message notification summary for user {$user->id}: {$sentCount} sent, {$failCount} failed");

        } catch (\Exception $e) {
            Log::error('Failed to send Firebase message notification: ' . $e->getMessage());
        }
    }

    /**
     * Notify user of conversation closed
     * Sends Firebase, database, and email notifications respecting user privacy settings
     *
     * @param User $user The user to notify (widget owner)
     * @param int $conversationId The conversation ID
     * @param string|null $visitorName Optional visitor name
     * @param string|null $closedBy Who closed the conversation (agent/visitor)
     * @param string|null $closeReason Optional close reason
     * @param int|null $rating Optional conversation rating
     * @param string|null $ratingComment Optional rating feedback
     * @return void
     */
    public function notifyUserOfConversationClosed(
        User $user,
        $conversationId,
        $visitorName = null,
        $closedBy = 'visitor',
        $closeReason = null,
        $rating = null,
        $ratingComment = null
    ) {
        try {
            // Load user settings if not already loaded
            if (!$user->relationLoaded('usersettings')) {
                $user->load('usersettings');
            }

            // Build notification title and body
            $title = 'Conversation Closed';

            if ($closedBy === 'visitor') {
                $body = $visitorName
                    ? "{$visitorName} has closed the conversation"
                    : "A visitor has closed the conversation";
            } else {
                $body = "Conversation with " . ($visitorName ?? "visitor") . " was closed";
            }

            // Add rating to body if available
            if ($rating) {
                $body .= " - Rating: {$rating}/5";
                if ($ratingComment) {
                    $body .= " - Feedback: " . substr($ratingComment, 0, 50);
                }
            }

            // Prepare notification data
            $notificationData = [
                'title' => $title,
                'body' => $body,
                'conversation_id' => $conversationId,
                'visitor_name' => $visitorName,
                'closed_by' => $closedBy,
                'close_reason' => $closeReason,
                'rating' => $rating,
                'rating_comment' => $ratingComment,
            ];

            // 1. FIREBASE NOTIFICATION (controlled by push_enabled)
            if ($user->usersettings && $user->usersettings->push_enabled) {
                $this->sendFirebaseConversationClosed($user, $notificationData);

                // 2. DATABASE NOTIFICATION (controlled by push_enabled)
                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'App\Notifications\ConversationClosed',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode($notificationData),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                Log::info("Database notification created for user {$user->id}: conversation_closed");
            } else {
                Log::info("User {$user->id} has push notifications disabled, skipping Firebase and database notifications");
            }

            // 3. EMAIL NOTIFICATION (controlled by email_enabled)
            if ($user->usersettings && $user->usersettings->email_enabled) {
                $this->sendEmailConversationClosed($user, $notificationData);
            } else {
                Log::info("User {$user->id} has email notifications disabled, skipping email");
            }

        } catch (\Exception $e) {
            Log::error('Failed to send conversation closed notification: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
        }
    }

    /**
     * Send Firebase notification for conversation closed
     *
     * @param User $user
     * @param array $notificationData
     * @return void
     */
    private function sendFirebaseConversationClosed(User $user, array $notificationData)
    {
        try {
            // Get all devices with FCM tokens
            $devices = $user->devices()->whereNotNull('fcm_token')->get();

            if ($devices->isEmpty()) {
                Log::info("User {$user->id} has no devices with FCM tokens, skipping Firebase notification");
                return;
            }

            $messaging = Firebase::messaging();
            $notification = Notification::create($notificationData['title'], $notificationData['body']);

            $sentCount = 0;
            $failCount = 0;

            // Send to each device
            foreach ($devices as $device) {
                try {
                    $fcmData = [
                        'conversation_id' => (string)$notificationData['conversation_id'],
                        'type' => 'conversation_closed',
                        'closed_by' => (string)($notificationData['closed_by'] ?? ''),
                        'visitor_name' => (string)($notificationData['visitor_name'] ?? ''),
                        'close_reason' => (string)($notificationData['close_reason'] ?? ''),
                        'timestamp' => (string)now()->timestamp,
                        'sound_enabled' => (string)($user->usersettings->sound_enabled ?? true),
                    ];

                    // Add rating data if available
                    if (!empty($notificationData['rating'])) {
                        $fcmData['rating'] = (string)$notificationData['rating'];
                    }
                    if (!empty($notificationData['rating_comment'])) {
                        $fcmData['rating_comment'] = (string)$notificationData['rating_comment'];
                    }

                    $message = CloudMessage::withTarget('token', $device->fcm_token)
                        ->withNotification($notification)
                        ->withData($fcmData);

                    $messaging->send($message);
                    $sentCount++;

                    // Update last_used_at to track active devices
                    $device->update(['last_used_at' => now()]);

                    Log::info("Firebase conversation closed notification sent to user {$user->id} device {$device->id} ({$device->platform}) for conversation {$notificationData['conversation_id']}");

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

            Log::info("Firebase conversation closed notification summary for user {$user->id}: {$sentCount} sent, {$failCount} failed");

        } catch (\Exception $e) {
            Log::error('Failed to send Firebase conversation closed notification: ' . $e->getMessage());
        }
    }

    /**
     * Send email notification for conversation closed
     *
     * @param User $user
     * @param array $notificationData
     * @return void
     */
    private function sendEmailConversationClosed(User $user, array $notificationData)
    {
        try {
            $emailData = [
                'subject' => 'Conversation Closed - ' . config('app.name'),
                'response' => $notificationData['body'],
                'type' => 'info',
                'conversation_id' => $notificationData['conversation_id'],
                'visitor_name' => $notificationData['visitor_name'],
                'rating' => $notificationData['rating'],
                'rating_comment' => $notificationData['rating_comment'],
            ];

            \Illuminate\Support\Facades\Mail::to($user->email)
                ->send(new \App\Mail\GeneralNotificationMail($emailData));

            Log::info("Email conversation closed notification sent to user {$user->id} ({$user->email})");

        } catch (\Exception $e) {
            Log::error('Failed to send email conversation closed notification: ' . $e->getMessage());
        }
    }

    /**
     * Send force logout notification to all other user devices
     *
     * @param User $user The user who just logged in
     * @param string|null $currentFcmToken The FCM token of current device (to exclude)
     * @return void
     */
    public function forceLogoutOtherDevices(User $user, $currentFcmToken = null)
    {
        try {
            // Get all devices except current one
            $query = $user->devices()->whereNotNull('fcm_token');

            if ($currentFcmToken) {
                $query->where('fcm_token', '!=', $currentFcmToken);
            }

            $devices = $query->get();

            if ($devices->isEmpty()) {
                Log::info("User {$user->id} has no other devices to logout");
                return;
            }

            $messaging = Firebase::messaging();
            $sentCount = 0;

            foreach ($devices as $device) {
                try {
                    $fcmData = [
                        'type' => 'force_logout',
                        'message' => 'Your account has been logged in from another device',
                        'timestamp' => (string)now()->timestamp,
                    ];

                    Log::info("🔴 FCM Event Firing: force_logout", [
                        'event' => 'force_logout',
                        'user_id' => $user->id,
                        'device_id' => $device->id,
                        'platform' => $device->platform,
                        'data' => $fcmData
                    ]);

                    $message = CloudMessage::withTarget('token', $device->fcm_token)
                        ->withData($fcmData);

                    $messaging->send($message);
                    $sentCount++;

                    Log::info("✅ Force logout notification sent to user {$user->id} device {$device->id} ({$device->platform})");

                    // Delete the device token after successful notification
                    // This ensures old sessions can't receive notifications anymore
                    $device->delete();
                    Log::info("🗑️ Deleted device {$device->id} token after force logout notification");

                } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                    Log::warning("Invalid FCM token for device {$device->id}, removing: " . $e->getMessage());
                    $device->delete();
                } catch (\Exception $e) {
                    Log::error("Failed to send force logout to device {$device->id}: " . $e->getMessage());
                    // Delete device even if notification failed to prevent orphaned tokens
                    $device->delete();
                    Log::info("🗑️ Deleted device {$device->id} token after failed notification attempt");
                }
            }

            Log::info("Force logout summary for user {$user->id}: {$sentCount} notifications sent to other devices");

        } catch (\Exception $e) {
            Log::error('Failed to send force logout notifications: ' . $e->getMessage());
        }
    }
}