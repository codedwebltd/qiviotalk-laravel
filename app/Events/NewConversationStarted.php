<?php

// FILE: app/Events/NewConversationStarted.php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewConversationStarted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $conversation;

    public function __construct(Conversation $conversation)
    {
        $this->conversation = $conversation;
    }

    public function broadcastOn()
    {
        // Broadcast to global widget channel
        return new Channel('widget');
    }

    public function broadcastAs()
    {
        return 'new-conversation';
    }

    public function broadcastWith()
    {
        return [
            'conversation_id' => $this->conversation->id,
            'visitor_name' => $this->conversation->visitor_name,
            'created_at' => $this->conversation->created_at,
        ];
    }
}

