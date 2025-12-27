<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'wallet_id',
        'user_id',
        'subscription_id',
        'type',
        'amount',
        'currency',
        'status',
        'reference',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($transaction) {
            $transaction->uuid = $transaction->uuid ?? Str::uuid();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    public function referralReward()
    {
        return $this->hasOne(ReferralReward::class);
    }
    
    public function scopeDeposits($query)
    {
        return $query->where('type', 'deposit');
    }
    
    public function scopeWithdrawals($query)
    {
        return $query->where('type', 'withdrawal');
    }
    
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }
    
    public function getFormattedAmountAttribute()
    {
        $sign = $this->amount < 0 ? '-' : '';
        return $sign . $this->currency . ' ' . number_format(abs($this->amount), 2);
    }
}