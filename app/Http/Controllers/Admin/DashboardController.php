<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\Widget;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Get stats efficiently
        $stats = $this->getStats();

        // Get recent conversations
        $recentConversations = $this->getRecentConversations();

        // Get recent activity
        $recentActivity = $this->getRecentActivity();

        // Get chart data
        $chartData = $this->getChartData();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentConversations' => $recentConversations,
            'recentActivity' => $recentActivity,
            'chartData' => $chartData,
        ]);
    }

    private function getStats()
    {
        $now = Carbon::now();
        $yesterday = Carbon::yesterday();

        // Total users and growth
        $totalUsers = User::count();
        $usersYesterday = User::where('created_at', '<=', $yesterday)->count();
        $userGrowth = $usersYesterday > 0 ? round((($totalUsers - $usersYesterday) / $usersYesterday) * 100, 1) : 0;

        // Premium members (non-free tier)
        $premiumMembers = User::where('membership_type', '!=', 'free')->count();

        // Active conversations
        $activeConversations = Conversation::where('status', 'open')->count();

        // Messages today
        $messagesToday = Message::whereDate('created_at', $now->toDateString())->count();
        $messagesYesterday = Message::whereDate('created_at', $yesterday->toDateString())->count();
        $messageGrowth = $messagesYesterday > 0 ? round((($messagesToday - $messagesYesterday) / $messagesYesterday) * 100, 1) : 0;

        // Widget stats
        $unverifiedWidgets = Widget::where('is_installed', false)->count();
        $inactiveWidgets = Widget::where(function($query) use ($now) {
            $query->whereNull('last_verified_at')
                  ->orWhere('last_verified_at', '<', $now->copy()->subDays(30));
        })->count();
        $scheduledForDeletion = Widget::whereIn('widget_status', ['fraudulent', 'suspended'])->count();
        $activeWidgets = Widget::where('widget_status', 'active')
            ->where('is_installed', true)
            ->count();

        // Financial stats
        $totalRevenue = Transaction::where('status', 'completed')
            ->where('type', 'deposit')
            ->sum('amount');

        $pendingRefunds = DB::table('wallets')
            ->join('transactions', 'wallets.id', '=', 'transactions.wallet_id')
            ->where('transactions.status', 'pending')
            ->where('transactions.type', 'withdrawal')
            ->sum('transactions.amount');

        // Subscription stats
        $activeSubscriptions = DB::table('subscriptions')
            ->where('is_active', true)
            ->count();

        // User devices stats
        $totalDevices = DB::table('user_devices')->count();
        $activeDevices = DB::table('user_devices')
            ->where('last_used_at', '>=', $now->copy()->subDays(7))
            ->count();

        // Additional stats
        $totalConversations = Conversation::count();
        $totalMessages = Message::count();

        return [
            'totalUsers' => $totalUsers,
            'userGrowth' => $userGrowth,
            'premiumMembers' => $premiumMembers,
            'activeConversations' => $activeConversations,
            'messagesToday' => $messagesToday,
            'messageGrowth' => $messageGrowth,
            'unverifiedWidgets' => $unverifiedWidgets,
            'inactiveWidgets' => $inactiveWidgets,
            'scheduledForDeletion' => $scheduledForDeletion,
            'activeWidgets' => $activeWidgets,
            'totalRevenue' => number_format($totalRevenue, 2),
            'pendingRefunds' => number_format($pendingRefunds, 2),
            'activeSubscriptions' => $activeSubscriptions,
            'totalDevices' => $totalDevices,
            'activeDevices' => $activeDevices,
            'totalConversations' => $totalConversations,
            'totalMessages' => $totalMessages,
        ];
    }

    private function calculateAverageResponseTime()
    {
        // Get average time between visitor message and agent response
        $conversations = Conversation::where('status', 'closed')
            ->where('closed_at', '>=', Carbon::now()->subDays(7))
            ->with(['messages' => function($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->limit(100)
            ->get();

        $totalResponseTime = 0;
        $responseCount = 0;

        foreach ($conversations as $conversation) {
            $lastVisitorMessage = null;

            foreach ($conversation->messages as $message) {
                if ($message->sender_type === 'visitor') {
                    $lastVisitorMessage = $message;
                } elseif ($message->sender_type === 'agent' && $lastVisitorMessage) {
                    $responseTime = $lastVisitorMessage->created_at->diffInMinutes($message->created_at);
                    $totalResponseTime += $responseTime;
                    $responseCount++;
                    $lastVisitorMessage = null;
                }
            }
        }

        if ($responseCount === 0) {
            return '0m';
        }

        $avgMinutes = round($totalResponseTime / $responseCount);

        if ($avgMinutes < 60) {
            return $avgMinutes . 'm';
        } else {
            $hours = floor($avgMinutes / 60);
            $minutes = $avgMinutes % 60;
            return $hours . 'h ' . $minutes . 'm';
        }
    }

    private function getRecentConversations()
    {
        return Conversation::with(['widget.user:id,name,email', 'messages' => function($query) {
            $query->latest()->limit(1);
        }])
            ->withCount('messages')
            ->latest('last_message_at')
            ->limit(10)
            ->get()
            ->map(function($conversation) {
                $lastMessage = $conversation->messages->first();

                return [
                    'id' => $conversation->id,
                    'visitor_name' => $conversation->visitor_name ?: 'Anonymous',
                    'visitor_email' => $conversation->visitor_email,
                    'visitor_location' => $conversation->visitor_location,
                    'visitor_ip' => $conversation->visitor_ip,
                    'widget_id' => $conversation->widget->id ?? null,
                    'widget_name' => $conversation->widget->name ?? 'Unknown',
                    'widget_owner' => $conversation->widget->user->name ?? 'Unknown',
                    'widget_owner_email' => $conversation->widget->user->email ?? null,
                    'status' => $conversation->status,
                    'last_message' => $lastMessage ? substr($lastMessage->content, 0, 50) : '',
                    'last_message_at' => $conversation->last_message_at?->diffForHumans(),
                    'messages_count' => $conversation->messages_count,
                    'has_new_messages' => $conversation->has_new_messages,
                    'created_at' => $conversation->created_at->format('M d, Y h:i A'),
                ];
            });
    }

    private function getRecentActivity()
    {
        $activities = collect();

        // Recent user registrations
        $recentUsers = User::latest()
            ->limit(5)
            ->get()
            ->map(function($user) {
                return [
                    'type' => 'user_registered',
                    'icon' => 'user',
                    'color' => 'blue',
                    'title' => 'New user registered',
                    'description' => $user->name . ' (' . $user->email . ')',
                    'details' => 'Membership: ' . ucfirst($user->membership_type ?? 'free'),
                    'time' => $user->created_at->diffForHumans(),
                    'timestamp' => $user->created_at->format('M d, Y h:i A'),
                    'raw_time' => $user->created_at->toIso8601String(),
                ];
            });

        // Recent messages/widget interactions
        $recentMessages = Message::with(['conversation.widget.user'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function($message) {
                $widget = $message->conversation?->widget;
                // Use visitor_referrer from conversation to get actual domain
                $domain = $message->conversation?->visitor_referrer ? parse_url($message->conversation->visitor_referrer, PHP_URL_HOST) : 'Unknown domain';

                return [
                    'type' => 'widget_interaction',
                    'icon' => 'message',
                    'color' => 'green',
                    'title' => 'Widget interaction',
                    'description' => ($message->sender_type === 'visitor' ? 'Visitor' : 'Agent') . ' sent message',
                    'details' => 'Domain: ' . $domain . ' • Widget: ' . ($widget?->name ?? 'Unknown'),
                    'owner' => $widget?->user?->name ?? 'Unknown',
                    'message_preview' => substr($message->content, 0, 60) . (strlen($message->content) > 60 ? '...' : ''),
                    'time' => $message->created_at->diffForHumans(),
                    'timestamp' => $message->created_at->format('M d, Y h:i A'),
                    'raw_time' => $message->created_at->toIso8601String(),
                ];
            });

        // Recent closed conversations
        $closedConversations = Conversation::with(['widget.user'])
            ->where('status', 'closed')
            ->whereNotNull('closed_at')
            ->latest('closed_at')
            ->limit(5)
            ->get()
            ->map(function($conversation) {
                $widget = $conversation->widget;
                // Use visitor_referrer to get actual domain
                $domain = $conversation->visitor_referrer ? parse_url($conversation->visitor_referrer, PHP_URL_HOST) : 'Unknown domain';

                return [
                    'type' => 'conversation_closed',
                    'icon' => 'chat',
                    'color' => 'purple',
                    'title' => 'Conversation closed',
                    'description' => 'Chat with ' . ($conversation->visitor_name ?: 'Anonymous'),
                    'details' => 'Domain: ' . $domain . ' • Widget: ' . ($widget?->name ?? 'Unknown'),
                    'owner' => $widget?->user?->name ?? 'Unknown',
                    'time' => $conversation->closed_at->diffForHumans(),
                    'timestamp' => $conversation->closed_at->format('M d, Y h:i A'),
                    'raw_time' => $conversation->closed_at->toIso8601String(),
                ];
            });

        // Recent widget deployments/verifications
        $recentWidgets = DB::table('notifications')
            ->where('type', 'App\Notifications\WidgetVisitor')
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(function($notification) {
                $data = json_decode($notification->data, true);
                $user = User::find($notification->notifiable_id);
                $widget = $user?->widget;
                $domain = $data['domain'] ?? 'Unknown';

                return [
                    'type' => 'widget_deployed',
                    'icon' => 'widget',
                    'color' => 'emerald',
                    'title' => 'Widget verified',
                    'description' => $widget?->name ?? 'LiveChat Widget',
                    'details' => 'Domain: ' . $domain . ' • Status: ' . ucfirst($widget?->widget_status ?? 'active'),
                    'owner' => $user?->name ?? 'Unknown',
                    'time' => \Carbon\Carbon::parse($notification->created_at)->diffForHumans(),
                    'timestamp' => \Carbon\Carbon::parse($notification->created_at)->format('M d, Y h:i A'),
                    'raw_time' => \Carbon\Carbon::parse($notification->created_at)->toIso8601String(),
                ];
            });

        // Recent new conversations
        $newConversations = Conversation::with(['widget.user'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function($conversation) {
                $widget = $conversation->widget;
                // Use visitor_referrer to get actual domain
                $domain = $conversation->visitor_referrer ? parse_url($conversation->visitor_referrer, PHP_URL_HOST) : 'Unknown domain';

                return [
                    'type' => 'conversation_started',
                    'icon' => 'chat-new',
                    'color' => 'indigo',
                    'title' => 'New conversation started',
                    'description' => ($conversation->visitor_name ?: 'Anonymous visitor') . ' started chat',
                    'details' => 'Domain: ' . $domain . ' • Location: ' . ($conversation->visitor_location ?: 'Unknown'),
                    'owner' => $widget?->user?->name ?? 'Unknown',
                    'time' => $conversation->created_at->diffForHumans(),
                    'timestamp' => $conversation->created_at->format('M d, Y h:i A'),
                    'raw_time' => $conversation->created_at->toIso8601String(),
                ];
            });

        // Merge and sort all activities by raw timestamp
        $activities = $activities->merge($recentUsers)
            ->merge($recentMessages)
            ->merge($closedConversations)
            ->merge($recentWidgets)
            ->merge($newConversations)
            ->sortByDesc('raw_time')
            ->take(15)
            ->values();

        return $activities;
    }

    private function getChartData()
    {
        // Get messages per day for the last 7 days
        $last7Days = collect();
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $count = Message::whereDate('created_at', $date->toDateString())->count();

            $last7Days->push([
                'date' => $date->format('M d'),
                'count' => $count,
            ]);
        }

        return [
            'messages' => $last7Days,
        ];
    }
}
