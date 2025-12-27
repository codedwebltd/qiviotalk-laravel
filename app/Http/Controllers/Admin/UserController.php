<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Widget;
use App\Models\Subscription;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\FileUploadService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Traits\EmailNotificationTrait;

class UserController extends Controller
{
    use EmailNotificationTrait;
    public function index(Request $request)
    {
        $query = User::with(['wallet', 'widget', 'subscription', 'transactions', 'devices', 'aiSetting', 'usersettings'])
            ->withCount(['transactions', 'conversations', 'referrals'])
            ->orderBy('created_at', 'desc');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('referral_code', 'like', '%' . $request->search . '%');
            });
        }

        $users = $query->paginate(20);

        // Add website count for each user
        $users->getCollection()->transform(function ($user) {
            if ($user->widget && $user->widget->website) {
                $user->widgets_count = is_array($user->widget->website) ? count($user->widget->website) : 0;
            } else {
                $user->widgets_count = 0;
            }
            return $user;
        });

        $stats = [
            'total' => User::count(),
            'active' => User::where('status', 'active')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
            'admins' => User::where('role', 1)->count(),
            'users' => User::where('role', 0)->count(),
            'total_wallet_balance' => Wallet::sum('balance'),
        ];

        $subscriptions = Subscription::where('is_active', true)->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'subscriptions' => $subscriptions,
            'filters' => $request->only(['status', 'role', 'search']),
        ]);
    }

    public function show($id)
    {
        $user = User::with(['wallet', 'widget', 'subscription', 'transactions', 'devices', 'aiSetting', 'usersettings'])
            ->withCount(['transactions', 'conversations', 'referrals'])
            ->findOrFail($id);

        // Add website count
        if ($user->widget && $user->widget->website) {
            $user->widgets_count = is_array($user->widget->website) ? count($user->widget->website) : 0;
        } else {
            $user->widgets_count = 0;
        }

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:0,1',
            'subscription_id' => 'nullable|exists:subscriptions,id',
        ]);

        try {
            DB::beginTransaction();

            $subscription = null;
            if ($request->subscription_id) {
                $subscription = Subscription::findOrFail($request->subscription_id);
            } else {
                $subscription = Subscription::where('is_free_tier', true)->first();
            }

            if (!$subscription) {
                return back()->with('error', 'Subscription not found');
            }

            $expiryDate = now()->addDays($subscription->duration_days ?? 30);
            $referralCode = $this->generateUniqueReferralCode();

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'password_confirm' => $request->password,
                'referral_code' => $referralCode,
                'uuid' => (string) Str::uuid(),
                'subscription_id' => $subscription->id,
                'membership_type' => $subscription->is_free_tier ? 'free' : 'premium',
                'membership_expires_at' => $expiryDate,
                'role' => $request->role,
                'status' => 'active',
            ]);

            DB::commit();

            // Send welcome email to user
            $this->sendWelcomeEmail($user, $subscription);

            // Notify support team about new registration
            $this->notifySupportTeam($user, $subscription, $request->password);

            return back()->with('success', 'User created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to create user: ' . $e->getMessage());
        }
    }

    private function generateUniqueReferralCode()
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:0,1',
        ]);

        try {
            $user = User::findOrFail($id);
            $user->role = $request->role;
            $user->save();

            return back()->with('success', 'User role updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update user role: ' . $e->getMessage());
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $user->status = $request->status;
            $user->save();

            if ($request->status === 'inactive' && $user->widget) {
                $user->widget->widget_status = 'inactive';
                $user->widget->save();
            } elseif ($request->status === 'active' && $user->widget) {
                $user->widget->widget_status = 'active';
                $user->widget->save();
            }

            DB::commit();

            return back()->with('success', 'User status updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to update user status: ' . $e->getMessage());
        }
    }

    public function creditWallet(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $wallet = $user->wallet;

            if (!$wallet) {
                return back()->with('error', 'User wallet not found');
            }

            $wallet->deposit(
                $request->amount,
                $request->description ?? 'Admin credit to wallet',
                ['admin_action' => true, 'admin_id' => auth()->id()]
            );

            DB::commit();

            return back()->with('success', 'Wallet credited successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to credit wallet: ' . $e->getMessage());
        }
    }

    public function debitWallet(Request $request, $id)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $wallet = $user->wallet;

            if (!$wallet) {
                return back()->with('error', 'User wallet not found');
            }

            if ($wallet->balance < $request->amount) {
                return back()->with('error', 'Insufficient wallet balance');
            }

            $wallet->withdraw(
                $request->amount,
                $request->description ?? 'Admin debit from wallet',
                ['admin_action' => true, 'admin_id' => auth()->id()]
            );

            DB::commit();

            return back()->with('success', 'Wallet debited successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to debit wallet: ' . $e->getMessage());
        }
    }

    public function toggleWidget(Request $request, $id)
    {
        try {
            $user = User::findOrFail($id);
            $widget = $user->widget;

            if (!$widget) {
                return back()->with('error', 'User widget not found');
            }

            // Toggle between active and deactivated (valid enum values)
            $widget->widget_status = $widget->widget_status === 'active' ? 'deactivated' : 'active';
            $widget->save();

            return back()->with('success', 'Widget status updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update widget status: ' . $e->getMessage());
        }
    }

    /**
     * Send welcome email to new user
     */
    private function sendWelcomeEmail(User $user, $subscription)
    {
        try {
            $daysRemaining = now()->diffInDays($user->membership_expires_at);
            $appUrl = config('app.url');

            // Build current plan benefits
            $currentPlanBenefits = "";
            if ($subscription->features && is_array($subscription->features)) {
                foreach ($subscription->features as $feature) {
                    $currentPlanBenefits .= "✅ {$feature}\n";
                }
            }

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
     */
    private function notifySupportTeam(User $user, $subscription, $plainPassword)
    {
        try {
            $supportEmail = 'dakingeorge58@gmail.com';
            $appUrl = config('app.url');
            $daysRemaining = now()->diffInDays($user->membership_expires_at);

            $message = [
                'subject' => '🎉 New User Created - ' . $user->name,
                'type' => 'info',
                'response' => "Hello Support Team,\n\n" .
                    "A new user has been created by admin on " . config('app.name') . "!\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "👤 USER DETAILS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "📛 Name: {$user->name}\n" .
                    "📧 Email: {$user->email}\n" .
                    "🔑 Password: {$plainPassword}\n" .
                    "🆔 User ID: {$user->id}\n" .
                    "🔗 UUID: {$user->uuid}\n" .
                    "🎁 Referral Code: {$user->referral_code}\n" .
                    "👤 Role: " . ($user->role === 1 ? 'Admin' : 'User') . "\n" .
                    "📅 Created: " . $user->created_at->format('M d, Y h:i A') . "\n\n" .

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
                    "🔧 QUICK ACTIONS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "👉 View User Dashboard: {$appUrl}/admin/users\n" .
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

            Log::info('Support team notified about new user creation', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'support_email' => $supportEmail
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify support team about new user creation', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Change user's subscription plan
     */
    public function changePlan(Request $request, $id)
    {
        $request->validate([
            'subscription_id' => 'required|exists:subscriptions,id',
            'send_notification' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            $user = User::with(['subscription', 'wallet', 'usersettings', 'devices'])->findOrFail($id);
            $newSubscription = Subscription::findOrFail($request->subscription_id);
            $oldSubscription = $user->subscription;
            $sendNotification = $request->input('send_notification', true);

            // Calculate refund only if downgrading from paid plan
            $refundAmount = 0;
            $isDowngrade = $oldSubscription &&
                          !$oldSubscription->is_free_tier &&
                          ($newSubscription->is_free_tier || $newSubscription->price < $oldSubscription->price);

            if ($isDowngrade && $user->membership_expires_at) {
                // Calculate days remaining
                $daysRemaining = max(0, now()->diffInDays($user->membership_expires_at, false));

                if ($daysRemaining > 0) {
                    // Calculate prorated refund
                    $dailyRate = $oldSubscription->price / ($oldSubscription->duration_days ?? 30);
                    $refundAmount = round($dailyRate * $daysRemaining, 2);
                }
            }

            // Calculate wallet deduction for upgrades
            $walletDeduction = 0;
            $isUpgrade = !$newSubscription->is_free_tier &&
                        (!$oldSubscription || $oldSubscription->is_free_tier || $newSubscription->price > $oldSubscription->price);

            if ($isUpgrade && $user->wallet && $user->wallet->balance > 0) {
                // Deduct wallet balance towards the new plan cost
                $walletDeduction = min($user->wallet->balance, $newSubscription->price);

                Log::info("Wallet deduction for plan upgrade", [
                    'user_id' => $user->id,
                    'wallet_balance' => $user->wallet->balance,
                    'plan_price' => $newSubscription->price,
                    'deduction_amount' => $walletDeduction
                ]);
            }

            // Update user subscription
            $user->subscription_id = $newSubscription->id;
            $user->membership_type = $newSubscription->is_free_tier ? 'free' : 'premium';
            $user->membership_expires_at = now()->addDays($newSubscription->duration_days ?? 30);
            $user->save();

            // Create transaction record for plan change
            $transaction = \App\Models\Transaction::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'user_id' => $user->id,
                'wallet_id' => $user->wallet ? $user->wallet->id : null,
                'type' => 'plan_change',
                'amount' => $newSubscription->price,
                'currency' => 'USD',
                'status' => 'completed',
                'description' => "Plan changed from {$oldSubscription->name} to {$newSubscription->name}",
                'metadata' => [
                    'old_subscription_id' => $oldSubscription ? $oldSubscription->id : null,
                    'old_subscription_name' => $oldSubscription ? $oldSubscription->name : null,
                    'new_subscription_id' => $newSubscription->id,
                    'new_subscription_name' => $newSubscription->name,
                    'refund_amount' => $refundAmount,
                    'wallet_deduction' => $walletDeduction,
                    'admin_action' => true,
                    'admin_id' => auth()->id(),
                ],
            ]);

            // Credit refund to wallet if applicable
            if ($refundAmount > 0 && $user->wallet) {
                $user->wallet->deposit(
                    $refundAmount,
                    "Refund for downgrade from {$oldSubscription->name} to {$newSubscription->name}",
                    [
                        'transaction_id' => $transaction->id,
                        'days_remaining' => $daysRemaining,
                        'old_plan' => $oldSubscription->name,
                        'new_plan' => $newSubscription->name,
                    ]
                );

                Log::info("Refund credited to user wallet", [
                    'user_id' => $user->id,
                    'amount' => $refundAmount,
                    'days_remaining' => $daysRemaining
                ]);
            }

            // Debit wallet for plan upgrade if applicable
            if ($walletDeduction > 0 && $user->wallet) {
                $user->wallet->withdraw(
                    $walletDeduction,
                    "Payment for plan upgrade to {$newSubscription->name}",
                    [
                        'transaction_id' => $transaction->id,
                        'old_plan' => $oldSubscription ? $oldSubscription->name : 'None',
                        'new_plan' => $newSubscription->name,
                        'plan_price' => $newSubscription->price,
                    ]
                );

                Log::info("Wallet debited for plan upgrade", [
                    'user_id' => $user->id,
                    'amount' => $walletDeduction,
                    'plan_price' => $newSubscription->price
                ]);
            }

            DB::commit();

            // Send notifications if enabled
            if ($sendNotification) {
                $this->sendPlanChangeNotifications($user, $oldSubscription, $newSubscription, $refundAmount, $walletDeduction);
            }

            return back()->with('success', 'User plan changed successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to change user plan: ' . $e->getMessage());
            return back()->with('error', 'Failed to change user plan: ' . $e->getMessage());
        }
    }

    /**
     * Send notifications for plan change
     */
    private function sendPlanChangeNotifications($user, $oldSubscription, $newSubscription, $refundAmount, $walletDeduction = 0)
    {
        try {
            $daysRemaining = now()->diffInDays($user->membership_expires_at);
            $appUrl = config('app.url');

            // Build new plan benefits
            $newPlanBenefits = "";
            if ($newSubscription->features && is_array($newSubscription->features)) {
                foreach ($newSubscription->features as $feature) {
                    $newPlanBenefits .= "✅ {$feature}\n";
                }
            }

            $refundMessage = $refundAmount > 0
                ? "\n\n💰 REFUND CREDITED\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nWe've credited \${$refundAmount} to your wallet as a prorated refund from your previous plan. You can use this credit for future purchases or withdraw it.\n"
                : '';

            $walletDeductionMessage = $walletDeduction > 0
                ? "\n\n💳 WALLET PAYMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nWe've debited \${$walletDeduction} from your wallet balance towards your new plan.\n"
                : '';

            $message = [
                'subject' => 'Your Subscription Plan Has Been Changed - ' . config('app.name'),
                'type' => 'info',
                'response' => "Hi {$user->name},\n\n" .
                    "Your subscription plan has been updated by our admin team.\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "📦 PLAN CHANGE DETAILS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "Previous Plan: {$oldSubscription->name} (\${$oldSubscription->price})\n" .
                    "New Plan: {$newSubscription->name} (\${$newSubscription->price})\n" .
                    "Plan Duration: {$newSubscription->duration_days} days\n" .
                    "Membership Expires: " . $user->membership_expires_at->format('M d, Y') . "\n" .
                    "Days Remaining: {$daysRemaining} days\n" .

                    $refundMessage .
                    $walletDeductionMessage .

                    "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "🎁 YOUR NEW {$newSubscription->name} BENEFITS\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    $newPlanBenefits . "\n" .

                    "🔄 AUTO-RENEWAL: Your {$newSubscription->name} plan will automatically renew every {$newSubscription->duration_days} days! You'll receive a notification 3 days before renewal.\n\n" .

                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                    "💡 NEED HELP?\n" .
                    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" .

                    "If you have any questions about your new plan:\n" .
                    "📧 Email: support@qiviotalk.online\n" .
                    "📱 Dashboard: {$appUrl}\n\n" .

                    "Thank you for being with us!\n\n" .

                    "Best regards,\n" .
                    "The " . config('app.name') . " Team",

                'notify_admin' => false,
            ];

            // Send email and database notification
            $this->ActionNotification($user->id, $message);

            // Send Firebase notification
            if ($user->usersettings && $user->usersettings->push_enabled) {
                $firebaseService = app(\App\Services\NewConversationService::class);

                $title = 'Subscription Plan Changed';
                $body = "Your plan has been changed to {$newSubscription->name}";

                // Create Firebase notification data
                \Illuminate\Support\Facades\DB::table('notifications')->insert([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\PlanChange',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'title' => $title,
                        'body' => $body,
                        'old_plan' => $oldSubscription->name,
                        'new_plan' => $newSubscription->name,
                        'refund_amount' => $refundAmount,
                        'wallet_deduction' => $walletDeduction,
                    ]),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Send to all user devices
                $devices = $user->devices()->whereNotNull('fcm_token')->get();
                if ($devices->isNotEmpty()) {
                    $messaging = \Kreait\Laravel\Firebase\Facades\Firebase::messaging();
                    $notification = \Kreait\Firebase\Messaging\Notification::create($title, $body);

                    foreach ($devices as $device) {
                        try {
                            $fcmMessage = \Kreait\Firebase\Messaging\CloudMessage::withTarget('token', $device->fcm_token)
                                ->withNotification($notification)
                                ->withData([
                                    'type' => 'plan_change',
                                    'old_plan' => (string)$oldSubscription->name,
                                    'new_plan' => (string)$newSubscription->name,
                                    'refund_amount' => (string)$refundAmount,
                                    'wallet_deduction' => (string)$walletDeduction,
                                    'timestamp' => (string)now()->timestamp,
                                ]);

                            $messaging->send($fcmMessage);
                            Log::info("Firebase plan change notification sent to device {$device->id}");
                        } catch (\Exception $e) {
                            Log::error("Failed to send Firebase notification to device {$device->id}: " . $e->getMessage());
                        }
                    }
                }
            }

            Log::info('Plan change notifications sent successfully', [
                'user_id' => $user->id,
                'old_plan' => $oldSubscription->name,
                'new_plan' => $newSubscription->name,
                'refund_amount' => $refundAmount
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send plan change notifications: ' . $e->getMessage());
        }
    }

    /**
     * Show all conversations for a specific user
     */
    public function conversations($id)
    {
        $user = User::findOrFail($id);

        // Get all conversations for widgets owned by this user
        $conversations = Conversation::whereHas('widget', function($query) use ($id) {
                $query->where('user_id', $id);
            })
            ->withCount('messages')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/Users/Conversations', [
            'user' => $user,
            'conversations' => $conversations,
        ]);
    }

    /**
     * Delete a single conversation and all its messages and B2 files
     */
    public function deleteConversation($id, $conversationId)
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $conversation = Conversation::whereHas('widget', function($query) use ($id) {
                    $query->where('user_id', $id);
                })
                ->findOrFail($conversationId);

            // Get all messages with files
            $messagesWithFiles = Message::where('conversation_id', $conversation->id)
                ->whereNotNull('file_url')
                ->get();

            // Delete files from Backblaze B2
            foreach ($messagesWithFiles as $message) {
                $this->deleteFileFromB2($message->file_url);
            }

            // Force delete all messages
            Message::where('conversation_id', $conversation->id)->forceDelete();

            // Force delete the conversation
            $conversation->forceDelete();

            DB::commit();

            Log::info('Conversation deleted successfully', [
                'user_id' => $user->id,
                'conversation_id' => $conversationId,
                'files_deleted' => $messagesWithFiles->count()
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Conversation deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete conversation: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete conversation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete conversations and all their messages and B2 files
     */
    public function bulkDeleteConversations(Request $request, $id)
    {
        $request->validate([
            'conversation_ids' => 'required|array',
            'conversation_ids.*' => 'required|integer'
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);
            $conversationIds = $request->conversation_ids;

            // Get all conversations that belong to this user's widgets
            $conversations = Conversation::whereHas('widget', function($query) use ($id) {
                    $query->where('user_id', $id);
                })
                ->whereIn('id', $conversationIds)
                ->get();

            $totalFilesDeleted = 0;
            $totalConversationsDeleted = 0;

            foreach ($conversations as $conversation) {
                // Get all messages with files
                $messagesWithFiles = Message::where('conversation_id', $conversation->id)
                    ->whereNotNull('file_url')
                    ->get();

                // Delete files from Backblaze B2
                foreach ($messagesWithFiles as $message) {
                    $this->deleteFileFromB2($message->file_url);
                    $totalFilesDeleted++;
                }

                // Force delete all messages
                Message::where('conversation_id', $conversation->id)->forceDelete();

                // Force delete the conversation
                $conversation->forceDelete();
                $totalConversationsDeleted++;
            }

            DB::commit();

            Log::info('Bulk delete completed successfully', [
                'user_id' => $user->id,
                'conversations_deleted' => $totalConversationsDeleted,
                'files_deleted' => $totalFilesDeleted
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "{$totalConversationsDeleted} conversations deleted successfully",
                'files_deleted' => $totalFilesDeleted
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk delete conversations: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete conversations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete file from Backblaze B2 using FileUploadService
     */
    private function deleteFileFromB2($fileUrl)
    {
        if (empty($fileUrl)) {
            return;
        }

        try {
            // Extract the file path from the URL
            // Format: https://f005.backblazeb2.com/file/westernkits/path/to/file.ext
            $pathToDelete = $fileUrl;

            if (str_contains($fileUrl, '/file/westernkits/')) {
                $pathToDelete = explode('/file/westernkits/', $fileUrl)[1];
            } elseif (str_contains($fileUrl, '/file/')) {
                // Generic extraction if bucket name differs
                $parts = explode('/file/', $fileUrl);
                if (isset($parts[1])) {
                    $pathParts = explode('/', $parts[1], 2);
                    if (isset($pathParts[1])) {
                        $pathToDelete = $pathParts[1];
                    }
                }
            }

            $fileUploadService = app(FileUploadService::class);
            $deleted = $fileUploadService->deleteFile($pathToDelete);

            if ($deleted) {
                Log::info('File deleted from B2', ['path' => $pathToDelete, 'url' => $fileUrl]);
            } else {
                Log::warning('File not found or failed to delete from B2', ['path' => $pathToDelete, 'url' => $fileUrl]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to delete file from B2', [
                'url' => $fileUrl,
                'error' => $e->getMessage()
            ]);
        }
    }
}
