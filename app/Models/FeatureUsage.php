<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeatureUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'feature_key',
        'usage_count',
        'period',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    /**
     * Relationship: Feature usage belongs to a user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Increment usage for a specific feature
     */
    public static function incrementUsage(int $userId, string $featureKey, int $amount = 1): void
    {
        $period = now()->format('Y-m');

        $record = self::where([
            'user_id' => $userId,
            'feature_key' => $featureKey,
            'period' => $period,
        ])->first();

        if ($record) {
            // Record exists, increment it
            $record->increment('usage_count', $amount);
        } else {
            // Record doesn't exist, create it
            self::create([
                'user_id' => $userId,
                'feature_key' => $featureKey,
                'period' => $period,
                'usage_count' => $amount,
            ]);
        }
    }

    /**
     * Get current usage for a feature
     */
    public static function getCurrentUsage(int $userId, string $featureKey): int
    {
        $period = now()->format('Y-m');

        return self::where('user_id', $userId)
            ->where('feature_key', $featureKey)
            ->where('period', $period)
            ->value('usage_count') ?? 0;
    }

    /**
     * Reset usage for a new period (called by scheduler)
     */
    public static function resetForNewPeriod(): void
    {
        $currentPeriod = now()->format('Y-m');

        // Delete old records (older than 3 months for history)
        self::where('period', '<', now()->subMonths(3)->format('Y-m'))->delete();
    }
}
