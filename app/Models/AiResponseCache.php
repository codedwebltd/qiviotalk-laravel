<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiResponseCache extends Model
{
    use HasFactory;

    protected $fillable = [
        'message_fingerprint',
        'normalized_message',
        'cached_response',
        'intent',
        'hit_count',
        'success_count',
        'success_rate',
        'last_used_at',
        'expires_at',
    ];

    protected $casts = [
        'hit_count' => 'integer',
        'success_count' => 'integer',
        'success_rate' => 'decimal:2',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Increment hit count and update last used timestamp
     */
    public function recordHit()
    {
        $this->increment('hit_count');
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Record successful use (conversation rated well)
     */
    public function recordSuccess()
    {
        $this->increment('success_count');
        $this->success_rate = ($this->success_count / $this->hit_count) * 100;
        $this->save();
    }
}
