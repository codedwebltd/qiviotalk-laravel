<?php

namespace App\Traits;

use App\Models\User;
use App\Mail\WelcomeUserMail;
use App\Mail\GeneralNotificationMail;
use App\Notifications\GeneralNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

trait EmailNotificationTrait
{
   public function ActionNotification($userId, $message): void
{
    try {
        Log::info('ActionNotification called', ['user_id' => $userId, 'message' => $message]);

        $user = User::with('usersettings')->find($userId);
        if (!$user) {
            Log::error('User not found for notification', ['user_id' => $userId]);
            return;
        }

        Log::info('User found', ['user' => $user->name, 'settings' => $user->usersettings]);

        // Check if user has email notifications enabled and send email
        if ($user->usersettings && $user->usersettings->email_enabled) {
            Mail::to($user->email)->send(new GeneralNotificationMail($message));
            Log::info('Email sent to user', ['user_id' => $user->id]);
        } else {
            Log::info('Email notification skipped - user has email notifications disabled', ['user_id' => $user->id]);
        }

        // Prepare notification data for database storage
        $notificationData = [
            'message' => $message['response'],
            'subject' => $message['subject'] ?? 'Notification from ' . config('app.name'),
            'type' => $message['type'] ?? 'info'
        ];

        Log::info('About to send database notification', ['data' => $notificationData]);

        // Send database notification (only if user has push notifications enabled)
        if ($user->usersettings && $user->usersettings->push_enabled) {
            $result = $user->notify(new GeneralNotification($notificationData));
            Log::info('Database notification sent', ['result' => $result, 'user_id' => $user->id]);

            // Verify notification was created
            $latestNotification = $user->notifications()->latest()->first();
            Log::info('Latest user notification after sending', ['notification' => $latestNotification ? $latestNotification->toArray() : null]);
        } else {
            Log::info('Database notification skipped - user has push notifications disabled', ['user_id' => $user->id]);
        }

        // Notify admin if required
        if ($message['notify_admin'] ?? false) {
            $adminEmail = config('app.admin_email', 'dakingeorge58@gmail.com');
            Mail::to($adminEmail)->send(new GeneralNotificationMail($message));
            Log::info('Admin email sent');
        }

    } catch (\Exception $e) {
        Log::error('Notification failed', [
            'user_id' => $userId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
}
    

    public function sendEmailVerification(User $user): void
    {
        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            Log::error('Email verification failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
