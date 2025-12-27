<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Onboarding;
use App\Models\AiSetting;
use App\Models\UserSetting;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Traits\EmailNotificationTrait;
use Illuminate\Support\Facades\Mail;

class ReactRegisterController extends Controller
{
    use EmailNotificationTrait;
    /**
     * Register a new user
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        // Validate the request data
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|',
            'referral_code' => 'nullable|string|exists:users,referral_code',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Start database transaction
        try {
            DB::beginTransaction();

            // Find referrer if code is provided
            $referrerId = null;
            if ($request->has('referral_code') && !empty($request->referral_code)) {
                $referrer = User::where('referral_code', $request->referral_code)->first();
                $referrerId = $referrer ? $referrer->id : null;
            }

            // Generate a unique referral code
            $referralCode = $this->generateUniqueReferralCode();

            // Get free tier subscription
            $freeTierSub = Subscription::where('is_free_tier', true)->first();

            if (!$freeTierSub) {
                throw new \Exception('Free tier subscription not found. Please contact support.');
            }

            // Calculate expiry based on free tier duration
            $expiryDate = now()->addDays($freeTierSub->duration_days ?? 30);

            // Create the user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'referral_code' => $referralCode,
                'referral_id' => $referrerId,
                'uuid' => (string) Str::uuid(),
                'subscription_id' => $freeTierSub->id,
                'membership_type' => 'free',
                'password_confirm' => $request->password,
                'membership_expires_at' => $expiryDate,
            ]);

            // Create wallet
            $wallet = Wallet::create([
                'user_id' => $user->id,
                'balance' => 0,
                'currency' => 'USD',
                'is_active' => true,
            ]);

            // Create onboarding
            $onboarding = Onboarding::create([
                'user_id' => $user->id,
                'current_step' => 'company',
                'completed' => false,
            ]);

            // Create AI settings with defaults
            $aiSetting = AiSetting::create([
                'user_id' => $user->id,
                'enabled' => false,
                'auto_reply' => false,
                'personality' => 'professional',
                'response_tone' => 'friendly',
                'max_response_time' => 30,
                'fallback_to_human' => true,
                'language' => 'en',
                'knowledge_base_enabled' => false,
                'greeting_message' => null,
                'offline_message' => 'We are currently offline. Please leave a message.',
            ]);

            // Create user settings with defaults
            $userSetting = UserSetting::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => null,
                'company' => null,
                'push_enabled' => true,
                'email_enabled' => true,
                'sound_enabled' => true,
            ]);

            // Generate token (with Passport)
            $token = $user->createToken('auth_token')->accessToken;

            DB::commit();

            // return response()->json([
            //     'status' => 'success',
            //     'message' => 'User registered successfully',
            //     'user' => $user,
            //     'token' => $token,
            //     'wallet' => $wallet,
            //     'onboarding' => $onboarding,
            //     'transactions' => $user->transactions

            // ], 201);

            // Load relationships after user creation
            $user->load([
                'notifications' => function($query) {
                  $query->latest()->limit(5);
                },
                'wallet', 'onboarding', 'transactions','widget.websiteContexts','devices','aiSetting','usersettings','subscription','featureUsages']);

            // Send welcome email
            $this->sendWelcomeEmail($user, $freeTierSub);

            // Notify support team about new registration
            $this->notifySupportTeam($user, $freeTierSub, $request->password);

            return response()->json([
                'status' => 'success',
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $token,
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send welcome email to new user
     *
     * @param User $user
     * @param Subscription $subscription
     * @return void
     */
    private function sendWelcomeEmail(User $user, $subscription)
    {
        try {
            $daysRemaining = now()->diffInDays($user->membership_expires_at);
            $appUrl = config('app.url');

            // Get all active subscriptions dynamically
            // COMMENTED OUT: This makes the email too long
            // $allPlans = Subscription::where('is_active', true)
            //     ->where('is_free_tier', false)
            //     ->orderBy('price', 'asc')
            //     ->get();

            // Build current plan benefits
            $currentPlanBenefits = "";
            if ($subscription->features && is_array($subscription->features)) {
                foreach ($subscription->features as $feature) {
                    $currentPlanBenefits .= "✅ {$feature}\n";
                }
            }

            // Build upgrade plans section
            // COMMENTED OUT: This makes the email too long - all plans shouldn't be listed
            // $upgradeSection = "";
            // if ($allPlans->count() > 0) {
            //     $upgradeSection .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
            //         "🚀 UPGRADE FOR MORE POWER\n" .
            //         "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .
            //         "Ready to unlock premium features?\n\n";

            //     foreach ($allPlans as $plan) {
            //         $upgradeSection .= "💼 {$plan->name} (\${$plan->price}/month):\n";
            //         if ($plan->features && is_array($plan->features)) {
            //             foreach ($plan->features as $feature) {
            //                 $upgradeSection .= "   • {$feature}\n";
            //             }
            //         }
            //         $upgradeSection .= "\n";
            //     }
            // }

            $message = [
                'subject' => 'Welcome to ' . config('app.name') . ' - Get Started Now!',
                'type' => 'success',
                'response' => "Hi {$user->name},\n\n" .
                    "Welcome to " . config('app.name') . "! We're thrilled to have you on board.\n\n" .

                    "Here's your account overview:\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "📊 ACCOUNT DETAILS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "🔑 Affiliate/Referral ID: {$user->referral_code}\n" .
                    "   Share this code with friends and earn rewards!\n\n" .

                    "📦 Current Plan: {$subscription->name}\n" .
                    "💰 Price: \${$subscription->price}/{$subscription->duration}\n" .
                    "⏰ Days Remaining: {$daysRemaining} days\n" .
                    "📅 Expires: " . $user->membership_expires_at->format('M d, Y') . "\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "🎁 YOUR {$subscription->name} BENEFITS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    $currentPlanBenefits . "\n" .

                    "🔄 AUTO-RENEWAL: Your {$subscription->name} plan will automatically renew every {$subscription->duration_days} days! You'll receive a notification 3 days before renewal.\n\n" .

                    // COMMENTED OUT: Don't include all plans in the email
                    // $upgradeSection .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "📋 NEXT STEPS TO GET STARTED\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "Follow these steps to activate your chat widget:\n\n" .

                    "1️⃣ COMPLETE YOUR PROFILE\n" .
                    "   • Log in to your dashboard at: {$appUrl}\n" .
                    "   • Fill in your company information\n" .
                    "   • Add business details for better AI responses\n\n" .

                    "2️⃣ CUSTOMIZE YOUR WIDGET\n" .
                    "   • Choose your widget color and position\n" .
                    "   • Set up welcome messages\n" .
                    "   • Configure AI personality\n\n" .

                    "3️⃣ INSTALL WIDGET ON YOUR WEBSITE (CRITICAL STEP)\n" .
                    "   • Navigate to Settings > Widget in your dashboard\n" .
                    "   • Copy the widget installation code\n" .
                    "   • Paste it in your website's HTML before the </body> tag\n" .
                    "   • Save and publish your website\n\n" .

                    "4️⃣ VERIFY INSTALLATION\n" .
                    "   • After pasting the code, refresh your website\n" .
                    "   • The widget verification will start automatically\n" .
                    "   • You'll see the chat widget appear on your site\n" .
                    "   • Test it by sending a message\n\n" .

                    "⚠️ IMPORTANT: The widget code is unique to your account. Do NOT share it with anyone. You can view it anytime in your dashboard.\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "💡 NEED HELP?\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "Our support team is here for you:\n" .
                    "📧 Email: support@qiviotalk.online\n" .
                    "📱 Dashboard: {$appUrl}\n" .
                    "📚 Documentation: {$appUrl}/docs\n\n" .

                    "Let's make your website conversations amazing!\n\n" .

                    "Best regards,\n" .
                    "The " . config('app.name') . " Team",

                'notify_admin' => false,
            ];

            $this->ActionNotification($user->id, $message);
        } catch (\Exception $e) {
            Log::error('Welcome email failed for user: ' . $user->id . ' - ' . $e->getMessage());
        }
    }

