<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferralReward extends Model
{
    use HasFactory;

    protected $fillable = [
        'referrer_id',
        'referred_id',
        'transaction_id',
        'status',
        'amount',
        'currency',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referred()
    {
        return $this->belongsTo(User::class, 'referred_id');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }
    
    public function processReward()
    {
        if ($this->status !== 'pending') {
            return false;
        }
        
        DB::transaction(function () {
            $wallet = $this->referrer->getWallet($this->currency);
            
            if (!$wallet) {
                $wallet = $this->referrer->wallets()->create([
                    'currency' => $this->currency,
                    'balance' => 0,
                    'is_active' => true,
                ]);
            }
            
            $transaction = $wallet->transactions()->create([
                'uuid' => Str::uuid(),
                'user_id' => $this->referrer_id,
                'type' => 'referral_bonus',
                'amount' => $this->amount,
                'currency' => $this->currency,
                'status' => 'completed',
                'description' => 'Referral reward for ' . $this->referred->name,
                'metadata' => ['referred_id' => $this->referred_id],
            ]);
            
            $wallet->increment('balance', $this->amount);
            
            $this->update([
                'transaction_id' => $transaction->id,
                'status' => 'paid',
            ]);
        });
        
        return true;
    }
}