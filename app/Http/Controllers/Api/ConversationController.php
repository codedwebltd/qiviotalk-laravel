<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Widget;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Traits\LocationTrait;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Events\NewConversationStarted;
use App\Events\ConversationClosed;
use App\Services\NewConversationService;
use App\Services\AiChatService;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    use LocationTrait;
    /**
     * Start a new conversation from widget
     */
    public function start(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'first_message' => 'required|string',
            'visitor_name' => 'nullable|string|max:255',
            'visitor_email' => 'nullable|email|max:255',
            'meta_data' => 'nullable|array',
            'page_url' => 'nullable|string|url', // Initial page URL
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }


        $locationData = $this->extractLocationData($request->ip());

        $widget = Widget::where('widget_key', $request->widget_key)->first();
        if (!$widget) {
            return response()->json([
                'status' => 'error',
                'message' => 'Widget not found'
            ], 404);
        }

        // Check if widget owner can create conversation
        $owner = $widget->user;
        if (!$owner->features()->canUse('conversation')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation limit reached for this account. Please upgrade your plan.',
                'limit_reached' => true
            ], 403);
        }

        // Create a visitor ID if not provided
        $visitorId = $request->visitor_id ?? uniqid('visitor_', true);
        Log::info("Conversation start - Received visitor_id from request: " . ($request->visitor_id ?? 'NULL (generated new)') . ", Final visitor_id: {$visitorId}");

        //Create new conversation with enhanced metadata
        $metaData = [
            'location' => $locationData,
            'browser_capabilities' => json_decode($request->browser_capabilities, true),
            'visitor_url' => $request->visitor_url,
            'visitor_platform' => $request->visitor_platform,
            'visitor_screen_resolution' => $request->visitor_screen_resolution,
            'visitor_timezone' => $request->visitor_timezone
        ];

        // Add initial page to visitor_pages array
        if ($request->has('page_url') && !empty($request->page_url)) {
            $metaData['visitor_pages'] = [$request->page_url];
        }

        $conversation = Conversation::create([
            'widget_id' => $widget->id,
            'visitor_id' => $visitorId,
            'visitor_name' => $request->visitor_name,
            'visitor_email' => $request->visitor_email,
            'visitor_ip' => $request->ip(),
            'visitor_user_agent' => $request->header('User-Agent'),
            'visitor_referrer' => $request->header('Referer'),
            'visitor_language' => $request->header('Accept-Language'),
            'first_message' => $request->first_message,
            'status' => 'open',
            'is_read' => false,
            'has_new_messages' => true,
            'last_message_at' => now(),
            'meta_data' => $metaData,
        ]);

        // Create first message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'type' => 'text',
            'sender_type' => 'visitor',
            'content' => $request->first_message,
            'is_delivered' => true,
            'delivered_at' => now(),
        ]);

        // Increment conversation usage
        $owner->features()->incrementUsage('conversation');

        // AI-powered auto-reply
        $autoReply = null;
        $agent = User::find($widget->user_id);

        if ($agent && $agent->aiSetting && $agent->aiSetting->enabled && $agent->aiSetting->auto_reply) {
            try {
                $aiChatService = app(AiChatService::class);
                $greeting = $aiChatService->generateGreeting($request->first_message, $agent->aiSetting);

                // Broadcast typing indicator before greeting
                broadcast(new \App\Events\TypingEvent($conversation->id, true, null, 'bot'))->toOthers();

                // Add small delay for greeting (1 second)
                usleep(1000000);

                $autoReply = Message::create([
                    'conversation_id' => $conversation->id,
                    'type' => 'text',
                    'sender_type' => 'bot',
                    'content' => $greeting,
                    'is_delivered' => true,
                    'delivered_at' => now(),
                ]);

                // Stop typing indicator
                broadcast(new \App\Events\TypingEvent($conversation->id, false, null, 'bot'))->toOthers();

                $conversation->last_message_at = now();
                $conversation->save();

                // Broadcast the AI greeting message
                $autoReply->sender_name = config('aiconfig.display.bot_name', 'AI Assistant');
                broadcast(new \App\Events\NewMessage($autoReply))->toOthers();

                // Increment AI response usage
                $owner->features()->incrementUsage('ai_response');

         // 🆕 ADD THIS LINE - Broadcast new ai conversation event
        broadcast(new \App\Events\NewConversationStarted($conversation))->toOthers();

                Log::info("AI greeting sent for conversation {$conversation->id}");
            } catch (\Exception $e) {
                Log::error("Failed to generate AI greeting: " . $e->getMessage());
            }
        }
        // Fallback to basic auto-reply if AI is not enabled
        elseif (isset($widget->auto_reply_enabled) && $widget->auto_reply_enabled && !empty($widget->auto_reply_message)) {
            $autoReply = Message::create([
                'conversation_id' => $conversation->id,
                'type' => 'text',
                'sender_type' => 'bot',
                'content' => $widget->auto_reply_message,
                'is_delivered' => true,
                'delivered_at' => now(),
            ]);

            $conversation->last_message_at = now();
            $conversation->save();

            // Broadcast the auto-reply message
            $autoReply->sender_name = config('aiconfig.display.bot_name', 'AI Assistant');
            broadcast(new \App\Events\NewMessage($autoReply))->toOthers();

             //🆕 ADD THIS LINE - Broadcast new conversation event
              broadcast(new \App\Events\NewConversationStarted($conversation))->toOthers();

        }


        $agent = User::find($conversation->widget->user->id);
        if ($agent) {
            // Check if this is a returning visitor
            $previousConversations = Conversation::where('widget_id', $widget->id)
                ->where('visitor_id', $visitorId)
                ->where('id', '!=', $conversation->id)
                ->count();

            $isReturning = $previousConversations > 0;
            $country = $locationData['country']['name'] ?? null;

            Log::info("Visitor check - visitor_id: {$visitorId}, widget_id: {$widget->id}, previous_conversations: {$previousConversations}, is_returning: " . ($isReturning ? 'YES' : 'NO') . ", country: " . ($country ?? 'N/A'));

            app(NewConversationService::class)->notifyUserOfNewConversation(
                $agent,
                $conversation->id,
                $conversation->visitor_name,
                $isReturning,
                $country
            );
            Log::info("Firebase notification triggered for agent {$agent->id} for new conversation {$conversation->id} - Returning: " . ($isReturning ? 'Yes' : 'No') . ", Country: " . ($country ?? 'N/A'));
        }

        // Add sender names for widget display
        $message->sender_name = null; // Visitor doesn't need name
        if ($autoReply) {
            $autoReply->sender_name = config('aiconfig.display.bot_name', 'AI Assistant');
        }


         // 🆕 ADD THIS LINE - Broadcast new conversation event
        broadcast(new \App\Events\NewConversationStarted($conversation))->toOthers();
        Log::alert("General  conversation broadcast: ID {$conversation->id} for widget {$widget->id}");

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation started',
            'conversation_id' => $conversation->id,
            'visitor_id' => $visitorId,
            'first_message' => $message,
            'auto_reply' => $autoReply ?? null
        ]);
    }

    /**
     * Get a conversation by ID (for agents)
     */
    public function get($id)
    {
        $user = Auth::user();
        $conversation = Conversation::with('messages')->find($id);

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }

        // Check if widget belongs to the user's company
        if ($conversation->widget->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Mark as read if it wasn't already
        if (!$conversation->is_read) {
            $conversation->markAsRead();
        }

        return response()->json([
            'status' => 'success',
            'conversation' => $conversation,
            'messages' => $conversation->messages
        ]);
    }

    /**
     * Get visitor conversation history by visitor ID
     */
    public function getVisitorHistory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'visitor_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $widget = Widget::where('widget_key', $request->widget_key)->first();

        $conversations = Conversation::where('widget_id', $widget->id)
            ->where('visitor_id', $request->visitor_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'conversations' => $conversations
        ]);
    }

    /**
     * List conversations for the authenticated user's widgets
     */
    public function list(Request $request)
    {
        $user = Auth::user();
        $status = $request->status ?? 'open';
        $limit = min(100, $request->limit ?? 20);
        $page = max(1, $request->page ?? 1);

        $query = Conversation::whereHas('widget', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });

        // Filter by status
        if ($status && in_array($status, ['open', 'closed', 'archived'])) {
            $query->where('status', $status);
        }

        // Filter by search query
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('visitor_name', 'like', "%{$request->search}%")
                    ->orWhere('visitor_email', 'like', "%{$request->search}%")
                    ->orWhere('first_message', 'like', "%{$request->search}%");
            });
        }

        // Get total count before pagination
        $totalCount = $query->count();

        // Apply ordering and pagination
        $conversations = $query->with(['lastMessage'])
            ->orderBy('last_message_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $limit)
            ->take($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'conversations' => $conversations,
            'total' => $totalCount,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($totalCount / $limit)
        ]);
    }

    /**
     * Close a conversation
     */
    public function close(Request $request, $id)
    {
        $user = Auth::user();
        $conversation = Conversation::find($id);

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }

        // Check if widget belongs to the user's company
        if ($conversation->widget->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $conversation->close($user->id, $request->reason);

        // Add system message about closing
        Message::create([
            'conversation_id' => $conversation->id,
            'type' => 'system',
            'sender_type' => 'system',
            'content' => 'Conversation closed by ' . $user->name,
        ]);

        // Broadcast conversation closed event
        broadcast(new ConversationClosed($conversation))->toOthers();

        // Send Firebase, database, and email notifications to widget owner
        $agent = User::find($conversation->widget->user_id);
        if ($agent) {
            app(NewConversationService::class)->notifyUserOfConversationClosed(
                $agent,
                $conversation->id,
                $conversation->visitor_name,
                'agent',
                $request->reason,
                $conversation->rating,
                $conversation->rating_comment
            );
            Log::info("Conversation closed notification sent to agent {$agent->id} for conversation {$conversation->id}");
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation closed successfully',
            'conversation' => $conversation
        ]);
    }

    /**
     * Reopen a closed conversation
     */
    public function reopen($id)
    {
        $user = Auth::user();
        $conversation = Conversation::find($id);

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }

        // Check if widget belongs to the user's company
        if ($conversation->widget->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $conversation->reopen();

        // Add system message about reopening
        Message::create([
            'conversation_id' => $conversation->id,
            'type' => 'system',
            'sender_type' => 'system',
            'content' => 'Conversation reopened by ' . $user->name,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation reopened successfully',
            'conversation' => $conversation
        ]);
    }

    /**
     * Archive a conversation
     */
    public function archive($id)
    {
        $user = Auth::user();
        $conversation = Conversation::find($id);

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }

        // Check if widget belongs to the user's company
        if ($conversation->widget->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access'
            ], 403);
        }

        $conversation->archive();

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation archived successfully',
            'conversation' => $conversation
        ]);
    }

    /**
     * Rate a conversation from a visitor
     */
    public function rateConversation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'conversation_id' => 'required|integer|exists:conversations,id',
            'rating' => 'nullable|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $widget = Widget::where('widget_key', $request->widget_key)->first();
        $conversation = Conversation::find($request->conversation_id);

        // Check if conversation belongs to widget
        if ($conversation->widget_id !== $widget->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found for this widget'
            ], 404);
        }

        // Update conversation with rating
        $updateData = [];

        if ($request->has('rating')) {
            $updateData['rating'] = $request->rating;
        }

        if ($request->has('comment')) {
            $updateData['rating_comment'] = $request->comment;
        }

        $conversation->update($updateData);

        // Add system message about rating
        if ($request->has('rating')) {
            Message::create([
                'conversation_id' => $conversation->id,
                'type' => 'system',
                'sender_type' => 'system',
                'content' => 'Visitor rated this conversation: ' . $request->rating . ' stars',
            ]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation rated successfully'
        ]);
    }

    /**
     * Close a conversation from visitor side
     */
    public function closeFromVisitor(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'conversation_id' => 'required|integer|exists:conversations,id',
            'close_reason' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $widget = Widget::where('widget_key', $request->widget_key)->first();
        $conversation = Conversation::find($request->conversation_id);

        // Check if conversation belongs to widget
        if ($conversation->widget_id !== $widget->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found for this widget'
            ], 404);
        }

        // Close the conversation
        $conversation->update([
            'status' => 'closed',
            'closed_at' => now(),
            'close_reason' => $request->close_reason ?? 'visitor_closed'
        ]);

        // Add system message
        Message::create([
            'conversation_id' => $conversation->id,
            'type' => 'system',
            'sender_type' => 'system',
            'content' => 'Conversation closed by visitor'
        ]);

        // Broadcast conversation closed event
        broadcast(new ConversationClosed($conversation))->toOthers();

        // Send Firebase, database, and email notifications to widget owner
        $agent = User::find($widget->user_id);
        if ($agent) {
            app(NewConversationService::class)->notifyUserOfConversationClosed(
                $agent,
                $conversation->id,
                $conversation->visitor_name,
                'visitor',
                $request->close_reason ?? 'visitor_closed',
                $conversation->rating,
                $conversation->rating_comment
            );
            Log::info("Conversation closed notification sent to agent {$agent->id} for conversation {$conversation->id} - Closed by visitor with rating: " . ($conversation->rating ?? 'none'));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Conversation closed successfully'
        ]);
    }

    /**
     * Get conversation status for a visitor
     */
    public function getStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'conversation_id' => 'required|integer|exists:conversations,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $widget = Widget::where('widget_key', $request->widget_key)->first();
        $conversation = Conversation::find($request->conversation_id);

        // Check if conversation is related to the widget
        if ($conversation->widget_id !== $widget->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found for this widget'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'conversation' => [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'created_at' => $conversation->created_at,
                'last_message_at' => $conversation->last_message_at,
                'closed_at' => $conversation->closed_at
            ]
        ]);
    }
}
