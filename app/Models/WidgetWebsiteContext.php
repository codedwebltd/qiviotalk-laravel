<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WidgetWebsiteContext extends Model
{
    use HasFactory;

    protected $fillable = [
        'widget_id',
        'website_url',
        'company_name',
        'about_content',
        'products_services',
        'faq_data',
        'contact_info',
        'pricing_info',
        'meta_description',
        'key_features',
        'full_context',
        'is_active',
        'scrape_status',
        'scrape_error',
        'last_scraped_at',
        'next_scrape_at',
    ];

    protected $casts = [
        'products_services' => 'array',
        'faq_data' => 'array',
        'contact_info' => 'array',
        'pricing_info' => 'array',
        'key_features' => 'array',
        'is_active' => 'boolean',
        'last_scraped_at' => 'datetime',
        'next_scrape_at' => 'datetime',
    ];

    /**
     * Get the widget that owns this context
     */
    public function widget()
    {
        return $this->belongsTo(Widget::class);
    }
}
