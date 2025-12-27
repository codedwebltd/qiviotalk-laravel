<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Widget;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Events\NewMessage;

class ConversationController extends Controller
{
    public function index()
    {
        $conversations = Conversation::with('widget')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = [
            'total' => Conversation::count(),
            'open' => Conversation::where('status', 'open')->count(),
            'closed' => Conversation::where('status', 'closed')->count(),
            'new' => Conversation::where('has_new_messages', true)->count(),
        ];

        return Inertia::render('Admin/Conversations/Index', [
            'conversations' => $conversations,
            'stats' => $stats,
        ]);
    }

    public function show($id)
    {
        $conversation = Conversation::with([
            'widget.user.subscription',
            'widget.user.aiSetting',
            'closedByUser',
        ])->findOrFail($id);

        // Ensure meta_data is properly decoded
        if (is_string($conversation->meta_data)) {
            $conversation->meta_data = json_decode($conversation->meta_data, true);
        }

        if (!$conversation->is_read) {
            $conversation->markAsRead();
        }

        $messagesDesc = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get();

        $oldestMessageId = $messagesDesc->count() > 0 ? $messagesDesc->min('id') : null;
        $messages = $messagesDesc->reverse()->values();

        $hasMore = false;
        if ($oldestMessageId) {
            $hasMore = $conversation->messages()
                ->where('id', '<', $oldestMessageId)
                ->exists();
        }

        // Add widget owner stats
        if ($conversation->widget && $conversation->widget->user) {
            $userId = $conversation->widget->user->id;
            $conversation->widget->user->stats = [
                'total_widgets' => Widget::where('user_id', $userId)->count(),
                'total_conversations' => Conversation::whereHas('widget', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->count(),
                'total_messages' => Message::whereHas('conversation.widget', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->count(),
                'active_conversations' => Conversation::whereHas('widget', function($q) use ($userId) {
                    $q->where('user_id', $userId);
                })->where('status', 'open')->count(),
            ];
        }

        return Inertia::render('Admin/Conversations/Show', [
            'conversation' => $conversation,
            'initialMessages' => $messages,
            'hasMore' => $hasMore,
            'oldestMessageId' => $oldestMessageId,
        ]);
    }

    public function sendMessage(Request $request, $id)
    {
        $request->validate([
            'content' => 'required|string|max:5000',
        ]);

        $conversation = Conversation::findOrFail($id);

        if ($conversation->status !== 'open') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot send messages to closed conversations'
            ], 400);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'type' => 'text',
            'sender_type' => 'system',
            'content' => $request->content,
            'is_delivered' => true,
            'delivered_at' => now(),
        ]);

        $conversation->last_message_at = now();
        $conversation->save();

        broadcast(new NewMessage($message))->toOthers();

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully',
            'data' => $message
        ]);
    }

    public function getMessages($id)
    {
        $conversation = Conversation::findOrFail($id);

        $limit = request()->input('limit', 20);
        $query = $conversation->messages();

        if (request()->has('before_id')) {
            $query->where('id', '<', request()->before_id);
        }

        $messagesDesc = $query->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();

        $oldestLoadedId = $messagesDesc->count() > 0 ? $messagesDesc->min('id') : null;
        $messages = $messagesDesc->reverse()->values();

        $hasMore = false;
        if ($oldestLoadedId) {
            $hasMore = $conversation->messages()
                ->where('id', '<', $oldestLoadedId)
                ->exists();
        }

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
            'has_more' => $hasMore,
            'oldest_message_id' => $oldestLoadedId
        ]);
    }

    public function close($id)
    {
        $conversation = Conversation::findOrFail($id);
        $conversation->status = 'closed';
        $conversation->closed_at = now();
        $conversation->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation closed successfully'
        ]);
    }

    public function reopen($id)
    {
        $conversation = Conversation::findOrFail($id);
        $conversation->status = 'open';
        $conversation->closed_at = null;
        $conversation->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation reopened successfully'
        ]);
    }
}
