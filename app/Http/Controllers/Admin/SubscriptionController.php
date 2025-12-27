<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of subscriptions
     */
    public function index()
    {
        $subscriptions = Subscription::latest()->paginate(10);

        $stats = [
            'total' => Subscription::count(),
            'active' => Subscription::where('is_active', true)->count(),
            'free' => Subscription::where('is_free_tier', true)->count(),
        ];

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'stats' => $stats,
        ]);
    }

    /**
     * Show the form for editing the specified subscription
     */
    public function edit(Subscription $subscription)
    {
        return Inertia::render('Admin/Subscriptions/Edit', [
            'subscription' => $subscription,
        ]);
    }

    /**
     * Update the specified subscription
     */
    public function update(Request $request, Subscription $subscription)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|string|max:255',
            'duration_days' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
            'feature_limits' => 'nullable|array',
            'is_active' => 'boolean',
            'is_free_tier' => 'boolean',
        ]);

        $subscription->update($validated);

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Subscription updated successfully');
    }

    /**
     * Create a new subscription
     */
    public function create()
    {
        return Inertia::render('Admin/Subscriptions/Create');
    }

    /**
     * Store a newly created subscription
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|string|max:255',
            'duration_days' => 'nullable|integer|min:0',
            'features' => 'nullable|array',
            'feature_limits' => 'nullable|array',
            'is_active' => 'boolean',
            'is_free_tier' => 'boolean',
        ]);

        Subscription::create($validated);

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Subscription created successfully');
    }

    /**
     * Toggle subscription active status
     */
    public function toggleActive(Subscription $subscription)
    {
        $subscription->update([
            'is_active' => !$subscription->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Subscription status updated');
    }

    /**
     * Delete subscription
     */
    public function destroy(Subscription $subscription)
    {
        $subscription->delete();

        return redirect()->route('admin.subscriptions.index')
            ->with('success', 'Subscription deleted successfully');
    }
}
