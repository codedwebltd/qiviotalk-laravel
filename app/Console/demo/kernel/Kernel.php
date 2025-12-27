<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\Globalsetting;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{

  
    protected function schedule(Schedule $schedule): void
{
    $settings = Globalsetting::firstOrCreate();
    
    if(intval($settings->cron_job_enabled) == true)
    {
        // Test logging - confirms cron runs every minute
        $schedule->call(function () {
            Log::info('✅ Cron triggered at: ' . now() . ' | Server time: ' . date('Y-m-d H:i:s'));
        })->everyMinute();

        // ============================================================================
        // 📦 DATABASE BACKUP - Once daily at or after 10:00 AM
        // ============================================================================
        $schedule->call(function () {
            $cacheKey = 'last_database_backup_date';
            $lastRun = Cache::get($cacheKey);
            $today = now()->format('Y-m-d');
            $currentHour = now()->hour;
            
            // Run if: hasn't run today AND it's 10 AM or later
            if ($lastRun !== $today && $currentHour >= 10) {
                Log::info('🔄 Starting database backup...');
                
                // Run command and capture output
                Artisan::call('backup:b2-efficient', ['type' => 'database']);
                $output = Artisan::output();
                
                // Append output to backup.log
                file_put_contents(storage_path('logs/backup.log'), 
                    '[' . now() . '] Database Backup' . PHP_EOL . $output . PHP_EOL, 
                    FILE_APPEND);
                
                // Mark as completed for today
                Cache::forever($cacheKey, $today);
                
                Log::info('✅ Database backup completed for ' . $today);
            } else {
                Log::info('✅ Database backup already completed and closed for ' . $today);
            }
        })->everyMinute();

        // ============================================================================
        // 📦 FILES BACKUP - Once daily at or after 2:40 AM
        // ============================================================================
        $schedule->call(function () {
            $cacheKey = 'last_files_backup_date';
            $lastRun = Cache::get($cacheKey);
            $today = now()->format('Y-m-d');
            $currentHour = now()->hour;
            $currentMinute = now()->minute;
            
            // Run if: hasn't run today AND it's 2:40 AM or later
            if ($lastRun !== $today && ($currentHour > 2 || ($currentHour == 2 && $currentMinute >= 40))) {
                Log::info('🔄 Starting files backup...');
                
                // Run command and capture output
                Artisan::call('backup:b2-efficient', ['type' => 'files']);
                $output = Artisan::output();
                
                // Append output to backup.log
                file_put_contents(storage_path('logs/backup.log'), 
                    '[' . now() . '] Files Backup' . PHP_EOL . $output . PHP_EOL, 
                    FILE_APPEND);
                
                Cache::forever($cacheKey, $today);
                
                Log::info('✅ Files backup completed for ' . $today);
            } else {
                Log::info('✅ Files backup already completed and closed for ' . $today);
            }
        })->everyMinute();

        // ============================================================================
        // 📦 GIT PUSH - Once daily at or after 2:50 AM
        // ============================================================================
        $schedule->call(function () {
            $cacheKey = 'last_gitpush_date';
            $lastRun = Cache::get($cacheKey);
            $today = now()->format('Y-m-d');
            $currentHour = now()->hour;
            $currentMinute = now()->minute;
            
            // Run if: hasn't run today AND it's 2:50 AM or later
            if ($lastRun !== $today && ($currentHour > 2 || ($currentHour == 2 && $currentMinute >= 50))) {
                Log::info('🔄 Starting git push...');
                
                // Run command and capture output
                Artisan::call('auto:gitpush');
                $output = Artisan::output();
                
                // Append output to gitpush.log
                file_put_contents(storage_path('logs/gitpush.log'), 
                    '[' . now() . '] Git Push' . PHP_EOL . $output . PHP_EOL, 
                    FILE_APPEND);
                
                Cache::forever($cacheKey, $today);
                
                Log::info('✅ Git push completed for ' . $today);
            } else {
                Log::info('✅ Git push already completed and closed for ' . $today);
            }
        })->everyMinute();

        // ============================================================================
        // 🔧 MAINTENANCE TASKS
        // ============================================================================
        
        // Password resets cleanup - runs every hour
        $schedule->call(function () {
            $cacheKey = 'last_password_cleanup_hour';
            $lastRun = Cache::get($cacheKey);
            $currentHour = now()->format('Y-m-d H');
            
            // Run once per hour
            if ($lastRun !== $currentHour) {
                Log::info('🔄 Starting password resets cleanup...');
                
                Artisan::call('password-resets:cleanup');
                
                Cache::forever($cacheKey, $currentHour);
                
                Log::info('✅ Password resets cleanup completed for hour ' . $currentHour);
            }
        })->everyMinute();
        
        // Sitemap generation - Once daily at or after 3:00 AM
        $schedule->call(function () {
            $cacheKey = 'last_sitemap_date';
            $lastRun = Cache::get($cacheKey);
            $today = now()->format('Y-m-d');
            $currentHour = now()->hour;
            
            // Run if: hasn't run today AND it's 3 AM or later
            if ($lastRun !== $today && $currentHour >= 3) {
                Log::info('🔄 Starting sitemap generation...');
                
                Artisan::call('sitemap:generate');
                
                Cache::forever($cacheKey, $today);
                
                Log::info('✅ Sitemap generation completed for ' . $today);
            } else {
                Log::info('✅ Sitemap generation already completed and closed for ' . $today);
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
