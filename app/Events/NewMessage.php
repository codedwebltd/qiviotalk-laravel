<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        // Load the user relationship for agent messages
        if ($message->sender_type === 'agent' && !$message->relationLoaded('user')) {
            $message->load('user');
        }

        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel('conversation.' . $this->message->conversation_id);
    }

    public function broadcastWith()
    {
        // Include sender_name in the broadcast data
        $data = $this->message->toArray();

        // Add sender_name - check both as attribute and property
        if (property_exists($this->message, 'sender_name') && $this->message->sender_name !== null) {
            $data['sender_name'] = $this->message->sender_name;
        } elseif ($this->message->sender_type === 'bot') {
            // Fallback for bot messages
            $data['sender_name'] = config('aiconfig.display.bot_name', 'AI Assistant');
        } elseif ($this->message->sender_type === 'agent' && $this->message->user) {
            // Fallback for agent messages - load the user relationship
            $data['sender_name'] = $this->message->user->name;
        }

        return ['message' => $data];
    }
}

