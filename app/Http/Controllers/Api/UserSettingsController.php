<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Artisan;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class UserSettingsController extends Controller
{
    public function updateSettings(Request $request)
    {
        $user = $request->user();
        $type = $request->input('type');

        Log::info('App\Http\Controllers\Api\UserSettingsController@updateSettings called'. json_encode($request->all()));
        Log::info('Updating settings for user ID: ' . $user->id . ' Type: ' . $type);

        try {
            DB::beginTransaction();

            if ($type === 'account') {
                // Update user name
                if ($request->has('name')) {
                    $user->name = $request->input('name');
                    $user->save();
                }

                // Update user settings
                $user->usersettings()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'name' => $request->input('name'),
                        'email' => $request->input('email'),
                        'phone' => $request->input('phone'),
                        'company' => $request->input('company'),
                    ]
                );

                // Update company_name in onboarding table
                if ($request->has('name')) {
                    $user->onboarding()->updateOrCreate(
                        ['user_id' => $user->id],
                        ['company_name' => $request->input('name')]
                    );
                }
            } elseif ($type === 'appearance') {
                // Update widget settings
                $widget = $user->widget;
                if ($widget) {
                    $widget->update([
                        'color' => $request->input('color'),
                        'position' => $request->input('position'),
                        'icon' => $request->input('icon'),
                        'welcome_message' => $request->input('welcome_message'),
                    ]);

                    // Handle website array if present
                    if ($request->has('website')) {
                        $websites = $request->input('website', []);

                        // Ensure websites is array
                        if (!is_array($websites)) {
                            $websites = [$websites];
                        }

                        // Get widget limit from subscription
                        $widgetLimit = $user->features()->get('widget_limit', 1);

                        // Check subscription limit
                        if (count($websites) > $widgetLimit) {
                            throw new \Exception("Your plan allows {$widgetLimit} domain(s). Please upgrade to add more domains.");
                        }

                        // Validate and enforce HTTPS on each website
                        $validatedWebsites = [];
                        foreach ($websites as $websiteUrl) {
                            if (empty($websiteUrl)) continue;

                            // Enforce HTTPS
                            if (!preg_match('/^https?:\/\//i', $websiteUrl)) {
                                $websiteUrl = 'https://' . $websiteUrl;
                            } elseif (preg_match('/^http:\/\//i', $websiteUrl)) {
                                $websiteUrl = preg_replace('/^http:\/\//i', 'https://', $websiteUrl);
                            }

                            // Check if website already exists for another user
                            $existingWidgets = \App\Models\Widget::where('user_id', '!=', $user->id)->get();
                            foreach ($existingWidgets as $existingWidget) {
                                $existingWebsites = is_array($existingWidget->website) ? $existingWidget->website : [$existingWidget->website];
                                if (in_array($websiteUrl, $existingWebsites)) {
                                    throw new \Exception("The website '{$websiteUrl}' is already being used by another account");
                                }
                            }

                            $validatedWebsites[] = $websiteUrl;
                        }

                        // Update widget websites
                        $widget->website = $validatedWebsites;
                        $widget->save();

                        // Update onboarding websites as well
                        $user->onboarding()->updateOrCreate(
                            ['user_id' => $user->id],
                            ['website' => $validatedWebsites]
                        );
                    }

                    // Handle brand_logo upload if present
                    if ($request->has('brand_logo') && !empty($request->input('brand_logo'))) {
                        $brandLogo = $request->input('brand_logo');

                        // Check if it's a base64 image or already a URL
                        if (str_starts_with($brandLogo, 'data:image/') || str_starts_with($brandLogo, 'data:application/')) {
                            // It's a base64 image, upload it
                            $fileService = app(\App\Services\FileUploadService::class);
                            $uploadResult = $fileService->uploadBase64Image(
                                $brandLogo,
                                'livechat/brand-logos',
                                $widget->brand_logo,
                                $user->id
                            );

                            if ($uploadResult['success']) {
                                $widget->brand_logo = $uploadResult['url'];
                                $widget->save();

                                // Update onboarding brand_logo as well
                                $user->onboarding()->updateOrCreate(
                                    ['user_id' => $user->id],
                                    ['brand_logo' => $uploadResult['url']]
                                );
                            }
                        } elseif (filter_var($brandLogo, FILTER_VALIDATE_URL)) {
                            // It's already a URL, just update it
                            $widget->brand_logo = $brandLogo;
                            $widget->save();

                            // Update onboarding brand_logo as well
                            $user->onboarding()->updateOrCreate(
                                ['user_id' => $user->id],
                                ['brand_logo' => $brandLogo]
                            );
                        }
                    }

                    // Regenerate widget script
                    Artisan::call('widgets:update-scripts', [
                        'widget_key' => $widget->widget_key,
                        '--obfuscate' => true
                    ]);
                }
            } elseif ($type === 'notifications') {
                // Update notification settings
                $user->usersettings()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'push_enabled' => $request->input('push_enabled', false),
                        'email_enabled' => $request->input('email_enabled', false),
                        'sound_enabled' => $request->input('sound_enabled', true),
                    ]
                );
            } elseif ($type === 'website') {
                // Update widget websites
                $widget = $user->widget;
                if (!$widget) {
                    throw new \Exception('No widget found for user');
                }

                // Get widget limit from subscription
                $widgetLimit = $user->features()->get('widget_limit', 1);
                $websites = $request->input('website', []);

                // Ensure websites is array
                if (!is_array($websites)) {
                    $websites = [$websites];
                }

                // Check subscription limit
                if (count($websites) > $widgetLimit) {
                    throw new \Exception("Your plan allows {$widgetLimit} domain(s). Please upgrade to add more domains.");
                }

                // Validate and enforce HTTPS on each website
                $validatedWebsites = [];
                foreach ($websites as $websiteUrl) {
                    if (empty($websiteUrl)) continue;

                    // Enforce HTTPS
                    if (!preg_match('/^https?:\/\//i', $websiteUrl)) {
                        $websiteUrl = 'https://' . $websiteUrl;
                    } elseif (preg_match('/^http:\/\//i', $websiteUrl)) {
                        $websiteUrl = preg_replace('/^http:\/\//i', 'https://', $websiteUrl);
                    }

                    // Check if website already exists for another user
                    $existingWidgets = \App\Models\Widget::where('user_id', '!=', $user->id)->get();
                    foreach ($existingWidgets as $existingWidget) {
                        $existingWebsites = is_array($existingWidget->website) ? $existingWidget->website : [$existingWidget->website];
                        if (in_array($websiteUrl, $existingWebsites)) {
                            throw new \Exception("The website '{$websiteUrl}' is already being used by another account");
                        }
                    }

                    $validatedWebsites[] = $websiteUrl;
                }

                // Update widget websites
                $widget->website = $validatedWebsites;
                $widget->save();

                // Update onboarding websites as well
                $user->onboarding()->updateOrCreate(
                    ['user_id' => $user->id],
                    ['website' => $validatedWebsites]
                );

                // Regenerate widget script
                Artisan::call('widgets:update-scripts', [
                    'widget_key' => $widget->widget_key,
                    '--obfuscate' => true
                ]);
            }

            DB::commit();

            // Load relationships after update (excluding transactions)
            $user->load(['wallet', 'onboarding', 'widget.websiteContexts','devices','aiSetting','usersettings','subscription','featureUsages']);

            // Get paginated transactions separately
            $perPage = $request->input('per_page', 15);
            $transactions = $user->transactions()
                ->latest()
                ->paginate($perPage);

            return response()->json([
                'status' => 'success',
                'message' => 'Settings updated successfully',
                'user' => $user,
                'transactions' => $transactions,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Settings update failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function aiAgentSettings(Request $request)
  {
      $user = $request->user();

     
      $user->aiSetting()->updateOrCreate(
          ['user_id' => $user->id],
          $request->only([
              'enabled', 'auto_reply', 'personality', 'response_tone',
              'max_response_time', 'fallback_to_human', 'language',
              'knowledge_base_enabled', 'greeting_message', 'offline_message'
          ])
      );

      return response()->json([
          'status' => 'success',
          'settings' => $user->aiSetting,
      ]);
  }

    public function userprofile(Request $request)
    {
        $user = $request->user();

        // Get pagination parameters from request (optional)
        $perPage = $request->input('per_page', 15);

        // Load relationships after user retrieval (excluding transactions)
        $user->load([
                'notifications' => function($query) {
                  $query->latest()->limit(5);
                },
                'wallet', 'onboarding',
                'widget.websiteContexts','devices','aiSetting','usersettings','subscription','featureUsages']);

        // Get paginated transactions separately
        $transactions = $user->transactions()
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'status' => 'success',
            'message' => 'profile successful',
            'user' => $user,
            'onboarding_completed' => $user->onboarding_completed,
            'transactions' => $transactions,
        ]);
    }

    public function updateWebsiteContext(Request $request)
    {
        $user = $request->user();
        $widget = $user->widget;

        if (!$widget) {
            return response()->json([
                'status' => 'error',
                'message' => 'No widget found for user',
            ], 404);
        }

        $validated = $request->validate([
            'website_url' => 'required|string|url', // REQUIRED to identify which context to update
            'about_content' => 'nullable|string',
            'products_services' => 'nullable|array',
            'faq_data' => 'nullable|array',
            'contact_info' => 'nullable|array',
            'pricing_info' => 'nullable|array',
            'meta_description' => 'nullable|string',
            'key_features' => 'nullable|array',
            'full_context' => 'nullable|string',
        ]);

        try {
            // Verify website_url belongs to this widget
            $widgetWebsites = is_array($widget->website) ? $widget->website : [];
            if (!in_array($validated['website_url'], $widgetWebsites)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Website URL not found in widget websites. Add it to your widget first.',
                ], 400);
            }

            // Update or create context for specific website
            $context = \App\Models\WidgetWebsiteContext::updateOrCreate(
                [
                    'widget_id' => $widget->id,
                    'website_url' => $validated['website_url']
                ],
                array_merge($validated, [
                    'is_active' => true,
                    'scrape_status' => 'success',
                    'last_scraped_at' => now(),
                ])
            );

            $widget->load('websiteContexts');

            return response()->json([
                'status' => 'success',
                'message' => 'Website context updated successfully',
                'context' => $context,
                'all_contexts' => $widget->websiteContexts,
            ]);
        } catch (\Exception $e) {
            Log::error('Website context update failed: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update website context',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
