<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiConversationContext extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'topics',
        'primary_intent',
        'sentiment',
        'sentiment_score',
        'visitor_messages_count',
        'ai_responses_count',
        'escalation_needed',
        'escalation_reason',
        'escalation_message_sent',
        'last_ai_response_at',
        'last_escalation_notification_at',
        'context_summary',
    ];

    protected $casts = [
        'topics' => 'array',
        'sentiment_score' => 'decimal:2',
        'visitor_messages_count' => 'integer',
        'ai_responses_count' => 'integer',
        'escalation_needed' => 'boolean',
        'escalation_message_sent' => 'boolean',
        'last_ai_response_at' => 'datetime',
        'last_escalation_notification_at' => 'datetime',
    ];

    /**
     * Get the conversation this context belongs to
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}
