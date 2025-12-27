<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Onboarding extends Model
{
    use HasFactory;

    protected $table = 'onboarding';

    protected $fillable = [
        'user_id',
        'current_step',
        'company_name',
        'industry',
        'team_size',
        'website',
        'primary_goal',
        'widget_position',
        'primary_color',
        'chat_icon',
        'brand_logo',
        'welcome_message',
        'completed',
        'completed_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime',
        'website' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function markAsCompleted()
    {
        $this->update([
            'completed' => true,
            'completed_at' => now(),
        ]);
        
        $this->user->update([
            'onboarding_completed' => true,
        ]);
        
        return $this;
    }
}