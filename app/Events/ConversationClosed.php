<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationClosed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;

    public function __construct(Conversation $conversation)
    {
        $this->conversation = $conversation;
    }

    public function broadcastOn()
    {
        return [
            new Channel('widget'),  // For inbox updates
            new Channel('conversation.' . $this->conversation->id),  // For chat screen
        ];
    }

    public function broadcastAs()
    {
        return 'conversation-closed';
    }

    public function broadcastWith()
    {
        $data = [
            'conversation_id' => $this->conversation->id,
            'visitor_name' => $this->conversation->visitor_name,
            'closed_at' => now(),
        ];

        \Log::info('🔴 WebSocket Event Fired: conversation-closed', array_merge(['event' => 'conversation-closed'], $data));

        return $data;
    }
}
