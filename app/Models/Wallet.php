<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Wallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'balance',
        'currency',
        'is_active',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
    
    public function deposit($amount, $description = null, $metadata = null)
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }
        
        DB::transaction(function () use ($amount, $description, $metadata) {
            $this->increment('balance', $amount);
            
            $transaction = $this->transactions()->create([
                'uuid' => Str::uuid(),
                'user_id' => $this->user_id,
                'type' => 'deposit',
                'amount' => $amount,
                'currency' => $this->currency,
                'status' => 'completed',
                'description' => $description,
                'metadata' => $metadata,
            ]);
            
            return $transaction;
        });
        
        return $this->fresh();
    }
    
    public function withdraw($amount, $description = null, $metadata = null)
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Amount must be positive');
        }
        
        if ($this->balance < $amount) {
            throw new \InvalidArgumentException('Insufficient balance');
        }
        
        DB::transaction(function () use ($amount, $description, $metadata) {
            $this->decrement('balance', $amount);
            
            $transaction = $this->transactions()->create([
                'uuid' => Str::uuid(),
                'user_id' => $this->user_id,
                'type' => 'withdrawal',
                'amount' => $amount * -1, // Store as negative amount
                'currency' => $this->currency,
                'status' => 'completed',
                'description' => $description,
                'metadata' => $metadata,
            ]);
            
            return $transaction;
        });
        
        return $this->fresh();
    }
}