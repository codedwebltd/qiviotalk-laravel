<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Conversation extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'widget_id',
        'visitor_id',
        'visitor_email',
        'visitor_phone',
        'visitor_name',
        'visitor_ip',
        'visitor_location',
        'visitor_user_agent',
        'visitor_referrer',
        'visitor_language',
        'first_message',
        'status',
        'is_read',
        'has_new_messages',
        'last_message_at',
        'closed_at',
        'closed_by',
        'close_reason',
        'rating',
        'rating_comment',
        'meta_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_read' => 'boolean',
        'has_new_messages' => 'boolean',
        'last_message_at' => 'datetime',
        'closed_at' => 'datetime',
        'meta_data' => 'json',
    ];

    /**
     * Get the widget that owns the conversation.
     */
    public function widget()
    {
        return $this->belongsTo(Widget::class);
    }

    /**
     * Get the user who closed the conversation.
     */
    public function closedByUser()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    /**
     * Get all messages for this conversation.
     */
    public function messages()
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the last message in this conversation.
     */
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latest();
    }

    /**
     * Scope a query to only include open conversations.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope a query to only include closed conversations.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope a query to only include archived conversations.
     */
    public function scopeArchived($query)
    {
        return $query->where('status', 'archived');
    }

    /**
     * Scope a query to only include unread conversations.
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope a query to only include conversations with new messages.
     */
    public function scopeHasNewMessages($query)
    {
        return $query->where('has_new_messages', true);
    }

    /**
     * Mark the conversation as read.
     */
    public function markAsRead()
    {
        $this->is_read = true;
        $this->has_new_messages = false;
        $this->save();

        return $this;
    }

    /**
     * Close the conversation.
     */
    public function close($userId = null, $reason = null)
    {
        $this->status = 'closed';
        $this->closed_at = now();
        $this->closed_by = $userId;
        $this->close_reason = $reason;
        $this->save();

        return $this;
    }

    /**
     * Archive the conversation.
     */
    public function archive()
    {
        $this->status = 'archived';
        $this->save();

        return $this;
    }

    /**
     * Reopen the conversation.
     */
    public function reopen()
    {
        $this->status = 'open';
        $this->closed_at = null;
        $this->closed_by = null;
        $this->close_reason = null;
        $this->save();

        return $this;
    }

    /**
     * Get the AI context for this conversation
     */
    public function aiContext()
    {
        return $this->hasOne(AiConversationContext::class);
    }

    /**
     * For Orchid compatibility
     */
    public function getContent(): string
    {
        return $this->first_message ?? '';
    }
}