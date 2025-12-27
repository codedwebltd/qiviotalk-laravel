<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\GlobalSetting;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        $settings = GlobalSetting::get();

        if (intval($settings->cron_job_enabled ?? 0) == true) {

            // ============================================================================
            // 📊 SUBSCRIPTION MANAGEMENT
            // ============================================================================

            // Renew expired free tier subscriptions - Once daily at or after 1:00 AM
            $schedule->call(function () {
                $cacheKey = 'last_renew_freetier_date';
                $lastRun = Cache::get($cacheKey);
                $today = now()->format('Y-m-d');
                $currentHour = now()->hour;

                // Run if: hasn't run today AND it's 1 AM or later
                if ($lastRun !== $today && $currentHour >= 1) {
                    Log::info('🔄 Starting free tier subscription renewal...');

                    Artisan::call('subscriptions:renew-free-tier');
                    $output = Artisan::output();

                    // Append output to subscription.log
                    file_put_contents(storage_path('logs/subscription.log'),
                        '[' . now() . '] Renew Free Tier' . PHP_EOL . $output . PHP_EOL,
                        FILE_APPEND);

                    Cache::forever($cacheKey, $today);

                    Log::info('✅ Free tier subscription renewal completed for ' . $today);
                } else {
                    Log::info('✅ Free tier renewal already completed for ' . $today);
                }
            })->everyMinute();

            // ============================================================================
            // 🧹 INACTIVE USERS CLEANUP
            // ============================================================================

            // Cleanup inactive users - Once daily at or after 3:00 AM
            $schedule->call(function () {
                $cacheKey = 'last_inactive_users_cleanup_date';
                $lastRun = Cache::get($cacheKey);
                $today = now()->format('Y-m-d');
                $currentHour = now()->hour;

                // Run if: hasn't run today AND it's 3 AM or later
                if ($lastRun !== $today && $currentHour >= 3) {
                    Log::info('🔄 Starting inactive users cleanup...');

                    Artisan::call('users:cleanup-inactive');
                    $output = Artisan::output();

                    // Append output to inactive-users-cleanup.log
                    file_put_contents(storage_path('logs/inactive-users-cleanup.log'),
                        '[' . now() . '] Cleanup Inactive Users' . PHP_EOL . $output . PHP_EOL,
                        FILE_APPEND);

                    Cache::forever($cacheKey, $today);

                    Log::info('✅ Inactive users cleanup completed for ' . $today);
                } else {
                    Log::info('✅ Inactive users cleanup already completed for ' . $today);
                }
            })->everyMinute();

            // ============================================================================
            // 💬 CHAT HISTORY CLEANUP
            // ============================================================================

            // Cleanup old conversations based on subscription limits - Once daily at or after 4:00 AM
            $schedule->call(function () {
                $cacheKey = 'last_chat_history_cleanup_date';
                $lastRun = Cache::get($cacheKey);
                $today = now()->format('Y-m-d');
                $currentHour = now()->hour;

                // Run if: hasn't run today AND it's 4 AM or later
                if ($lastRun !== $today && $currentHour >= 4) {
                    Log::info('🔄 Starting chat history cleanup...');

                    Artisan::call('conversations:cleanup-old');
                    $output = Artisan::output();

                    // Append output to chat-history-cleanup.log
                    file_put_contents(storage_path('logs/chat-history-cleanup.log'),
                        '[' . now() . '] Cleanup Old Conversations' . PHP_EOL . $output . PHP_EOL,
                        FILE_APPEND);

                    Cache::forever($cacheKey, $today);

                    Log::info('✅ Chat history cleanup completed for ' . $today);
                } else {
                    Log::info('✅ Chat history cleanup already completed for ' . $today);
                }
            })->everyMinute();

        }
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
