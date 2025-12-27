<?php

namespace App\Traits;

use App\Models\User;
use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

trait PasswordResetTrait
{
    /**
     * Generate a 6-digit reset code
     */
    protected function generateResetCode(): int
    {
        return random_int(100000, 999999);
    }

    /**
     * Send password reset code to user's email
     */
    protected function sendPasswordResetCode(User $user): bool
    {
        try {
            // Generate 6-digit code
            $resetCode = $this->generateResetCode();

            // Store code and expiry time (15 minutes from now)
            $user->update([
                'reset_code' => $resetCode,
                'reset_code_expires_at' => Carbon::now()->addMinutes(15),
            ]);

            // Send email
            Mail::to($user->email)->send(new PasswordResetMail($resetCode, $user->name));

            Log::info('Password reset code sent', [
                'user_id' => $user->id,
                'email' => $user->email,
                'expires_at' => $user->reset_code_expires_at,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send password reset code', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Verify the reset code
     */
    protected function verifyResetCode(User $user, int $code): bool
    {
        // Check if code exists
        if (!$user->reset_code) {
            Log::warning('No reset code found for user', ['user_id' => $user->id]);
            return false;
        }

        // Check if code has expired
        if (Carbon::now()->isAfter($user->reset_code_expires_at)) {
            Log::warning('Reset code expired', [
                'user_id' => $user->id,
                'expired_at' => $user->reset_code_expires_at,
            ]);
            return false;
        }

        // Verify code matches
        if ($user->reset_code !== $code) {
            Log::warning('Invalid reset code provided', [
                'user_id' => $user->id,
                'provided_code' => $code,
            ]);
            return false;
        }

        return true;
    }

    /**
     * Reset user password with verified code
     */
    protected function resetPasswordWithCode(User $user, int $code, string $newPassword): bool
    {
        try {
            // Verify code first
            if (!$this->verifyResetCode($user, $code)) {
                return false;
            }

            // Update password and clear reset code
            $user->update([
                'password' => Hash::make($newPassword),
                'reset_code' => null,
                'reset_code_expires_at' => null,
            ]);

            // Revoke all existing tokens for security
            $user->tokens()->delete();

            Log::info('Password reset successful', ['user_id' => $user->id]);

            return true;
        } catch (\Exception $e) {
            Log::error('Password reset failed', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return false;
        }
    }

    /**
     * Clear expired reset codes (can be called by a scheduled task)
     */
    protected function clearExpiredResetCodes(): int
    {
        try {
            $cleared = User::where('reset_code_expires_at', '<', Carbon::now())
                ->whereNotNull('reset_code')
                ->update([
                    'reset_code' => null,
                    'reset_code_expires_at' => null,
                ]);

            Log::info('Cleared expired reset codes', ['count' => $cleared]);

            return $cleared;
        } catch (\Exception $e) {
            Log::error('Failed to clear expired reset codes', [
                'error' => $e->getMessage(),
            ]);

            return 0;
        }
    }
}
