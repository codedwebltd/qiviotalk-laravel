<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Message;
use App\Events\NewMessage;
use App\Events\TypingEvent;
use App\Models\Conversation;
use Illuminate\Http\Request;
use App\Events\AgentTypingEvent;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\NewConversationService;
use App\Services\AiChatService;
use App\Services\TranslationService;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    /**
     * Log execution time for performance monitoring
     */
    private function logExecutionTime($method, $startTime, $additionalData = [])
    {
        $executionTime = round((microtime(true) - $startTime) * 1000, 2);
        Log::info("⏱️ {$method} execution time: {$executionTime}ms", array_merge([
            'execution_time_ms' => $executionTime,
        ], $additionalData));
        return $executionTime;
    }

    /**
     * Handle file upload for messages (multipart or base64)
     * Returns array with file data or null if no file
     */
    private function handleFileUpload(Request $request, $widgetId)
    {
        // Check for base64 file upload first (from mobile app)
        if ($request->has('file') && is_array($request->file)) {
            return $this->handleBase64FileUpload($request, $widgetId);
        }

        // Traditional multipart file upload
        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return null;
        }

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileType = $file->getMimeType();

        // Determine message type based on file mime type
        $type = strpos($fileType, 'image/') === 0 ? 'image' : 'file';

        // Use FileUploadService for cloud storage
        $fileUploadService = app(\App\Services\FileUploadService::class);
        $directory = 'livechat/chat/attachments';

        $result = $fileUploadService->uploadFile($file, $directory, $widgetId);

        if (!$result['success']) {
            throw new \Exception('File upload failed');
        }

        return [
            'type' => $type,
            'file_url' => $result['url'],
            'file_name' => $fileName,
            'file_type' => $result['type'],
            'file_size' => $result['size'],
        ];
    }

    /**
     * Handle base64 encoded file upload (from mobile app)
     */
    private function handleBase64FileUpload(Request $request, $widgetId)
    {
        $fileData = $request->file;

        if (!isset($fileData['data']) || !isset($fileData['fileName']) || !isset($fileData['mimeType'])) {
            return null;
        }

        Log::info('Processing base64 file upload', [
            'fileName' => $fileData['fileName'],
            'mimeType' => $fileData['mimeType']
        ]);

        // Extract base64 data (remove data:image/png;base64, prefix)
        $base64String = $fileData['data'];
        if (preg_match('/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+);base64,(.+)$/', $base64String, $matches)) {
            $mimeType = $matches[1];
            $base64Data = $matches[2];
        } else {
            throw new \Exception('Invalid base64 file format');
        }

        // Decode base64
        $decodedFile = base64_decode($base64Data);
        if ($decodedFile === false) {
            throw new \Exception('Failed to decode base64 file');
        }

        // Create temp file
        $tempPath = tempnam(sys_get_temp_dir(), 'upload_');
        file_put_contents($tempPath, $decodedFile);

        // Create UploadedFile instance
        $uploadedFile = new \Illuminate\Http\UploadedFile(
            $tempPath,
            $fileData['fileName'],
            $mimeType,
            null,
            true
        );

        // Determine message type
        $type = strpos($mimeType, 'image/') === 0 ? 'image' : 'file';

        // Use FileUploadService
        $fileUploadService = app(\App\Services\FileUploadService::class);
        $directory = 'livechat/chat/attachments';

        $result = $fileUploadService->uploadFile($uploadedFile, $directory, $widgetId);

        // Clean up temp file
        @unlink($tempPath);

        if (!$result['success']) {
            throw new \Exception('File upload failed');
        }

        return [
            'type' => $type,
            'file_url' => $result['url'],
            'file_name' => $fileData['fileName'],
            'file_type' => $result['type'],
            'file_size' => $result['size'],
        ];
    }

    /**
     * Send a message from visitor
     */
    public function sendFromVisitor(Request $request)
    {
    $startTime = microtime(true);

    // Log incoming request data for debugging
    Log::info('Received message from visitor', [
        'has_file' => $request->hasFile('file'),
        'file_valid' => $request->hasFile('file') ? $request->file('file')->isValid() : 'N/A',
        'content_length' => strlen($request->content ?? ''),
    ]);

    $validator = Validator::make($request->all(), [
        'widget_key' => 'required|string|exists:widgets,widget_key',
        'conversation_id' => 'required|integer|exists:conversations,id',
        'content' => 'required_without:file|string|nullable',
        'file' => 'nullable|file|max:50240', // 50MB max file size
        'page_url' => 'nullable|string|url', // Current page URL from widget
    ]);

    if ($validator->fails()) {
        Log::error('Validation failed for message', [
            'errors' => $validator->errors()->toArray()
        ]);

        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

        // Use eager loading to prevent N+1 queries
        $conversation = Conversation::with(['widget.user'])->find($request->conversation_id);

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }

        $widget = $conversation->widget;

        // Verify widget_key matches
        if ($widget->widget_key !== $request->widget_key) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid widget key for this conversation'
            ], 403);
        }

        // Check if conversation is open
        if ($conversation->status !== 'open') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot send messages to closed or archived conversations'
            ], 400);
        }

        // Handle file upload if present
        $fileData = null;
        try {
            $fileData = $this->handleFileUpload($request, $widget->id);
        } catch (\Exception $e) {
            Log::error('File upload failed in sendFromVisitor: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'File upload failed'
            ], 500);
        }

        $type = $fileData['type'] ?? 'text';
        $fileUrl = $fileData['file_url'] ?? null;
        $fileName = $fileData['file_name'] ?? null;
        $fileType = $fileData['file_type'] ?? null;
        $fileSize = $fileData['file_size'] ?? null;

        // Translation logic for visitor messages
        $originalContent = $request->content ?? '';
        $translatedContent = $originalContent;
        $detectedLanguage = $conversation->visitor_language;
        $messageMetaData = [];

        // Only translate text messages with content
        if ($type === 'text' && !empty($originalContent)) {
            $translationService = app(TranslationService::class);

            // Translate visitor message to English
            $translationResult = $translationService->translateVisitorToEnglish(
                $originalContent,
                $conversation->visitor_language
            );

            $translatedContent = $translationResult['text'];
            $detectedLanguage = $translationResult['detected_language'];

            // Store original content in meta_data if it was translated
            if ($detectedLanguage !== 'en' && $translatedContent !== $originalContent) {
                $messageMetaData['original_content'] = $originalContent;
                $messageMetaData['original_language'] = $detectedLanguage;

                Log::info('Message translated', [
                    'conversation_id' => $conversation->id,
                    'from_language' => $detectedLanguage,
                    'original_preview' => substr($originalContent, 0, 50),
                    'translated_preview' => substr($translatedContent, 0, 50)
                ]);
            }

            // Update conversation language if not set or changed
            if (empty($conversation->visitor_language) || $conversation->visitor_language !== $detectedLanguage) {
                $conversation->visitor_language = $detectedLanguage;
                Log::info('Conversation language updated', [
                    'conversation_id' => $conversation->id,
                    'language' => $detectedLanguage
                ]);
            }
        }

        // Create message (store English translation for agent to see)
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'type' => $type,
            'sender_type' => 'visitor',
            'content' => $translatedContent, // Store English translation
            'file_url' => $fileUrl,
            'file_name' => $fileName,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'is_delivered' => true,
            'delivered_at' => now(),
            'meta_data' => !empty($messageMetaData) ? $messageMetaData : null,
        ]);

        // Update visitor_pages in meta_data
        if ($request->has('page_url') && !empty($request->page_url)) {
            $metaData = $conversation->meta_data ?? [];

            // Initialize visitor_pages array if not exists
            if (!isset($metaData['visitor_pages'])) {
                $metaData['visitor_pages'] = [];
            }

            // Add page URL if not already in the array (avoid duplicates)
            if (!in_array($request->page_url, $metaData['visitor_pages'])) {
                $metaData['visitor_pages'][] = $request->page_url;
            }

            $conversation->meta_data = $metaData;
        }

        // Update conversation
        $conversation->last_message_at = now();
        $conversation->has_new_messages = true;
        $conversation->is_read = false;
        $conversation->save();

        broadcast(new NewMessage($message))->toOthers();

        // AI-powered response
        $aiResponse = null;
        $agent = $conversation->widget->user; // Already eager loaded

        // Check if human agent has taken over recently
        // Use direct query to avoid caching issues
        $lastAgentMessage = Message::where('conversation_id', $conversation->id)
            ->where('sender_type', 'agent')
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        $agentActiveRecently = false;
        if ($lastAgentMessage) {
            $backoffMinutes = config('aiconfig.agent_takeover.backoff_minutes', 30);
            $minutesSinceAgent = now()->diffInMinutes($lastAgentMessage->created_at);
            $agentActiveRecently = $minutesSinceAgent < $backoffMinutes;

            Log::info("AI Backoff Check", [
                'last_agent_msg_id' => $lastAgentMessage->id,
                'minutes_since' => $minutesSinceAgent,
                'backoff_minutes' => $backoffMinutes,
                'agent_active' => $agentActiveRecently
            ]);
        }

        if ($agent && $agent->aiSetting && $agent->aiSetting->enabled && $agent->aiSetting->auto_reply && !$agentActiveRecently) {
            // Get global settings for AI limits
            $globalSettings = \App\Models\GlobalSetting::get();
            $maxResponsesPerConvo = $globalSettings->ai_max_responses_per_conversation ?? 6;
            $agentWaitMinutes = $globalSettings->ai_agent_wait_minutes ?? 30;

            // Get AI context to check response count
            $aiContext = \App\Models\AiConversationContext::where('conversation_id', $conversation->id)->first();
            $aiResponseCount = $aiContext->ai_responses_count ?? 0;

            // Check if AI response limit reached for this conversation
            if ($aiResponseCount >= $maxResponsesPerConvo) {
                // Check if agent wait time has passed since last AI response
                $canResumeAi = false;
                if ($aiContext && $aiContext->last_ai_response_at) {
                    $minutesSinceLastAi = now()->diffInMinutes($aiContext->last_ai_response_at);
                    $canResumeAi = $minutesSinceLastAi >= $agentWaitMinutes;
                }

                if (!$canResumeAi) {
                    // Send system message ONCE only
                    $lastSystemMsg = Message::where('conversation_id', $conversation->id)
                        ->where('sender_type', 'system')
                        ->where('content', 'like', '%agent will be with you%')
                        ->latest()
                        ->first();

                    // Only send if no recent system message (within 5 minutes)
                    $shouldSendSystemMsg = !$lastSystemMsg || $lastSystemMsg->created_at->diffInMinutes(now()) > 5;

                    if ($shouldSendSystemMsg) {
                        $aiResponse = Message::create([
                            'conversation_id' => $conversation->id,
                            'type' => 'text',
                            'sender_type' => 'system',
                            'content' => 'Thank you for your patience. A human agent will be with you shortly.',
                            'is_delivered' => true,
                            'delivered_at' => now(),
                        ]);

                        $aiResponse->sender_name = 'System';
                        broadcast(new NewMessage($aiResponse))->toOthers();

                        // Notify agent ONCE
                        app(NewConversationService::class)->notifyUserOfNewMessage(
                            $agent,
                            $conversation->id,
                            $message->content,
                            $conversation->visitor_name
                        );

                        Log::info("AI conversation limit reached ({$aiResponseCount}/{$maxResponsesPerConvo}), agent notified once");
                    }

                    return response()->json([
                        'status' => 'success',
                        'message' => 'Message sent successfully',
                        'data' => $message,
                        'ai_response' => null
                    ]);
                } else {
                    // Reset counter - agent didn't come, AI can resume
                    $aiContext->update(['ai_responses_count' => 0]);
                    Log::info("AI resuming after {$agentWaitMinutes} minute wait, counter reset");
                }
            }

            // Check subscription feature limit (for users without unlimited AI)
            if (!$agent->features()->canUse('ai_response')) {
                Log::warning("AI response limit reached for user {$agent->id}");

                // Send system message to inform visitor - DO NOT respond anymore
                $aiResponse = Message::create([
                    'conversation_id' => $conversation->id,
                    'type' => 'text',
                    'sender_type' => 'system',
                    'content' => 'Thank you for your patience. A human agent will be with you shortly.',
                    'is_delivered' => true,
                    'delivered_at' => now(),
                ]);

                $aiResponse->sender_name = 'System';
                broadcast(new NewMessage($aiResponse))->toOthers();

                // Notify agent immediately
                app(NewConversationService::class)->notifyUserOfNewMessage(
                    $agent,
                    $conversation->id,
                    $message->content,
                    $conversation->visitor_name
                );
            } else {
                try {
                    $aiChatService = app(AiChatService::class);
                    $result = $aiChatService->processMessage($message, $conversation, $agent->aiSetting);

                    // If no context or AI can't respond, send system message
                    if (!$result || !$result['should_respond']) {
                        // Check if this is an escalation with first_escalation flag
                        $isFirstEscalation = isset($result['first_escalation']) && $result['first_escalation'];
                        $isEscalation = isset($result['escalate_to_human']) && $result['escalate_to_human'];

                        // Send appropriate system message
                        if ($isFirstEscalation) {
                            // First time escalation - send "connecting to agent" message
                            $aiResponse = Message::create([
                                'conversation_id' => $conversation->id,
                                'type' => 'text',
                                'sender_type' => 'system',
                                'content' => 'Please hold on, connecting you to an agent...',
                                'is_delivered' => true,
                                'delivered_at' => now(),
                            ]);

                            $aiResponse->sender_name = 'System';
                            broadcast(new NewMessage($aiResponse))->toOthers();

                            Log::info("System message sent - first escalation to agent {$agent->id}");
                        } else if ($isEscalation) {
                            // Subsequent messages after escalation - send brief system message
                            $systemMessageContent = config('aiconfig.response.escalation_system_message', 'An agent will be with you shortly.');

                            $aiResponse = Message::create([
                                'conversation_id' => $conversation->id,
                                'type' => 'text',
                                'sender_type' => 'system',
                                'content' => $systemMessageContent,
                                'is_delivered' => true,
                                'delivered_at' => now(),
                            ]);

                            $aiResponse->sender_name = 'System';
                            broadcast(new NewMessage($aiResponse))->toOthers();

                            Log::info("Escalation system message sent - agent already notified");
                        } else {
                            // Not an escalation, send generic system message
                            $aiResponse = Message::create([
                                'conversation_id' => $conversation->id,
                                'type' => 'text',
                                'sender_type' => 'system',
                                'content' => 'Please hold on, connecting you to an agent...',
                                'is_delivered' => true,
                                'delivered_at' => now(),
                            ]);

                            $aiResponse->sender_name = 'System';
                            broadcast(new NewMessage($aiResponse))->toOthers();

                            Log::info("System message sent - no escalation");
                        }

                        // Notify agent only on first escalation (already handled in AiChatService)
                        // This is just a fallback for non-escalation cases
                        if (!isset($result['escalate_to_human'])) {
                            app(NewConversationService::class)->notifyUserOfNewMessage(
                                $agent,
                                $conversation->id,
                                $message->content,
                                $conversation->visitor_name
                            );
                        }
                    } else if ($result['should_respond']) {
                    // Broadcast typing indicator before responding
                    broadcast(new TypingEvent($conversation->id, true, null, 'bot'))->toOthers();

                    // Add delay to simulate typing (1-3 seconds based on response length)
                    $responseLength = strlen($result['response']);
                    $delay = min(3, max(1, $responseLength / 100)); // 1-3 seconds
                    usleep($delay * 1000000); // Convert to microseconds

                    // Translate AI response to visitor's language
                    $aiResponseContent = $result['response'];
                    $aiMetaData = [];

                    if (!empty($conversation->visitor_language) && $conversation->visitor_language !== 'en') {
                        $translationService = app(TranslationService::class);
                        $translatedAiResponse = $translationService->translateAgentToVisitor(
                            $aiResponseContent,
                            $conversation->visitor_language
                        );

                        if ($translatedAiResponse !== $aiResponseContent) {
                            $aiMetaData['original_content'] = $aiResponseContent;
                            $aiMetaData['original_language'] = 'en';
                            $aiResponseContent = $translatedAiResponse;
                        }
                    }

                    // Create bot response message
                    $aiResponse = Message::create([
                        'conversation_id' => $conversation->id,
                        'type' => 'text',
                        'sender_type' => 'bot',
                        'content' => $aiResponseContent,
                        'is_delivered' => true,
                        'delivered_at' => now(),
                        'meta_data' => !empty($aiMetaData) ? $aiMetaData : null,
                    ]);

                    // Stop typing indicator
                    broadcast(new TypingEvent($conversation->id, false, null, 'bot'))->toOthers();

                    // Update conversation
                    $conversation->last_message_at = now();
                    $conversation->save();

                    // Increment AI response usage
                    $agent->features()->incrementUsage('ai_response');

                    // Set sender name before broadcasting
                    $aiResponse->sender_name = config('aiconfig.display.bot_name', 'AI Assistant');

                    Log::info("AI response sent for conversation {$conversation->id}", [
                        'from_cache' => $result['from_cache'] ?? false,
                        'escalate' => $result['escalate_to_human'] ?? false,
                    ]);

                    // If escalation needed, notify agent
                    if ($result['escalate_to_human'] && $agent) {
                        app(NewConversationService::class)->notifyUserOfNewMessage(
                            $agent,
                            $conversation->id,
                            $message->content,
                            $conversation->visitor_name
                        );
                        Log::info("Human escalation notification sent to agent {$agent->id}");
                    }

                          // Broadcast AI response with sender_name
                    broadcast(new NewMessage($aiResponse))->toOthers();

                    }
                } catch (\Exception $e) {
                    Log::error("Failed to generate AI response for conversation {$conversation->id}: " . $e->getMessage());
                }
            }
        }

        // Always send Firebase notification to agent when visitor sends a message
        if ($agent) {
            app(NewConversationService::class)->notifyUserOfNewMessage(
                $agent,
                $conversation->id,
                $message->content,
                $conversation->visitor_name
            );
            Log::info("Firebase notification triggered for agent {$agent->id} for new message in conversation {$conversation->id}");
        }

        // Add sender names for widget display
        $message->sender_name = null; // Visitor doesn't need name
        if ($aiResponse) {
            $aiResponse->sender_name = config('aiconfig.display.bot_name', 'AI Assistant');
        }

        // Log execution time
        $this->logExecutionTime('sendFromVisitor', $startTime, [
            'conversation_id' => $conversation->id,
            'has_ai_response' => $aiResponse !== null,
            'has_file' => $request->hasFile('file')
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully',
            'data' => $message,
            'ai_response' => $aiResponse
        ]);
    }

    public function newconnection()
    {
        Log::info('New visitor connection established.');
        return response()->json([
            'status' => 'success',
            'message' => 'New connection recorded'
        ]);

    }

    /**
     * Send a message from agent
     */
    public function sendFromAgent(Request $request, $conversationId)
    {
        $startTime = microtime(true);
        $user = Auth::user();

        Log::info('Agent sending message', [
            'conversation_id' => $conversationId,
            'has_file' => $request->has('file'),
            'file_is_array' => $request->has('file') && is_array($request->file),
            'has_content' => $request->has('content')
        ]);

        $validator = Validator::make($request->all(), [
            'content' => 'required_without:file|string|nullable',
            'file' => 'nullable', // Can be file upload OR array (base64)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $conversation = Conversation::find($conversationId);
        
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

        // Check if conversation is open
        if ($conversation->status !== 'open') {
            return response()->json([
                'status' => 'error',
                'message' => 'Cannot send messages to closed or archived conversations'
            ], 400);
        }

        // Handle file upload if present
        $fileData = null;
        try {
            $fileData = $this->handleFileUpload($request, $conversation->widget->id);
        } catch (\Exception $e) {
            Log::error('File upload failed in sendFromAgent: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'File upload failed'
            ], 500);
        }

        $type = $fileData['type'] ?? 'text';
        $fileUrl = $fileData['file_url'] ?? null;
        $fileName = $fileData['file_name'] ?? null;
        $fileType = $fileData['file_type'] ?? null;
        $fileSize = $fileData['file_size'] ?? null;

        // Translation logic for agent messages
        $originalContent = $request->content ?? '';
        $translatedContent = $originalContent;
        $messageMetaData = [];

        // Only translate text messages with content and if visitor has a non-English language
        if ($type === 'text' && !empty($originalContent) && !empty($conversation->visitor_language) && $conversation->visitor_language !== 'en') {
            $translationService = app(TranslationService::class);

            // Translate agent message to visitor's language
            $translatedContent = $translationService->translateAgentToVisitor(
                $originalContent,
                $conversation->visitor_language
            );

            // Store original English content in meta_data if it was translated
            if ($translatedContent !== $originalContent) {
                $messageMetaData['original_content'] = $originalContent;
                $messageMetaData['original_language'] = 'en';

                Log::info('Agent message translated', [
                    'conversation_id' => $conversation->id,
                    'to_language' => $conversation->visitor_language,
                    'original_preview' => substr($originalContent, 0, 50),
                    'translated_preview' => substr($translatedContent, 0, 50)
                ]);
            }
        }

        // Create message (store translated content for visitor to see)
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'type' => $type,
            'sender_type' => 'agent',
            'user_id' => $user->id,
            'content' => $translatedContent, // Store translated content
            'file_url' => $fileUrl,
            'file_name' => $fileName,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'is_delivered' => true,
            'delivered_at' => now(),
            'meta_data' => !empty($messageMetaData) ? $messageMetaData : null,
        ]);

        // Update conversation
        $conversation->last_message_at = now();
        $conversation->save();

        // Add sender name before broadcasting
        $message->sender_name = $user->name;

        broadcast(new NewMessage($message))->toOthers();

        // Log execution time
        $this->logExecutionTime('sendFromAgent', $startTime, [
            'conversation_id' => $conversation->id,
            'agent_id' => $user->id,
            'has_file' => $request->hasFile('file')
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Message sent successfully',
            'data' => $message
        ]);
    }
    
    /**
     * Get messages for a conversation
     */
    public function getMessages($conversationId)
    {
        $startTime = microtime(true);
        $user = Auth::user();
        $conversation = Conversation::find($conversationId);
        
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
        
        // Pagination for admin panel - default 50 messages
        $limit = request()->input('limit', 50);
        $query = $conversation->messages()->with('user');

        // For "load more" - get messages BEFORE a specific message ID
        if (request()->has('before_id')) {
            $query->where('id', '<', request()->before_id);
        }

        // Get latest N messages in descending order
        // Use reorder() to clear the relationship's default ASC ordering
        $messagesDesc = $query->reorder('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();

        // Store oldest ID (minimum ID from the collection)
        $oldestLoadedId = $messagesDesc->count() > 0 ? $messagesDesc->min('id') : null;

        // Reverse for chronological display (oldest first)
        $messages = $messagesDesc->reverse()->values();

        // Check if there are more messages
        $hasMore = false;
        if ($oldestLoadedId) {
            $hasMore = $conversation->messages()
                ->where('id', '<', $oldestLoadedId)
                ->exists();
        }

        // Log execution time
        $this->logExecutionTime('getMessages', $startTime, [
            'conversation_id' => $conversationId,
            'message_count' => $messages->count(),
            'has_more' => $hasMore
        ]);

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
            'has_more' => $hasMore,
            'oldest_message_id' => $oldestLoadedId
        ]);
    }
    
    /**
     * Get messages for a visitor conversation
     */
    public function getVisitorMessages(Request $request)
    {
        $startTime = microtime(true);

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

        // Use eager loading to prevent N+1 queries
        $conversation = Conversation::with(['widget'])->find($request->conversation_id);

        if (!$conversation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found'
            ], 404);
        }

        $widget = $conversation->widget;

        // Verify widget_key matches
        if ($widget->widget_key !== $request->widget_key) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid widget key for this conversation'
            ], 403);
        }

        // Get messages with pagination to prevent loading too many
        // Limit to 8 messages by default (or custom limit)
        $limit = $request->input('limit', 8);

        // Build the query
        $query = $conversation->messages()->with('user');

        // For "load more" - get messages BEFORE a specific message ID
        if ($request->has('before_id')) {
            $query->where('id', '<', $request->before_id);
        }

        // Get latest N messages in descending order
        // Use reorder() to clear the relationship's default ASC ordering
        $messagesDesc = $query->reorder('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get();

        // Store oldest ID (minimum ID from the collection)
        $oldestLoadedId = $messagesDesc->count() > 0 ? $messagesDesc->min('id') : null;

        // Reverse for chronological display (oldest first)
        $messages = $messagesDesc->reverse()->values();

        // Add sender names to messages (config called once, not in loop)
        $botName = config('aiconfig.display.bot_name', 'AI Assistant');
        $systemName = 'System';

        $messages->each(function ($message) use ($botName, $systemName) {
            if ($message->sender_type === 'bot') {
                $message->sender_name = $botName;
            } elseif ($message->sender_type === 'agent' && $message->user) {
                $message->sender_name = $message->user->name;
            } elseif ($message->sender_type === 'system') {
                $message->sender_name = $systemName;
            } else {
                $message->sender_name = null; // Visitor messages don't need sender name
            }
        });

        $conversation->messages()
            ->where('sender_type', 'agent')
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Check if there are more messages to load
        $hasMore = false;
        if ($oldestLoadedId) {
            $hasMore = $conversation->messages()
                ->where('id', '<', $oldestLoadedId)
                ->exists();
        }

        // Log execution time
        $this->logExecutionTime('getVisitorMessages', $startTime, [
            'conversation_id' => $request->conversation_id,
            'message_count' => $messages->count(),
            'before_id' => $request->has('before_id') ? $request->before_id : 'none',
            'has_more' => $hasMore,
            'oldest_returned' => $oldestLoadedId  // DEBUG
        ]);

        return response()->json([
            'status' => 'success',
            'messages' => $messages,
            'has_more' => $hasMore,
            'oldest_message_id' => $oldestLoadedId
        ]);
    }

