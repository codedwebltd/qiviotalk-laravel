<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Traits\PasswordResetTrait;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class PasswordResetController extends Controller
{
    use PasswordResetTrait;

    /**
     * Request password reset (forgot password)
     * Sends 6-digit code to user's email
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found with this email address',
                ], 404);
            }

            // Check if user account is active
            if ($user->status !== 'active') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Your account is not active. Please contact support.',
                ], 403);
            }

            // Send reset code
            $sent = $this->sendPasswordResetCode($user);

            if (!$sent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to send reset code. Please try again later.',
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Password reset code has been sent to your email',
                'data' => [
                    'email' => $user->email,
                    'expires_in_minutes' => 15,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Forgot password failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request',
            ], 500);
        }
    }

    /**
     * Verify the 6-digit reset code
     */
    public function verifyCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|integer|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found',
                ], 404);
            }

            $verified = $this->verifyResetCode($user, (int) $request->code);

            if (!$verified) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid or expired verification code',
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Verification code is valid',
                'data' => [
                    'email' => $user->email,
                    'verified' => true,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Code verification failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while verifying the code',
            ], 500);
        }
    }

    /**
     * Reset password with verified code
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|integer|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found',
                ], 404);
            }

            $reset = $this->resetPasswordWithCode($user, (int) $request->code, $request->password);

            if (!$reset) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid or expired verification code',
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Password has been reset successfully. Please login with your new password.',
                'data' => [
                    'email' => $user->email,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Password reset failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while resetting your password',
            ], 500);
        }
    }

    /**
     * Resend verification code
     */
    public function resendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User not found',
                ], 404);
            }

            // Check if there's an existing valid code to prevent spam
            if ($user->reset_code && $user->reset_code_expires_at &&
                now()->isBefore($user->reset_code_expires_at->subMinutes(13))) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'A reset code was recently sent. Please wait a few minutes before requesting a new one.',
                    'data' => [
                        'retry_after_seconds' => now()->diffInSeconds($user->reset_code_expires_at->subMinutes(13)),
                    ],
                ], 429);
            }

            // Send new reset code
            $sent = $this->sendPasswordResetCode($user);

            if (!$sent) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to send reset code. Please try again later.',
                ], 500);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'A new verification code has been sent to your email',
                'data' => [
                    'email' => $user->email,
                    'expires_in_minutes' => 15,
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('Resend code failed', [
                'email' => $request->email,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while resending the code',
            ], 500);
        }
    }
}
