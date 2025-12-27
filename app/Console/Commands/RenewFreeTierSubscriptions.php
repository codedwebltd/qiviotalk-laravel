<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Subscription;
use App\Jobs\RenewFreeTierSubscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RenewFreeTierSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:renew-free-tier
                            {--batch-size=10 : Number of users to process per batch}
                            {--delay=10 : Delay in seconds between each job}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Renew expired free tier subscriptions for users';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $batchSize = (int) $this->option('batch-size');
        $delay = (int) $this->option('delay');

        $this->info('🔄 Starting free tier subscription renewal process...');
        $this->newLine();

        // Get free tier subscription
        $freeTierSub = Subscription::where('is_free_tier', true)->first();

        if (!$freeTierSub) {
            $this->error('❌ No free tier subscription found in database');
            return Command::FAILURE;
        }

        $this->info("Free Tier: {$freeTierSub->name} ({$freeTierSub->duration_days} days)");
        $this->newLine();

        // Get users on free tier with expired subscriptions
        $users = User::where('subscription_id', $freeTierSub->id)
                     ->whereNotNull('membership_expires_at')
                     ->where('membership_expires_at', '<', now())
                     ->get();

        if ($users->isEmpty()) {
            $this->info('✅ No expired free tier subscriptions found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$users->count()} users with expired free tier subscriptions");
        $this->newLine();

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $jobCount = 0;
        $delaySeconds = 0;

        foreach ($users->chunk($batchSize) as $batch) {
            foreach ($batch as $user) {
                // Dispatch job with delay (snail form - 10 seconds apart)
                RenewFreeTierSubscription::dispatch($user)->delay(now()->addSeconds($delaySeconds));

                $jobCount++;
                $delaySeconds += $delay;

                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Dispatched {$jobCount} renewal jobs");
        $this->info("⏱️  Jobs will run with {$delay} second intervals");
        $this->info("📊 Total estimated time: ~" . round($delaySeconds / 60, 2) . " minutes");

        Log::info('Free tier renewal jobs dispatched', [
            'total_jobs' => $jobCount,
            'batch_size' => $batchSize,
            'delay' => $delay,
        ]);

        return Command::SUCCESS;
    }
}
