<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SubscriptionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Free Tier - Trial & Basic Users
        \App\Models\Subscription::create([
            'name' => 'Starter',
            'price' => 0.00,
            'duration' => 'monthly',
            'duration_days' => 30,
            'features' => [
                'Up to 100 conversations/month',
                '1 chat widget',
                'Basic AI assistant',
                '24-hour chat history',
                'Email support',
                'Mobile app access',
            ],
            'is_active' => true,
            'is_free_tier' => true,
        ]);

        // Professional Tier - Small Businesses
        \App\Models\Subscription::create([
            'name' => 'Professional',
            'price' => 29.99,
            'duration' => 'monthly',
            'duration_days' => 30,
            'features' => [
                'Up to 1,000 conversations/month',
                '3 chat widgets',
                'Advanced AI with custom personality',
                'Unlimited chat history',
                '24/7 priority email support',
                'Basic analytics & reports',
                'Custom branding',
                'API access',
                'Knowledge base integration',
            ],
            'is_active' => true,
            'is_free_tier' => false,
        ]);

        // Business Tier - Growing Companies
        \App\Models\Subscription::create([
            'name' => 'Business',
            'price' => 79.99,
            'duration' => 'monthly',
            'duration_days' => 30,
            'features' => [
                'Up to 5,000 conversations/month',
                '10 chat widgets',
                'Advanced AI with multiple personalities',
                'Unlimited chat history',
                '24/7 priority support (email & chat)',
                'Advanced analytics & custom reports',
                'Full custom branding',
                'Full API access',
                'Knowledge base & file uploads',
                'Team collaboration (up to 5 users)',
                'Automated workflows',
                'WhatsApp & SMS integration',
            ],
            'is_active' => true,
            'is_free_tier' => false,
        ]);

        // Enterprise Tier - Large Organizations
        \App\Models\Subscription::create([
            'name' => 'Enterprise',
            'price' => 199.99,
            'duration' => 'monthly',
            'duration_days' => 30,
            'features' => [
                'Unlimited conversations',
                'Unlimited chat widgets',
                'Enterprise-grade AI with custom training',
                'Unlimited chat history',
                'Dedicated account manager',
                '24/7 premium support (phone, email, chat)',
                'Custom analytics & BI integration',
                'White-label solution',
                'Advanced API & webhooks',
                'Enterprise knowledge base',
                'Unlimited team members',
                'Advanced security & compliance',
                'Custom integrations',
                'SLA guarantee (99.9% uptime)',
                'On-premise deployment option',
            ],
            'is_active' => true,
            'is_free_tier' => false,
        ]);
    }
}
