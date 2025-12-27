<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation_id;  // Changed to snake_case to match widget expectations
    public $is_typing;        // Changed to snake_case to match widget expectations
    public $visitor_id;       // Changed to visitor_id to match widget expectations
    public $sender_type;      // Added to distinguish between visitor and agent

    public function __construct($conversationId, $isTyping, $visitorId = null, $senderType = 'visitor')
    {
        $this->conversation_id = $conversationId;
        $this->is_typing = $isTyping;
        $this->visitor_id = $visitorId;
        $this->sender_type = $senderType;
    }

    public function broadcastOn()
    {
        return new Channel('conversation.' . $this->conversation_id);
    }
    
    public function broadcastAs()
    {
        return 'typing';
    }
}