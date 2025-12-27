<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AgentTypingEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation_id;  // Using snake_case to match the naming in your widget
    public $is_typing;
    public $user_id;
    public $sender_type = 'agent';  // Hardcoded as 'agent' since this is specifically for agents

    public function __construct($conversationId, $isTyping, $userId)
    {
        $this->conversation_id = $conversationId;
        $this->is_typing = $isTyping;
        $this->user_id = $userId;
    }

    public function broadcastOn()
    {
        // Use the same channel format as your other events
        return new Channel('conversation.' . $this->conversation_id);
    }
    
    // Broadcasting as "typing" event to match what the widget expects
    public function broadcastAs()
    {
        return 'typing';
    }
}

