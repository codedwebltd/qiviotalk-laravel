<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiLearningPattern extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'pattern_type',
        'visitor_message_pattern',
        'successful_response',
        'intent',
        'success_count',
        'confidence_score',
        'avg_rating',
        'context_tags',
    ];

    protected $casts = [
        'success_count' => 'integer',
        'confidence_score' => 'decimal:2',
        'avg_rating' => 'integer',
        'context_tags' => 'array',
    ];

    /**
     * Get the conversation this pattern was learned from
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Increment success count and recalculate confidence
     */
    public function recordSuccess($rating = null)
    {
        $this->increment('success_count');

        // Update confidence score based on success count
        $this->confidence_score = min(100, 50 + ($this->success_count * 10));

        // Update average rating if provided
        if ($rating !== null) {
            if ($this->avg_rating === null) {
                $this->avg_rating = $rating;
            } else {
                $this->avg_rating = (($this->avg_rating * ($this->success_count - 1)) + $rating) / $this->success_count;
            }
        }

        $this->save();
    }
}
