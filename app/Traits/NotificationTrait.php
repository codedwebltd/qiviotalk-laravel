<?php
namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use stdClass;

trait NotificationTrait
{
    protected function getNotificationData()
    {
        $notification_count = 0;
        $unread_notification_count = 0;
        $notification_message = '';
        
        if (Auth::check()) {
            $user = Auth::user();
            $notification_count = $user->notifications()->count();
            $unread_notification_count = $user->unreadNotifications()->count();
        }

        // Admin latest notification
        $notifyable = DB::table('notifications')
            ->orderBy("id", "DESC")
            ->first();

        if ($notifyable) {
            try {
                $data = is_string($notifyable->data) 
                    ? json_decode($notifyable->data, true) 
                    : (is_array($notifyable->data) ? $notifyable->data : []);

                $notification_message = $data['message']['message'] 
                    ?? $data['message'] 
                    ?? $data['body'] 
                    ?? '';
            } catch (\Exception $e) {
                Log::warning('Error parsing notification data: ' . $e->getMessage());
                $notification_message = '';
            }
        }

        return [
            'notification_count' => $notification_count,
            'unread_notification_count' => $unread_notification_count,
            'notification_message' => $notification_message,
        ];
    }
}