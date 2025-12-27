<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\GlobalSetting;
use App\Jobs\CleanupOldConversation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CleanupOldConversations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'conversations:cleanup-old
                            {--dry-run : Run without actually deleting anything}
                            {--batch-size=10 : Number of users to process per batch}
                            {--delay=5 : Delay in seconds between each job}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup old conversations based on subscription chat history retention limits';

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

        $this->info('🔍 Starting old conversations cleanup...');
        $this->info($dryRun ? '⚠️  DRY RUN MODE - No data will be deleted' : '🗑️  LIVE MODE - Jobs will be dispatched');
        $this->newLine();

        // Find users with limited chat history (Chat_history_days > 0)
        $users = User::whereHas('subscription', function($query) {
            $query->whereRaw("JSON_EXTRACT(feature_limits, '$.Chat_history_days') > 0");
        })
        ->with(['subscription', 'widgets'])
        ->get();

        if ($users->isEmpty()) {
            $this->info('✅ No users with limited chat history found.');
            return Command::SUCCESS;
        }

        $this->info("Found {$users->count()} users with limited chat history...");
        $this->newLine();

        // Collect stats for each user
        $userStats = [];

        foreach ($users as $user) {
            $retentionDays = $user->subscription->feature_limits['Chat_history_days'] ?? -1;
            $cutoffDate = Carbon::now()->subDays($retentionDays);

            $widgetIds = $user->widgets->pluck('id');

            if ($widgetIds->isEmpty()) {
                continue;
            }

            // Count old messages (check MESSAGE created_at, not conversation)
            $oldMessagesCount = DB::table('messages')
                ->whereIn('conversation_id', function($query) use ($widgetIds) {
                    $query->select('id')
                        ->from('conversations')
                        ->whereIn('widget_id', $widgetIds);
                })
                ->where('created_at', '<', $cutoffDate)
                ->count();

            // Count affected conversations (conversations that have old messages)
            $conversationsAffected = DB::table('conversations')
                ->whereIn('widget_id', $widgetIds)
                ->whereExists(function($query) use ($cutoffDate) {
                    $query->select(DB::raw(1))
                        ->from('messages')
                        ->whereColumn('messages.conversation_id', 'conversations.id')
                        ->where('messages.created_at', '<', $cutoffDate);
                })
                ->count();

            $userStats[] = [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'subscription' => $user->subscription->name,
                'retention_days' => $retentionDays,
                'conversations_affected' => $conversationsAffected,
                'messages_to_delete' => $oldMessagesCount,
            ];
        }

        if ($dryRun) {
            $this->table(
                ['User ID', 'Name', 'Subscription', 'Retention (Days)', 'Conversations (keep)', 'Messages (delete)'],
                collect($userStats)->map(function($stat) {
                    return [
                        $stat['user_id'],
                        $stat['name'],
                        $stat['subscription'],
                        $stat['retention_days'],
                        $stat['conversations_affected'],
                        $stat['messages_to_delete'],
                    ];
                })->toArray()
            );

            $totalConversations = collect($userStats)->sum('conversations_affected');
            $totalMessages = collect($userStats)->sum('messages_to_delete');

            $this->newLine();
            $this->info("📊 Conversations with old messages: {$totalConversations}");
            $this->info("📊 Total messages to delete: {$totalMessages}");
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
                CleanupOldConversation::dispatch($user)->delay(now()->addSeconds($delaySeconds));

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
        $this->info("Users processed: {$users->count()}");
        $this->info("Cleanup jobs dispatched: {$jobCount}");
        $this->info("⏱️  Jobs will run with {$delay} second intervals");
        $this->info("📊 Total estimated time: ~" . round($delaySeconds / 60, 2) . " minutes");
        $this->info('═══════════════════════════════════════');

        // Send email summary to admin
        $this->sendAdminNotification($userStats);

        Log::info('Old conversations cleanup jobs dispatched', [
            'total_jobs' => $jobCount,
            'batch_size' => $batchSize,
            'delay' => $delay,
        ]);

        return Command::SUCCESS;
    }

    /**
     * Send email notification to admin
     */
    private function sendAdminNotification(array $userStats): void
    {
        try {
            $settings = GlobalSetting::get();
            $adminEmail = $settings->support_email ?? 'dakingeorge58@gmail.com';

            $totalConversations = collect($userStats)->sum('conversations_affected');
            $totalMessages = collect($userStats)->sum('messages_to_delete');

            $content = "Hello Admin,\n\n";
            $content .= "Chat history cleanup has been initiated.\n\n";
            $content .= "Note: Only old MESSAGES are deleted. Conversations are kept for metadata/analytics.\n\n";

            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            $content .= "📊 CLEANUP SUMMARY\n";
            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

            $content .= "👥 Users affected: " . count($userStats) . "\n";
            $content .= "💬 Conversations with old messages: {$totalConversations}\n";
            $content .= "📨 Total messages deleted: {$totalMessages}\n\n";

            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            $content .= "👤 USER BREAKDOWN\n";
            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

            foreach ($userStats as $stat) {
                if ($stat['conversations_affected'] > 0) {
                    $content .= "📧 {$stat['email']}\n";
                    $content .= "   📦 Plan: {$stat['subscription']}\n";
                    $content .= "   ⏰ Retention: {$stat['retention_days']} days\n";
                    $content .= "   💬 Conversations affected: {$stat['conversations_affected']}\n";
                    $content .= "   📨 Messages deleted: {$stat['messages_to_delete']}\n\n";
                }
            }

            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
            $content .= "Cleanup jobs are running in the background.\n";
            $content .= "Check logs for detailed progress.\n\n";
            $content .= "Best regards,\n";
            $content .= config('app.name') . " System";

            $message = [
                'subject' => '🧹 Chat History Cleanup Report',
                'type' => 'info',
                'response' => $content,
                'notify_admin' => false,
            ];

            Mail::to($adminEmail)->send(new \App\Mail\GeneralNotificationMail($message));

            Log::info('Admin notified about chat history cleanup', [
                'admin_email' => $adminEmail,
                'users_count' => count($userStats),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify admin about chat history cleanup', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
