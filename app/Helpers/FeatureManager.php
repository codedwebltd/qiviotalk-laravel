<?php

namespace App\Helpers;

use App\Models\User;
use App\Models\FeatureUsage;

class FeatureManager
{
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Check if user has a specific feature
     */
    public function has(string $feature): bool
    {
        $subscription = $this->user->subscription;

        if (!$subscription || !$subscription->feature_limits) {
            return false;
        }

        return isset($subscription->feature_limits[$feature]) && $subscription->feature_limits[$feature];
    }

    /**
     * Get feature value (for numeric limits)
     */
    public function get(string $feature, $default = null)
    {
        $subscription = $this->user->subscription;

        if (!$subscription || !$subscription->feature_limits) {
            return $default;
        }

        return $subscription->feature_limits[$feature] ?? $default;
    }

    /**
     * Check if user can perform action based on limit
     */
    public function canCreate(string $resource): bool
    {
        $limitKey = $resource . '_limit';
        $limit = $this->get($limitKey, 0);

        if ($limit === -1 || $limit === 'unlimited') {
            return true;
        }

        // Count user's current resources
        $currentCount = match($resource) {
            'widget', 'widgets' => $this->user->widgets()->count(),
            'conversation', 'conversations' => $this->user->conversations()->count(),
            'team_member', 'team_members' => $this->user->teamMembers()->count(),
            default => 0
        };

        return $currentCount < $limit;
    }

    /**
     * Get remaining limit for a resource
     */
    public function remaining(string $resource): int
    {
        $limitKey = $resource . '_limit';
        $limit = $this->get($limitKey, 0);

        if ($limit === -1 || $limit === 'unlimited') {
            return PHP_INT_MAX;
        }

        $currentCount = match($resource) {
            'widget', 'widgets' => $this->user->widgets()->count(),
            'conversation', 'conversations' => $this->user->conversations()->count(),
            'team_member', 'team_members' => $this->user->teamMembers()->count(),
            default => 0
        };

        return max(0, $limit - $currentCount);
    }

    /**
     * Get all feature limits
     */
    public function all(): array
    {
        $subscription = $this->user->subscription;

        if (!$subscription || !$subscription->feature_limits) {
            return [];
        }

        return $subscription->feature_limits;
    }

    /**
     * Check if subscription is active and not expired
     */
    public function isActive(): bool
    {
        if (!$this->user->subscription_id) {
            return false;
        }

        if (!$this->user->membership_expires_at) {
            return true; // Lifetime subscription
        }

        return $this->user->membership_expires_at > now();
    }

    /**
     * Get subscription name
     */
    public function planName(): string
    {
        return $this->user->subscription?->name ?? 'No Plan';
    }

    /**
     * Check if user can use a feature (checks usage limits)
     */
    public function canUse(string $feature): bool
    {
        $limitKey = $feature . '_limit';
        $limit = $this->get($limitKey, 0);

        // Unlimited
        if ($limit === -1 || $limit === 'unlimited') {
            return true;
        }

        // No limit set
        if ($limit === 0) {
            return false;
        }

        // Check current usage
        $currentUsage = FeatureUsage::getCurrentUsage($this->user->id, $feature);

        return $currentUsage < $limit;
    }

    /**
     * Increment feature usage
     */
    public function incrementUsage(string $feature, int $amount = 1): void
    {
        FeatureUsage::incrementUsage($this->user->id, $feature, $amount);
    }

    /**
     * Get current usage for a feature
     */
    public function getUsage(string $feature): int
    {
        return FeatureUsage::getCurrentUsage($this->user->id, $feature);
    }

    /**
     * Get remaining usage for a feature
     */
    public function remainingUsage(string $feature): int
    {
        $limitKey = $feature . '_limit';
        $limit = $this->get($limitKey, 0);

        // Unlimited
        if ($limit === -1 || $limit === 'unlimited') {
            return PHP_INT_MAX;
        }

        $currentUsage = FeatureUsage::getCurrentUsage($this->user->id, $feature);

        return max(0, $limit - $currentUsage);
    }
}
