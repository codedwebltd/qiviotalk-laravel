<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Widget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'widget_key',
        'embed_code',
        'name',
        'website',
        'position',
        'color',
        'icon',
        'brand_logo',
        'welcome_message',
        'is_installed',
        'last_verified_at',
        'widget_status',
        'widget_meta_data',
        'widget_expiry_date',
    ];

    protected $casts = [
        'is_installed' => 'boolean',
        'last_verified_at' => 'datetime',
        'widget_meta_data' => 'array',
        'widget_expiry_date' => 'datetime',
        'website' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function generateWidgetKey()
    {
        return bin2hex(random_bytes(16));
    }

    public function getEmbedCodeAttribute()
    {
        $baseUrl = rtrim(str_replace('/api', '', config('app.url')), '/');
        return '<script src="' . $baseUrl . '/widgets/widget-' . $this->widget_key . '.js" async defer></script>';
    }

    /**
     * Get the conversations for the widget. 
     * 
     */
    /**
     * Get all conversations for this widget.
     */
    public function conversations()
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Get open conversations for this widget.
     */
    public function openConversations()
    {
        return $this->conversations()->where('status', 'open');
    }

    /**
     * Get closed conversations for this widget.
     */
    public function closedConversations()
    {
        return $this->conversations()->where('status', 'closed');
    }

    /**
     * Get archived conversations for this widget.
     */
    public function archivedConversations()
    {
        return $this->conversations()->where('status', 'archived');
    }

    /**
     * Get unread conversations for this widget.
     */
    public function unreadConversations()
    {
        return $this->conversations()->where('is_read', false);
    }

    /**
     * Get the website context for this widget (legacy - single context)
     * @deprecated Use websiteContexts() for multiple website support
     */
    public function websiteContext()
    {
        return $this->hasOne(WidgetWebsiteContext::class);
    }

    /**
     * Get all website contexts for this widget (supports multiple websites)
     */
    public function websiteContexts()
    {
        return $this->hasMany(WidgetWebsiteContext::class);
    }
}
