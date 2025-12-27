<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Widget;
use App\Models\WidgetWebsiteContext;

class UserObserver
{
    /**
     * Handle the User "created" event.
     *
     * @param  \App\Models\User  $user
     * @return void
     */
    public function created(User $user)
    {
        // Create default widget for new user
        $widget = new Widget();
        $widget->user_id = $user->id;
        $widget->widget_key = $widget->generateWidgetKey();
        $widget->name = 'LiveChat Widget';
        // Better approach - sync with subscription
        if ($user->membership_expires_at) {
            $widget->widget_expiry_date = $user->membership_expires_at;
        } else {
            $widget->widget_expiry_date = now()->addMonth(1); // Free tier default
        }
        //$widget->widget_expiry_date = now()->addMonth(1);
        
        // If onboarding data exists, use it
        if ($user->onboarding) {
            $widget->position = $user->onboarding->widget_position ?? 'right';
            $widget->color = $user->onboarding->primary_color ?? '#3B82F6';
            $widget->icon = $user->onboarding->chat_icon ?? 'comments';
            $widget->welcome_message = $user->onboarding->welcome_message ?? 'Hi there! How can I help you today?';
        }
        
        $widget->save();

        // Create base website context for the widget
        // COMMENTED OUT: No website exists at registration time
        // Website contexts will be created when user adds websites via onboarding/settings
        // $this->createBaseWebsiteContext($widget, $user);

        // Add at the end of the created method in UserObserver
        app(\App\Http\Controllers\Api\WidgetController::class)->generateWidgetScript($widget);
    }

    /**
     * Create base website context with detailed instruction template
     *
     * @param  \App\Models\Widget  $widget
     * @param  \App\Models\User  $user
     * @return voidple
     */
    protected function createBaseWebsiteContext(Widget $widget, User $user)
    {
        // Get website URL from onboarding if available, otherwise use placeholder
        $websiteUrl = $user->onboarding?->website_url ?? 'https://your-website.com';

        // Create detailed instruction template for full_context
        $fullContext = "[COMPANY NAME] specializes in [DESCRIBE YOUR PRODUCTS/SERVICES]. All products/services are delivered [INSTANTLY/WITHIN 24 HOURS/YOUR TIMELINE].\n\n";

        $fullContext .= "Key Information:\n";
        $fullContext .= "- Company Name: [YOUR COMPANY NAME]\n";
        $fullContext .= "- Industry: [E.g., E-commerce, SaaS, Healthcare, Education, etc.]\n";
        $fullContext .= "- Website: {$websiteUrl}\n";
        $fullContext .= "- Payment Methods: [E.g., Credit Cards, PayPal, Stripe, Cryptocurrency, etc.]\n";
        $fullContext .= "- Support: [E.g., 24/7 Live Chat, Email Support, Phone Support]\n";
        $fullContext .= "- Delivery: [E.g., Instant digital delivery, 2-3 business days, etc.]\n";
        $fullContext .= "- Business Hours: [E.g., Mon-Fri 9AM-5PM EST or 24/7]\n\n";

        $fullContext .= "Products & Services:\n";
        $fullContext .= "1. [Product/Service Name] - [Brief description] - [Starting price]\n";
        $fullContext .= "2. [Product/Service Name] - [Brief description] - [Starting price]\n";
        $fullContext .= "3. [Product/Service Name] - [Brief description] - [Starting price]\n";
        $fullContext .= "4. [Add more as needed]\n\n";

        $fullContext .= "What Makes [YOUR COMPANY] Different:\n";
        $fullContext .= "- [Unique selling point 1 - e.g., Fastest delivery in industry]\n";
        $fullContext .= "- [Unique selling point 2 - e.g., 100% money-back guarantee]\n";
        $fullContext .= "- [Unique selling point 3 - e.g., Award-winning customer support]\n";
        $fullContext .= "- [Unique selling point 4 - e.g., Industry-leading features]\n";
        $fullContext .= "- [Add more unique qualities]\n\n";

        $fullContext .= "Common Customer Questions:\n";
        $fullContext .= "- How do I get started? [Your answer]\n";
        $fullContext .= "- What payment methods do you accept? [Your answer]\n";
        $fullContext .= "- How long does delivery take? [Your answer]\n";
        $fullContext .= "- Do you offer refunds? [Your answer]\n";
        $fullContext .= "- How can I contact support? [Your answer]\n\n";

        $fullContext .= "Important Notes for AI Support:\n";
        $fullContext .= "- Never provide fake contact information - always use verified company channels\n";
        $fullContext .= "- For pricing inquiries, [provide exact prices / direct to sales team / check pricing page]\n";
        $fullContext .= "- For order-specific questions, always [check order status / escalate to human agent]\n";
        $fullContext .= "- For account issues, direct users to [login page / support email / live agent]\n";
        $fullContext .= "- For technical problems, [provide troubleshooting steps / escalate to tech support]\n";
        $fullContext .= "- Tone: [Professional / Friendly / Casual / Formal - describe your brand voice]\n";
        $fullContext .= "- Language: [Supportive and empathetic / Direct and efficient / etc.]\n\n";

        $fullContext .= "INSTRUCTIONS: Replace all [BRACKETED SECTIONS] with your actual business information. Be specific and detailed - the more context you provide, the better the AI can assist your customers.";

        WidgetWebsiteContext::create([
            'widget_id' => $widget->id,
            'website_url' => $websiteUrl,
            'full_context' => $fullContext,
            'is_active' => true,
            'scrape_status' => 'pending',
        ]);
    }
}