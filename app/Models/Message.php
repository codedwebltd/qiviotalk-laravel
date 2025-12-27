<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'conversation_id',
        'type',
        'sender_type',
        'user_id',
        'content',
        'file_url',
        'file_name',
        'file_type',
        'file_size',
        'is_read',
        'read_at',
        'is_delivered',
        'delivered_at',
        'is_error',
        'error_message',
        'meta_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_delivered' => 'boolean',
        'delivered_at' => 'datetime',
        'is_error' => 'boolean',
        'meta_data' => 'json',
    ];

    /**
     * Get the conversation that owns the message.
     */
    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the user/agent who sent this message.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to only include visitor messages.
     */
    public function scopeFromVisitor($query)
    {
        return $query->where('sender_type', 'visitor');
    }

    /**
     * Scope a query to only include agent messages.
     */
    public function scopeFromAgent($query)
    {
        return $query->where('sender_type', 'agent');
    }

    /**
     * Scope a query to only include system messages.
     */
    public function scopeFromSystem($query)
    {
        return $query->where('sender_type', 'system');
    }

    /**
     * Scope a query to only include bot messages.
     */
    public function scopeFromBot($query)
    {
        return $query->where('sender_type', 'bot');
    }

    /**
     * Scope a query to only include unread messages.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope a query to only include undelivered messages.
     */
    public function scopeUndelivered($query)
    {
        return $query->where('is_delivered', false);
    }

    /**
     * Scope a query to only include error messages.
     */
    public function scopeError($query)
    {
        return $query->where('is_error', true);
    }

    /**
     * Mark the message as read.
     */
    public function markAsRead()
    {
        $this->is_read = true;
        $this->read_at = now();
        $this->save();

        return $this;
    }

    /**
     * Mark the message as delivered.
     */
    public function markAsDelivered()
    {
        $this->is_delivered = true;
        $this->delivered_at = now();
        $this->save();

        return $this;
    }

    /**
     * Mark the message as having an error.
     */
    public function markAsError($errorMessage = null)
    {
        $this->is_error = true;
        $this->error_message = $errorMessage;
        $this->save();

        return $this;
    }

    /**
     * Check if this message is from a visitor.
     */
    public function isFromVisitor()
    {
        return $this->sender_type === 'visitor';
    }

    /**
     * Check if this message is from an agent.
     */
    public function isFromAgent()
    {
        return $this->sender_type === 'agent';
    }

    /**
     * Check if this message is a system message.
     */
    public function isSystem()
    {
        return $this->sender_type === 'system';
    }

    /**
     * Check if this message is from a bot.
     */
    public function isFromBot()
    {
        return $this->sender_type === 'bot';
    }

    /**
     * Check if this message has an attachment.
     */
    public function hasAttachment()
    {
        return !is_null($this->file_url);
    }
}