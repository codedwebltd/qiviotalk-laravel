<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CleanupOldConversation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;
    public $deletionStats = [];

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
    public $timeout = 180;

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
            // Get user's subscription chat history retention days
            $retentionDays = $this->user->subscription->feature_limits['Chat_history_days'] ?? -1;

            // Skip if unlimited (-1) or invalid
            if ($retentionDays <= 0) {
                Log::info('User has unlimited chat history, skipping cleanup', [
                    'user_id' => $this->user->id,
                    'retention_days' => $retentionDays,
                ]);
                return;
            }

            Log::info('Starting chat history cleanup', [
                'user_id' => $this->user->id,
                'email' => $this->user->email,
                'retention_days' => $retentionDays,
            ]);

            // Calculate cutoff date
            $cutoffDate = Carbon::now()->subDays($retentionDays);

            DB::beginTransaction();

            // Get widget IDs for this user
            $widgetIds = $this->user->widgets->pluck('id');

            if ($widgetIds->isEmpty()) {
                Log::info('User has no widgets', [
                    'user_id' => $this->user->id,
                ]);
                DB::commit();
                return;
            }

            // Delete only messages older than retention period (check MESSAGE created_at, not conversation)
            $messagesDeleted = DB::table('messages')
                ->whereIn('conversation_id', function($query) use ($widgetIds) {
                    $query->select('id')
                        ->from('conversations')
                        ->whereIn('widget_id', $widgetIds);
                })
                ->where('created_at', '<', $cutoffDate)
                ->delete();

            if ($messagesDeleted === 0) {
                Log::info('No old messages to cleanup', [
                    'user_id' => $this->user->id,
                ]);
                DB::commit();
                return;
            }

            // Count affected conversations (conversations that had old messages deleted)
            $conversationsAffected = DB::table('conversations')
                ->whereIn('widget_id', $widgetIds)
                ->whereExists(function($query) use ($cutoffDate) {
                    $query->select(DB::raw(1))
                        ->from('messages')
                        ->whereColumn('messages.conversation_id', 'conversations.id')
                        ->where('messages.created_at', '<', $cutoffDate);
                })
                ->count();

            DB::commit();

            $this->deletionStats = [
                'user_id' => $this->user->id,
                'user_name' => $this->user->name,
                'user_email' => $this->user->email,
                'subscription' => $this->user->subscription->name,
                'retention_days' => $retentionDays,
                'cutoff_date' => $cutoffDate->toDateTimeString(),
                'conversations_affected' => $conversationsAffected,
                'messages_deleted' => $messagesDeleted,
            ];

            Log::info('Chat history cleanup completed', $this->deletionStats);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to cleanup chat history', [
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Get deletion statistics
     */
    public function getDeletionStats(): array
    {
        return $this->deletionStats;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('CleanupOldConversation job failed', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
