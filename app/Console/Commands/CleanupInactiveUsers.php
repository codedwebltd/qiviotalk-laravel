<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Subscription;
use App\Jobs\CleanupInactiveUser;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CleanupInactiveUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:cleanup-inactive
                            {--dry-run : Run without actually deleting anything}
                            {--batch-size=10 : Number of users to process per batch}
                            {--delay=10 : Delay in seconds between each job}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup inactive free tier users who haven\'t used their account for 30+ days';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        $batchSize = (int) $this->option('batch-size');
        $delay = (int) $this->option('delay');

        $this->info('🔍 Starting cleanup of inactive users...');
        $this->info($dryRun ? '⚠️  DRY RUN MODE - No data will be deleted' : '🗑️  LIVE MODE - Jobs will be dispatched');
        $this->newLine();

        // Get free tier subscription
        $freeTierSub = Subscription::where('is_free_tier', true)->first();

        if (!$freeTierSub) {
            $this->error('❌ No free tier subscription found in database');
            return Command::FAILURE;
        }

        $this->info("Free Tier Subscription: {$freeTierSub->name} (ID: {$freeTierSub->id})");
        $this->newLine();

        // Find inactive users (30 days ago)
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $users = User::where('subscription_id', $freeTierSub->id)
            ->where(function($query) use ($thirtyDaysAgo) {
                // Unverified users with no activity
                $query->where(function($q) use ($thirtyDaysAgo) {
                    $q->whereNull('email_verified_at')
                      ->where('created_at', '<', $thirtyDaysAgo)
                      ->where(function($q2) use ($thirtyDaysAgo) {
                          $q2->whereNull('last_login_at')
                             ->orWhere('last_login_at', '<', $thirtyDaysAgo);
                      });
                })
                // OR verified users but completely inactive
                ->orWhere(function($q) use ($thirtyDaysAgo) {
                    $q->whereNotNull('email_verified_at')
                      ->where(function($q2) use ($thirtyDaysAgo) {
                          $q2->whereNull('last_login_at')
                             ->orWhere('last_login_at', '<', $thirtyDaysAgo);
                      });
                });
            })
            // Also check if widget is inactive (not verified for 30+ days and not active)
            ->whereHas('widgets', function($q) use ($thirtyDaysAgo) {
                $q->where(function($q2) use ($thirtyDaysAgo) {
                    $q2->whereNull('last_verified_at')
                       ->orWhere('last_verified_at', '<', $thirtyDaysAgo);
                })
                ->where(function($q3) {
                    $q3->where('widget_status', '!=', 'active')
                       ->orWhereNull('widget_status');
                });
            })
            ->with(['widgets', 'wallet', 'subscription'])
            ->get();

        if ($users->isEmpty()) {
            $this->info('✅ No inactive users found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$users->count()} inactive users to process...");
        $this->newLine();

        if ($dryRun) {
            $this->table(
                ['ID', 'Name', 'Email', 'Verified', 'Last Login', 'Widgets', 'Created'],
                $users->map(function($user) {
                    return [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->email_verified_at ? 'Yes' : 'No',
                        $user->last_login_at ? $user->last_login_at->diffForHumans() : 'Never',
                        $user->widgets->count(),
                        $user->created_at->diffForHumans(),
                    ];
                })->toArray()
            );

            $this->newLine();
            $this->warn('ℹ️  This was a dry run. Run without --dry-run to dispatch cleanup jobs.');

            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar($users->count());
        $bar->start();

        $jobCount = 0;
        $delaySeconds = 0;

        foreach ($users->chunk($batchSize) as $batch) {
            foreach ($batch as $user) {
                // Dispatch cleanup job with delay
                CleanupInactiveUser::dispatch($user)->delay(now()->addSeconds($delaySeconds));

                $jobCount++;
                $delaySeconds += $delay;

                $bar->advance();
            }
        }

        $bar->finish();
        $this->newLine(2);

        // Summary
        $this->info('═══════════════════════════════════════');
        $this->info('📊 CLEANUP SUMMARY');
        $this->info('═══════════════════════════════════════');
        $this->info("Inactive users found: {$users->count()}");
        $this->info("Cleanup jobs dispatched: {$jobCount}");
        $this->info("⏱️  Jobs will run with {$delay} second intervals");
        $this->info("📊 Total estimated time: ~" . round($delaySeconds / 60, 2) . " minutes");
        $this->info('═══════════════════════════════════════');

        Log::info('Inactive user cleanup jobs dispatched', [
            'total_jobs' => $jobCount,
            'batch_size' => $batchSize,
            'delay' => $delay,
        ]);

        return Command::SUCCESS;
    }
}
