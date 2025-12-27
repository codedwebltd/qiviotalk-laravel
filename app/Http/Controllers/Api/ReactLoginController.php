<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Events\UserLoggedIn;
use App\Services\NewConversationService;

class ReactLoginController extends Controller
{
    /**
     * Login a user and return token
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Update last login timestamp
        $user->last_login_at = now();
        $user->save();

        // Send FCM force logout to other devices FIRST (before deleting tokens/devices)
        //app(NewConversationService::class)->forceLogoutOtherDevices($user, $request->fcm_token);

        // NOW revoke all existing tokens for this user (force logout from all other sessions)
        //$user->tokens()->delete();

        // Generate NEW token for this login session
        $token = $user->createToken('auth_token')->accessToken;

        // Broadcast user logged in event (WebSocket)
        //broadcast(new UserLoggedIn($user));

        // return response()->json([
        //     'status' => 'success',
        //     'message' => 'Login successful',
        //     'user' => $user,
        //     'token' => $token,
        //     'onboarding_completed' => $user->onboarding_completed,
        //     'wallet' => $user->wallet,
        //     'onboarding' => $user->onboarding,
        //     'transactions' => $user->transactions

        // ]);

        // Load relationships after user retrieval
        //$user->load(['notifications','wallet', 'onboarding', 'transactions', 'widget.websiteContext','devices','aiSetting','usersettings']);
        $user->load([
                'notifications' => function($query) {
                  $query->latest()->limit(5);
                },
                'wallet', 'onboarding', 'transactions','widget.websiteContexts','devices','aiSetting','usersettings','subscription','featureUsages']);
                
        return response()->json([
            'status' => 'success',
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'onboarding_completed' => $user->onboarding_completed,
        ]);
    }

    /**
     * Logout a user (revoke token)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]);
    }


   // ============================================
// CONTROLLER METHOD - updateFcmToken
// ============================================
// Place this in your API controller (e.g., AuthController or NotificationController)

public function updateFcmToken(Request $request)
{
    $request->validate([
        'fcm_token' => 'required|string',
        'platform' => 'nullable|string|in:android,ios,web',
        'device_name' => 'nullable|string|max:255',
    ]);

    $user = Auth::user();
    $fcmToken = $request->fcm_token;
    $platform = $request->platform ?? 'unknown';
    $deviceName = $request->device_name ?? ($platform . ' device');

    try {
        // Check if this exact token already exists for this user
        $existingDevice = $user->devices()
            ->where('fcm_token', $fcmToken)
            ->first();

        if ($existingDevice) {
            // Token already exists, just update last_used_at
            $existingDevice->update([
                'last_used_at' => now(),
                'platform' => $platform, // Update platform in case it changed
                'device_name' => $deviceName,
            ]);

            Log::info("FCM token already exists for user {$user->id}, updated device {$existingDevice->id}");

            return response()->json([
                'success' => true,
                'message' => 'FCM token updated',
                'device_id' => $existingDevice->id,
            ]);
        }

        // Check if this token exists for a DIFFERENT user
        $tokenInUse = \App\Models\UserDevice::where('fcm_token', $fcmToken)
            ->where('user_id', '!=', $user->id)
            ->first();

        if ($tokenInUse) {
            // Token belongs to another user - remove it from that user
            // This happens when user logs out and logs in with different account on same device
            Log::info("FCM token found on different user {$tokenInUse->user_id}, removing and reassigning to user {$user->id}");
            $tokenInUse->delete();
        }

        // Create new device entry
        $device = $user->devices()->create([
            'fcm_token' => $fcmToken,
            'platform' => $platform,
            'device_name' => $deviceName,
            'last_used_at' => now(),
        ]);

        Log::info("New FCM token registered for user {$user->id}: Platform={$platform}, Device={$device->id}, Token={$fcmToken}");

        return response()->json([
            'success' => true,
            'message' => 'FCM token registered successfully',
            'device_id' => $device->id,
        ]);

    } catch (\Exception $e) {
        Log::error('Failed to update FCM token: ' . $e->getMessage());

        return response()->json([
            'success' => false,
            'message' => 'Failed to register FCM token',
            'error' => $e->getMessage(),
        ], 500);
    }
}

}
