<?php

namespace App\Jobs;

use App\Models\User;
use App\Models\GlobalSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;

class CleanupInactiveUser implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;
    public $deletionDetails = [];

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
            DB::beginTransaction();

            Log::info('Starting cleanup for inactive user', [
                'user_id' => $this->user->id,
                'email' => $this->user->email,
            ]);

            // Collect user info before deletion
            $this->collectUserInfo();

            // Delete widget files from filesystem
            $this->deleteWidgetFiles();

            // Delete related records
            $this->deleteRelatedRecords();

            // Hard delete user (this will cascade to remaining relationships)
            $this->user->forceDelete();

            DB::commit();

            // Send email notification to admin
            $this->notifyAdmin();

            Log::info('Successfully cleaned up inactive user', [
                'user_id' => $this->deletionDetails['user_id'],
                'email' => $this->deletionDetails['email'],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to cleanup inactive user', [
                'user_id' => $this->user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Collect user information before deletion
     */
    private function collectUserInfo(): void
    {
        $this->deletionDetails = [
            'user_id' => $this->user->id,
            'name' => $this->user->name,
            'email' => $this->user->email,
            'created_at' => $this->user->created_at->toDateTimeString(),
            'last_login_at' => $this->user->last_login_at ? $this->user->last_login_at->toDateTimeString() : 'Never',
            'email_verified_at' => $this->user->email_verified_at ? $this->user->email_verified_at->toDateTimeString() : 'Not Verified',
            'subscription' => $this->user->subscription?->name ?? 'None',
            'membership_expires_at' => $this->user->membership_expires_at ? $this->user->membership_expires_at->toDateTimeString() : 'N/A',
            'widgets_count' => $this->user->widgets()->count(),
            'conversations_count' => $this->user->conversations()->count(),
            'transactions_count' => $this->user->transactions()->count(),
            'wallet_balance' => $this->user->wallet?->balance ?? 0,
            'feature_usages_count' => $this->user->featureUsages()->count(),
            'devices_count' => $this->user->devices()->count(),
            'widget_files_deleted' => [],
        ];
    }

    /**
     * Delete widget files from filesystem
     */
    private function deleteWidgetFiles(): void
    {
        $widgets = $this->user->widgets;
        $deletedFiles = [];

        foreach ($widgets as $widget) {
            $filename = 'widget-' . $widget->widget_key . '.js';
            $filePath = public_path('widgets/' . $filename);

            if (File::exists($filePath)) {
                File::delete($filePath);
                $deletedFiles[] = $filename;
                Log::info('Deleted widget file', ['file' => $filename]);
            }
        }

        $this->deletionDetails['widget_files_deleted'] = $deletedFiles;
    }

    /**
     * Delete related records
     */
    private function deleteRelatedRecords(): void
    {
        // Delete widgets (this will cascade to conversations, messages, etc.)
        $this->user->widgets()->each(function ($widget) {
            // Delete widget website contexts
            $widget->websiteContexts()->delete();

            // Delete conversations and their messages
            $widget->conversations()->each(function ($conversation) {
                $conversation->messages()->delete();
                $conversation->delete();
            });

            $widget->delete();
        });

        // Delete user-specific records
        $this->user->wallet()->delete();
        $this->user->onboarding()->delete();
        $this->user->aiSetting()->delete();
        $this->user->usersettings()->delete();
        $this->user->transactions()->delete();
        $this->user->featureUsages()->delete();
        $this->user->devices()->delete();

        // Delete notifications
        DB::table('notifications')->where('notifiable_id', $this->user->id)->delete();

        // Delete OAuth tokens (Passport)
        DB::table('oauth_access_tokens')->where('user_id', $this->user->id)->delete();
        DB::table('oauth_refresh_tokens')
            ->whereIn('access_token_id', function($query) {
                $query->select('id')
                    ->from('oauth_access_tokens')
                    ->where('user_id', $this->user->id);
            })->delete();
    }

    /**
     * Send email notification to admin
     */
    private function notifyAdmin(): void
    {
        try {
            $settings = GlobalSetting::get();
            $adminEmail = $settings->support_email ?? 'dakingeorge58@gmail.com';

            $message = [
                'subject' => '🗑️ Inactive User Cleanup Report - ' . $this->deletionDetails['email'],
                'type' => 'warning',
                'response' => $this->buildEmailContent(),
                'notify_admin' => false,
            ];

            Mail::to($adminEmail)->send(new \App\Mail\GeneralNotificationMail($message));

            Log::info('Admin notified about user cleanup', [
                'user_id' => $this->deletionDetails['user_id'],
                'admin_email' => $adminEmail,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify admin about user cleanup', [
                'user_id' => $this->deletionDetails['user_id'],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Build detailed email content
     */
    private function buildEmailContent(): string
    {
        $details = $this->deletionDetails;

        $content = "Hello Admin,\n\n";
        $content .= "An inactive user account has been permanently deleted from the system.\n\n";

        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $content .= "👤 USER INFORMATION\n";
        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        $content .= "🆔 User ID: {$details['user_id']}\n";
        $content .= "📛 Name: {$details['name']}\n";
        $content .= "📧 Email: {$details['email']}\n";
        $content .= "📅 Registered: {$details['created_at']}\n";
        $content .= "🔑 Last Login: {$details['last_login_at']}\n";
        $content .= "✉️ Email Verified: {$details['email_verified_at']}\n\n";

        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $content .= "💳 SUBSCRIPTION DETAILS\n";
        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        $content .= "📦 Plan: {$details['subscription']}\n";
        $content .= "⏰ Membership Expiry: {$details['membership_expires_at']}\n\n";

        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $content .= "📊 DELETED DATA SUMMARY\n";
        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        $content .= "🔧 Widgets: {$details['widgets_count']}\n";
        $content .= "💬 Conversations: {$details['conversations_count']}\n";
        $content .= "💳 Transactions: {$details['transactions_count']}\n";
        $content .= "💰 Wallet Balance: \${$details['wallet_balance']}\n";
        $content .= "📊 Feature Usages: {$details['feature_usages_count']}\n";
        $content .= "📱 Devices: {$details['devices_count']}\n\n";

        if (!empty($details['widget_files_deleted'])) {
            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            $content .= "🗑️ DELETED WIDGET FILES\n";
            $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

            foreach ($details['widget_files_deleted'] as $file) {
                $content .= "📄 {$file}\n";
            }
            $content .= "\n";
        }

        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        $content .= "✅ CLEANUP COMPLETED\n";
        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

        $content .= "All user data, widgets, conversations, and files have been permanently removed.\n";
        $content .= "This action cannot be undone.\n\n";

        $content .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        $content .= "This is an automated notification from " . config('app.name') . ".\n\n";
        $content .= "Best regards,\n";
        $content .= config('app.name') . " System";

        return $content;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('CleanupInactiveUser job failed', [
            'user_id' => $this->user->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
