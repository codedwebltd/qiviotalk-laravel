<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $perPage = $request->input('per_page', 20);

        $notifications = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', 'App\Models\User')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'notifications' => $notifications->items(),
            'pagination' => [
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'from' => $notifications->firstItem(),
                'to' => $notifications->lastItem(),
            ]
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $updated = DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        if ($updated) {
            return response()->json([
                'status' => 'success',
                'message' => 'Notification marked as read',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Notification not found or already read',
        ], 404);
    }

    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications marked as read',
        ]);
    }

    public function delete(Request $request, $id)
    {
        $user = $request->user();

        $deleted = DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_id', $user->id)
            ->delete();

        if ($deleted) {
            return response()->json([
                'status' => 'success',
                'message' => 'Notification deleted',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'Notification not found',
        ], 404);
    }

    public function deleteAll(Request $request)
    {
        $user = $request->user();

        $deleted = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'All notifications deleted',
            'deleted_count' => $deleted,
        ]);
    }
}
