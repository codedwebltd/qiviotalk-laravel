<?php

namespace App\Jobs;

use App\Models\Message;
use App\Models\Conversation;
use App\Models\User;
use App\Events\NewMessage;
use App\Events\TypingEvent;
use App\Services\AiChatService;
use App\Services\NewConversationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAiResponse implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $message;
    public $conversation;
    public $agent;

    /**
     * Create a new job instance.
     */
    public function __construct(Message $message, Conversation $conversation, User $agent)
    {
        $this->message = $message;
        $this->conversation = $conversation;
        $this->agent = $agent;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $aiChatService = app(AiChatService::class);
            $result = $aiChatService->processMessage($this->message, $this->conversation, $this->agent->aiSetting);

            if ($result['should_respond']) {
                // Broadcast typing indicator
                broadcast(new TypingEvent($this->conversation->id, true, null, 'bot'))->toOthers();

                // Simulate typing delay
                $responseLength = strlen($result['response']);
                $delay = min(3, max(1, $responseLength / 100));
                usleep($delay * 1000000);

                // Create AI response
                $aiResponse = Message::create([
                    'conversation_id' => $this->conversation->id,
                    'type' => 'text',
                    'sender_type' => 'bot',
                    'content' => $result['response'],
                    'is_delivered' => true,
                    'delivered_at' => now(),
                ]);

                // Stop typing
                broadcast(new TypingEvent($this->conversation->id, false, null, 'bot'))->toOthers();

                // Update conversation
                $this->conversation->last_message_at = now();
                $this->conversation->save();

                // Set sender name
                $aiResponse->sender_name = config('aiconfig.display.bot_name', 'AI Assistant');

                // Broadcast AI response
                broadcast(new NewMessage($aiResponse))->toOthers();

                Log::info("AI response sent for conversation {$this->conversation->id}", [
                    'from_cache' => $result['from_cache'] ?? false,
                    'escalate' => $result['escalate_to_human'] ?? false,
                ]);

                // Handle escalation
                if ($result['escalate_to_human']) {
                    app(NewConversationService::class)->notifyUserOfNewMessage(
                        $this->agent,
                        $this->conversation->id,
                        $this->message->content,
                        $this->conversation->visitor_name
                    );
                    Log::info("Human escalation notification sent to agent {$this->agent->id}");
                }
            }
        } catch (\Exception $e) {
            Log::error("Failed to generate AI response for conversation {$this->conversation->id}: " . $e->getMessage());
        }
    }
}
