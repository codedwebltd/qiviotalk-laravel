<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'price', 'duration', 'duration_days', 'features', 'feature_limits', 'is_active', 'is_free_tier'];

    protected $casts = [
        'features' => 'array',
        'feature_limits' => 'array',
        'is_active' => 'boolean',
        'is_free_tier' => 'boolean',
        'price' => 'decimal:2'
    ];

    protected $withCount = ['users'];

    public function users()
    {
        return $this->hasMany(User::class, 'subscription_id');
    }
}
