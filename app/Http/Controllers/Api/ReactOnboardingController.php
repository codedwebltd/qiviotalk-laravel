<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Widget;
use App\Models\Onboarding;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;


class ReactOnboardingController extends Controller
{

/**
 * Update onboarding step
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\Response
 */
public function updateStep(Request $request)
{
    // Get authenticated user first to check subscription limits
    $user = Auth::user();

    // Get widget limit from subscription
    $widgetLimit = $user->features()->get('widget_limit', 1);

    // Validate request data with dynamic validation based on subscription
    $validator = Validator::make($request->all(), [
        'current_step' => 'required|string|in:company,website,appearance,finish',
        'company_name' => 'nullable|string|max:255',
        'industry' => 'nullable|string|max:255',
        'team_size' => 'nullable|string|max:255',
        'website' => 'nullable|array|max:' . $widgetLimit,
        'website.*' => 'url|max:255',
        'primary_goal' => 'nullable|string|max:255',
        'widget_position' => 'nullable|string|in:left,right',
        'primary_color' => 'nullable|string|max:255',
        'chat_icon' => 'nullable|string|max:255',
        'brand_logo' => 'nullable|string',
        'welcome_message' => 'nullable|string',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'status' => 'error',
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    // Validate websites if provided
    if ($request->has('website') && !empty($request->website)) {
        $websites = is_array($request->website) ? $request->website : [$request->website];
        $validatedWebsites = [];

        foreach ($websites as $websiteUrl) {
            // Enforce HTTPS on website URL
            if (!preg_match('/^https?:\/\//i', $websiteUrl)) {
                // If no protocol specified, add https://
                $websiteUrl = 'https://' . $websiteUrl;
            } elseif (preg_match('/^http:\/\//i', $websiteUrl)) {
                // If http://, replace with https://
                $websiteUrl = preg_replace('/^http:\/\//i', 'https://', $websiteUrl);
            }

            // 1. Check if website is alive/active
            $isWebsiteAlive = $this->checkWebsiteAvailability($websiteUrl);
            if (!$isWebsiteAlive) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Website is not reachable or does not exist',
                    'errors' => ['website' => ["The website URL '{$websiteUrl}' is not accessible"]]
                ], 422);
            }

            // 2. Check if website already exists for another user
            $existingWidgets = Widget::where('user_id', '!=', $user->id)->get();
            foreach ($existingWidgets as $existingWidget) {
                $existingWebsites = is_array($existingWidget->website) ? $existingWidget->website : [$existingWidget->website];
                if (in_array($websiteUrl, $existingWebsites)) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'This website is already registered',
                        'errors' => ['website' => ["The website '{$websiteUrl}' is already being used by another account"]]
                    ], 422);
                }
            }

            $validatedWebsites[] = $websiteUrl;
        }

        // Update the request with the validated HTTPS URLs
        $request->merge(['website' => $validatedWebsites]);
    }

    // Get or create onboarding record
    $onboarding = Onboarding::where('user_id', $user->id)->first();

    if (!$onboarding) {
        $onboarding = new Onboarding();
        $onboarding->user_id = $user->id;
    }

    // Handle brand_logo upload if present
    if ($request->has('brand_logo') && !empty($request->input('brand_logo'))) {
        $fileService = app(\App\Services\FileUploadService::class);
        $existingLogo = $onboarding->brand_logo ?? null;

        try {
            $uploadResult = $fileService->uploadBase64Image(
                $request->input('brand_logo'),
                'livechat/brand-logos',
                $existingLogo,
                $user->id
            );

            if ($uploadResult['success']) {
                $request->merge(['brand_logo' => $uploadResult['url']]);
            }
        } catch (\Exception $e) {
            Log::error('Brand logo upload failed', ['error' => $e->getMessage()]);
        }
    }

    // Update fields that are present in the request
    foreach ($request->all() as $key => $value) {
        if (in_array($key, [
            'company_name', 'industry', 'team_size',
            'website', 'primary_goal', 'widget_position',
            'primary_color', 'chat_icon', 'brand_logo', 'welcome_message'
        ])) {
            $onboarding->$key = $value;
        }
    }

    // Update current_step in onboarding table
    if ($request->has('current_step')) {
        $onboarding->current_step = $request->current_step;
    }

    // Get or create widget
    $widget = $user->widget;
    if (!$widget) {
        // Create a new widget with default values
        $widget = new Widget();
        $widget->user_id = $user->id;
        $widget->widget_key = $widget->generateWidgetKey();
        $widget->name = $user->name . "'s Widget";
        $widget->is_installed = false;
    }

    // Update widget fields if they're present in the request
    if ($request->has('website')) {
        $widget->website = $request->website;
    }

    if ($request->has('widget_position')) {
        $widget->position = $request->widget_position;
    }

    if ($request->has('primary_color')) {
        $widget->color = $request->primary_color;
    }

    if ($request->has('chat_icon')) {
        $widget->icon = $request->chat_icon;
    }

    if ($request->has('brand_logo')) {
        $widget->brand_logo = $request->brand_logo;
    }

    if ($request->has('welcome_message')) {
        $widget->welcome_message = $request->welcome_message;
    }

    // Save the widget
    $widget->save();

    // Update user's onboarding_step based on current_step
    $stepMapping = [
        'company' => 1,
        'website' => 2,
        'appearance' => 3,
        'finish' => 4
    ];

    if (isset($stepMapping[$request->current_step])) {
        $user->onboarding_step = $stepMapping[$request->current_step];
    }

    // Check if all required fields are filled before marking as complete
    $isComplete = false;
    if ($request->current_step === 'finish') {
        $requiredFields = [
            'company_name', 'industry', 'team_size',
            'website', 'primary_goal', 'widget_position',
            'primary_color', 'chat_icon'
        ];

        $isComplete = true;
        foreach ($requiredFields as $field) {
            if (empty($onboarding->$field)) {
                $isComplete = false;
                break;
            }
        }

        if ($isComplete) {
            $onboarding->completed = true;
            $onboarding->completed_at = now();

            // Update the user's onboarding_completed flag
            $user->onboarding_completed = true;
        }
    }

    // Save user with updated onboarding_step and onboarding_completed
    $user->save();

    $onboarding->save();

    //regenerate users widget script
    Artisan::call('widgets:update-scripts', [
    'widget_key' => $widget->widget_key, 
    '--obfuscate' => true
   ]);
    

    Log::info('Updated onboarding for user ID: ' . $user->id . ' - Step: ' . $request->current_step);

    // Load relationships
    $user->load(['wallet', 'onboarding', 'transactions', 'widget']);//devices,aiSetting

    return response()->json([
        'status' => 'success',
        'message' => 'Onboarding step updated successfully',
        'user' => $user,
        'onboarding' => $onboarding,
        'wallet' => $user->wallet,
        'transactions' => $user->transactions,
        'widget' => $user->widget,
        'onboarding_completed' => $user->onboarding_completed,
        'is_complete' => $isComplete
    ]);
}

    /**
     * Check if website is alive/accessible
     *
     * @param string $url
     * @return bool
     */
    private function checkWebsiteAvailability($url)
    {
        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'User-Agent' => config('aiconfig.scraping.user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'),
                ])
                ->withOptions([
                    'verify' => false, // Don't verify SSL
                ])
                ->get($url);

            // Check if status code is successful (2xx or 3xx)
            return $response->successful() || $response->redirect();

        } catch (\Exception $e) {
            Log::error('Website availability check failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get current onboarding state
     *
     * @return \Illuminate\Http\Response
     */
    public function getOnboarding()
    {
        // Get authenticated user
        $user = Auth::user();

        // Get onboarding data
        $onboarding = Onboarding::where('user_id', $user->id)->first();

        if (!$onboarding) {
            return response()->json([
                'status' => 'error',
                'message' => 'Onboarding not found'
            ], 404);
        }

        Log::info('Retrieved onboarding for user ID: ' . $user->id);
        return response()->json([
            'status' => 'success',
            'onboarding' => $onboarding
        ]);

    }

    /**
 * Skip onboarding
 *
 * @param  \Illuminate\Http\Request  $request
 * @return \Illuminate\Http\Response
 */
public function skipOnboarding(Request $request)
{
    // Get authenticated user
    $user = Auth::user();

    // Enforce HTTPS on website URL if provided
    if ($request->has('website') && !empty($request->website)) {
        $websites = is_array($request->website) ? $request->website : [$request->website];
        $validatedWebsites = [];

        foreach ($websites as $websiteUrl) {
            if (!preg_match('/^https?:\/\//i', $websiteUrl)) {
                $websiteUrl = 'https://' . $websiteUrl;
            } elseif (preg_match('/^http:\/\//i', $websiteUrl)) {
                $websiteUrl = preg_replace('/^http:\/\//i', 'https://', $websiteUrl);
            }
            $validatedWebsites[] = $websiteUrl;
        }

        $request->merge(['website' => $validatedWebsites]);
    }

    // Get or create onboarding record
    $onboarding = Onboarding::where('user_id', $user->id)->first();

    if (!$onboarding) {
        $onboarding = new Onboarding();
        $onboarding->user_id = $user->id;
    }

    // Update any fields that were provided in the request
    $updatableFields = [
        'company_name', 'industry', 'team_size',
        'website', 'primary_goal', 'widget_position',
        'primary_color', 'chat_icon', 'welcome_message'
    ];

    foreach ($updatableFields as $field) {
        if ($request->has($field) && !empty($request->$field)) {
            $onboarding->$field = $request->$field;
        }
    }

    // DO NOT mark as completed when skipping
    // Just save whatever data was provided
    $onboarding->save();

    // Ensure user has a widget
    $widget = $user->widget;
    if (!$widget) {
        // Create a basic widget with default values
        $widget = new Widget();
        $widget->user_id = $user->id;
        $widget->widget_key = $widget->generateWidgetKey();
        $widget->name = $user->name . "'s Widget";
        $widget->position = $request->widget_position ?? 'right';
        $widget->color = $request->primary_color ?? '#3B82F6';
        $widget->icon = $request->chat_icon ?? 'comments';
        $widget->welcome_message = $request->welcome_message ?? 'Hi there! How can I help you today?';
        $widget->website = $request->website ?? null;
        $widget->is_installed = false;
        $widget->save();
        //Add at the end of the created method in UserObserver
        app(\App\Http\Controllers\Api\WidgetController::class)->generateWidgetScript($widget);
    } else {
        // Update existing widget with any provided data
        if ($request->has('website')) $widget->website = $request->website;
        if ($request->has('widget_position')) $widget->position = $request->widget_position;
        if ($request->has('primary_color')) $widget->color = $request->primary_color;
        if ($request->has('chat_icon')) $widget->icon = $request->chat_icon;
        if ($request->has('welcome_message')) $widget->welcome_message = $request->welcome_message;
        $widget->save();

        // Regenerate widget script
        Artisan::call('widgets:update-scripts', [
         'widget_key' => $widget->widget_key, 
         '--obfuscate' => true
       ]);
        
    }

    // Update user's onboarding_step to current progress (don't mark complete)
    // Keep onboarding_completed as false since they skipped
    // Only update onboarding_step if we have data
    if ($onboarding->company_name) {
        $user->onboarding_step = 1;
        if ($onboarding->website) {
            $user->onboarding_step = 2;
            if ($onboarding->primary_color) {
                $user->onboarding_step = 3;
            }
        }
    }

    $user->save();

    Log::info('User ID: ' . $user->id . ' skipped onboarding with partial data');

    // Load relationships
    $user->load([
                'notifications' => function($query) {
                  $query->latest()->limit(5); // Only load 10 most recent
                },
                'wallet', 'onboarding', 'transactions','widget.websiteContexts',
                'devices','aiSetting','usersettings']);

    return response()->json([
        'status' => 'success',
        'message' => 'Onboarding skipped - you can complete it later',
        'user' => $user,
        'onboarding' => $onboarding,
        'wallet' => $user->wallet,
        'transactions' => $user->transactions,
        'widget' => $user->widget,
        'onboarding_completed' => $user->onboarding_completed
    ]);
}
}
