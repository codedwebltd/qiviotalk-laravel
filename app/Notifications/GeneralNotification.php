<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class GeneralNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private $notificationData;

    public function __construct($data)
    {
        $this->notificationData = $data;
    }

    public function via($notifiable)
    {
        // Check user settings for push notifications (database notifications)
        $userSettings = $notifiable->settings;

        if ($userSettings && $userSettings->push_notifications) {
            return ['database'];
        }

        // Return empty array if push notifications are disabled
        //return [];
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'message' => $this->notificationData['message'],
            'type' => $this->notificationData['type'] ?? 'info',
            'subject' => $this->notificationData['subject'] ?? 'Notification',
            'created_at' => now(),
        ];
    }
}