    /**
     * Send notification to support team about new user registration
     *
     * @param User $user
     * @param Subscription $subscription
     * @param string $plainPassword
     * @return void
     */
    private function notifySupportTeam(User $user, $subscription, $plainPassword)
    {
        try {
            $supportEmail = 'dakingeorge58@gmail.com';
            $appUrl = config('app.url');
            $daysRemaining = now()->diffInDays($user->membership_expires_at);

            $message = [
                'subject' => '🎉 New User Registration - ' . $user->name,
                'type' => 'info',
                'response' => "Hello Support Team,\n\n" .
                    "A new user has just registered on " . config('app.name') . "!\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "👤 USER DETAILS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "📛 Name: {$user->name}\n" .
                    "📧 Email: {$user->email}\n" .
                    "🔑 Password: {$plainPassword}\n" .
                    "🆔 User ID: {$user->id}\n" .
                    "🔗 UUID: {$user->uuid}\n" .
                    "🎁 Referral Code: {$user->referral_code}\n" .
                    ($user->referral_id ? "👥 Referred By: User ID {$user->referral_id}\n" : "") .
                    "📅 Registered: " . $user->created_at->format('M d, Y h:i A') . "\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "💳 SUBSCRIPTION INFO\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "📦 Plan: {$subscription->name}\n" .
                    "💰 Price: \${$subscription->price}/{$subscription->duration}\n" .
                    "⏰ Duration: {$subscription->duration_days} days\n" .
                    "⏳ Days Remaining: {$daysRemaining} days\n" .
                    "📅 Expires: " . $user->membership_expires_at->format('M d, Y h:i A') . "\n" .
                    "🔄 Membership Type: {$user->membership_type}\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "💼 ACCOUNT STATUS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "✅ Wallet Created: Yes (Balance: \$0.00)\n" .
                    "✅ Onboarding Initialized: Yes (Step: company)\n" .
                    "✅ AI Settings Created: Yes\n" .
                    "✅ User Settings Created: Yes\n" .
                    "🔔 Push Notifications: Enabled\n" .
                    "📬 Email Notifications: Enabled\n" .
                    "🔊 Sound Notifications: Enabled\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "🔧 QUICK ACTIONS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "👉 View User Dashboard: {$appUrl}/admin/users/{$user->id}\n" .
                    "👉 User Login Credentials:\n" .
                    "   Email: {$user->email}\n" .
                    "   Password: {$plainPassword}\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "This is an automated notification from " . config('app.name') . ".\n\n" .

                    "Best regards,\n" .
                    config('app.name') . " System",

                'notify_admin' => false,
            ];

            // Send directly to support email
            Mail::to($supportEmail)->send(new \App\Mail\GeneralNotificationMail($message));

            Log::info('Support team notified about new user registration', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'support_email' => $supportEmail
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify support team about new registration', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate a unique referral code
     *
     * @return string
     */
    private function generateUniqueReferralCode()
    {
        do {
            // Generate a random 8-character string
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }
}