<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class RenewFreeTierSubscription implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     *
     * @var int
     */
    public $timeout = 120;

    /**
     * The number of seconds to wait before retrying.
     *
     * @var int
     */
    public $backoff = 10;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Get free tier subscription
            $freeTierSub = Subscription::where('is_free_tier', true)->first();

            if (!$freeTierSub) {
                Log::error('No free tier subscription found for renewal');
                return;
            }

            // Check if user's subscription has expired
            if ($this->user->membership_expires_at && $this->user->membership_expires_at->isPast()) {

                // Only renew if user is on free tier
                if ($this->user->subscription_id === $freeTierSub->id) {

                    $newExpiryDate = Carbon::now()->addDays($freeTierSub->duration_days ?? 30);

                    // Update user membership
                    $this->user->update([
                        'membership_expires_at' => $newExpiryDate,
                    ]);

                    // Update widget expiry as well
                    if ($this->user->widget) {
                        $this->user->widget->update([
                            'widget_expiry_date' => $newExpiryDate,
                        ]);
                    }

                    // Reset feature usage for current period
                    $currentPeriod = Carbon::now()->format('Y-m');
                    $deletedCount = \App\Models\FeatureUsage::where('user_id', $this->user->id)
                        ->where('period', $currentPeriod)
                        ->delete();

                    Log::info('Free tier subscription renewed', [
                        'user_id' => $this->user->id,
                        'email' => $this->user->email,
                        'new_expiry' => $newExpiryDate->toDateTimeString(),
                        'feature_usage_reset' => $deletedCount . ' records deleted',
                    ]);
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to renew free tier subscription', [
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('RenewFreeTierSubscription job failed', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
