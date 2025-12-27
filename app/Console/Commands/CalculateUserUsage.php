<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\FeatureUsage;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\DB;

class CalculateUserUsage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'usage:calculate {--dry-run : Preview without making changes} {--period= : Specific period (Y-m format), defaults to current month}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate and populate feature usage data for all users (conversations & AI responses)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        $period = $this->option('period') ?? now()->format('Y-m');

        // Validate period format
        if (!preg_match('/^\d{4}-\d{2}$/', $period)) {
            $this->error('Invalid period format. Use Y-m format (e.g., 2025-12)');
            return 1;
        }

        $this->info("=== Feature Usage Calculator ===");
        $this->info("Period: {$period}");
        $this->info("Mode: " . ($isDryRun ? 'DRY RUN (no changes)' : 'LIVE (will save to database)'));
        $this->newLine();

        if (!$isDryRun && !$this->confirm('This will calculate and update usage data for all users. Continue?')) {
            $this->info('Cancelled.');
            return 0;
        }

        try {
            // Get period start and end dates
            $periodStart = \Carbon\Carbon::createFromFormat('Y-m', $period)->startOfMonth();
            $periodEnd = \Carbon\Carbon::createFromFormat('Y-m', $period)->endOfMonth();

            $this->info("Calculating from {$periodStart->toDateString()} to {$periodEnd->toDateString()}");
            $this->newLine();

            // Get all users
            $users = User::with('widgets')->get();
            $this->info("Found {$users->count()} users to process");
            $this->newLine();

            $progressBar = $this->output->createProgressBar($users->count());
            $progressBar->start();

            $totalConversations = 0;
            $totalAiResponses = 0;
            $processedUsers = 0;
            $errors = [];

            foreach ($users as $user) {
                try {
                    DB::beginTransaction();

                    // Calculate conversations created this month by this user's widgets
                    $conversationsCount = Conversation::whereHas('widget', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->count();

                    // Calculate AI responses (bot messages) in user's conversations this month
                    $aiResponsesCount = Message::whereHas('conversation.widget', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    })
                    ->where('sender_type', 'bot')
                    ->whereBetween('created_at', [$periodStart, $periodEnd])
                    ->count();

                    if (!$isDryRun) {
                        // Update or create conversations usage
                        if ($conversationsCount > 0) {
                            FeatureUsage::updateOrCreate(
                                [
                                    'user_id' => $user->id,
                                    'feature_key' => 'conversation',
                                    'period' => $period,
                                ],
                                [
                                    'usage_count' => $conversationsCount,
                                ]
                            );
                        }

                        // Update or create AI responses usage
                        if ($aiResponsesCount > 0) {
                            FeatureUsage::updateOrCreate(
                                [
                                    'user_id' => $user->id,
                                    'feature_key' => 'ai_response',
                                    'period' => $period,
                                ],
                                [
                                    'usage_count' => $aiResponsesCount,
                                ]
                            );
                        }
                    }

                    DB::commit();

                    $totalConversations += $conversationsCount;
                    $totalAiResponses += $aiResponsesCount;
                    $processedUsers++;

                } catch (\Exception $e) {
                    DB::rollBack();
                    $errors[] = "User {$user->id} ({$user->email}): {$e->getMessage()}";
                }

                $progressBar->advance();
            }

            $progressBar->finish();
            $this->newLine(2);

            // Display results
            $this->info("=== Results ===");
            $this->info("Successfully processed: {$processedUsers} users");
            $this->info("Total conversations: {$totalConversations}");
            $this->info("Total AI responses: {$totalAiResponses}");

            if (count($errors) > 0) {
                $this->newLine();
                $this->error("=== Errors (" . count($errors) . ") ===");
                foreach ($errors as $error) {
                    $this->error($error);
                }
            }

            if ($isDryRun) {
                $this->newLine();
                $this->warn("DRY RUN: No data was saved. Run without --dry-run to save changes.");
            } else {
                $this->newLine();
                $this->info("✓ Usage data has been successfully updated!");
            }

            return 0;

        } catch (\Exception $e) {
            $this->error("Fatal error: {$e->getMessage()}");
            $this->error($e->getTraceAsString());
            return 1;
        }
    }
}