// For typing indicator
public function typing(Request $request)
{
    $validated = $request->validate([
        'widget_key' => 'required|string|exists:widgets,widget_key',
        'conversation_id' => 'required|exists:conversations,id',
        'visitor_id' => 'required|string',
        'is_typing' => 'required|boolean'
    ]);

    // Verify the conversation belongs to this widget
    $conversation = Conversation::with(['widget'])->find($validated['conversation_id']);

    if (!$conversation) {
        return response()->json([
            'status' => 'error',
            'message' => 'Conversation not found'
        ], 404);
    }

    $widget = $conversation->widget;

    if ($widget->widget_key !== $validated['widget_key']) {
        return response()->json([
            'status' => 'error',
            'message' => 'Invalid conversation'
        ], 403);
    }
    
    // Broadcast typing event
    broadcast(new TypingEvent(
        $validated['conversation_id'],
        $validated['is_typing'],
        $validated['visitor_id']
    ))->toOthers();
    
    Log::info('Visitor typing event broadcasted', [
        'conversation_id' => $validated['conversation_id'],
        'is_typing' => $validated['is_typing'],
        'visitor_id' => $validated['visitor_id']
    ]);
    
    return response()->json(['status' => 'success']);
}

        /**
 * Send typing indicator from agent
 */
public function agentTyping(Request $request)
{
    $validated = $request->validate([
        'conversation_id' => 'required|exists:conversations,id',
        'is_typing' => 'required|boolean'
    ]);
    
    $userId = auth()->id();
    
    broadcast(new AgentTypingEvent(
        $validated['conversation_id'],
        $validated['is_typing'],
        $userId
    ))->toOthers();
    
    Log::info('Agent typing event broadcasted', [
        'conversation_id' => $validated['conversation_id'],
        'is_typing' => $validated['is_typing'],
        'user_id' => $userId,
        'sender_type' => 'agent'
    ]);
    
    return response()->json(['status' => 'success']);
}
}


