<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use App\Models\Onboarding;
use App\Traits\LocationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use MatthiasMullie\Minify\JS;
use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;

class WidgetController extends Controller
{
    use LocationTrait;
    /**
     * Get the authenticated user's widget
     */
    public function getWidget()
    {
        $user = auth()->user();
        $widget = $user->widget;

        if (!$widget) {
            return response()->json([
                'status' => 'error',
                'message' => 'Widget not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'widget' => $widget,
            'embed_code' => $widget->embed_code
        ]);
    }

    /**
     * Update the authenticated user's widget
     */
    public function updateWidget(Request $request)
    {
        $user = auth()->user();
        $widget = $user->widget;

        if (!$widget) {
            return response()->json([
                'status' => 'error',
                'message' => 'Widget not found'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'website' => 'sometimes|nullable|url|max:255',
            'position' => 'sometimes|in:left,right',
            'color' => 'sometimes|string|max:20',
            'icon' => 'sometimes|string|max:50',
            'welcome_message' => 'sometimes|nullable|string',
            'no_obfuscate' => 'sometimes|boolean', // New param to skip obfuscation
        ]);

        // Extract no_obfuscate param and remove it from validated data
        $noObfuscate = isset($validated['no_obfuscate']) ? $validated['no_obfuscate'] : false;
        unset($validated['no_obfuscate']);

        $widget->update($validated);
        $this->generateWidgetScript($widget, $noObfuscate);

        return response()->json([
            'status' => 'success',
            'message' => 'Widget updated successfully',
            'widget' => $widget,
            'embed_code' => $widget->embed_code
        ]);
    }

    /**
     * Verify widget installation
     */
    public function verifyInstallation(Request $request)
    {
        Log::info('Domain verification - Raw payload received', $request->all());
        $validated = $request->validate([
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'domain' => 'required|string|max:255',
            'page_url' => 'sometimes|string|max:500',
        ]);

        Log::info('Received widget installation verification request', [
            'widget_key' => $validated['widget_key'],
            'domain' => $validated['domain']
        ]);
        $widget = Widget::where('widget_key', $validated['widget_key'])->first();

        if (!$widget) {
            Log::info('Widget not found during verification', ['widget_key' => $validated['widget_key']]);
            return response()->json([
                'status' => 'error',
                'message' => 'Widget not found'
            ], 404);
        }

        // Check if widget status is active
        if ($widget->widget_status !== 'active') {
            Log::info('Widget verification blocked - status not active', [
                'widget_key' => $validated['widget_key'],
                'status' => $widget->widget_status
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Widget is not active',
                'verified' => false
            ], 403);
        }

        // Check if widget is expired
        if ($widget->widget_expiry_date && $widget->widget_expiry_date->isPast()) {
            Log::info('Widget verification blocked - expired', [
                'widget_key' => $validated['widget_key'],
                'expiry_date' => $widget->widget_expiry_date
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Widget has expired',
                'verified' => false
            ], 403);
        }

        Log::info('Verifying widget installation', [
            'widget_key' => $validated['widget_key'],
            'domain' => $validated['domain']
        ]);

        // Check if the widget has a website set
        if (empty($widget->website)) {
            // Try to get website from user's onboarding data
            $user = $widget->user;
            $onboarding = $user ? $user->onboarding : null;

            if ($onboarding && !empty($onboarding->website)) {
                // Use the website from onboarding
                $widget->website = $onboarding->website;
                $widget->save();

                Log::info('Updated widget website from onboarding', ['website' => $onboarding->website]);
            } else {
                Log::info('No website found in widget or onboarding, verification failed');
                return response()->json([
                    'status' => 'error',
                    'message' => 'Domain verification failed',
                    'verified' => false
                ], 403);
            }
        }

        // Remove www. prefix from request domain for comparison
        $requestDomain = preg_replace('/^www\./i', '', $validated['domain']);

        // Check if request domain matches any of the widget's registered domains
        $domainMatches = false;
        $websites = is_array($widget->website) ? $widget->website : [$widget->website];

        foreach ($websites as $websiteUrl) {
            if (empty($websiteUrl)) continue;

            // Extract domain from widget website
            $parsedWebsite = parse_url($websiteUrl, PHP_URL_HOST);
            if (!$parsedWebsite) {
                $parsedWebsite = $websiteUrl; // In case it's just a domain without protocol
            }

            // Remove www. prefix if present for comparison
            $parsedWebsite = preg_replace('/^www\./i', '', $parsedWebsite);

            // Check if domains match
            if (($requestDomain === $parsedWebsite) ||
                preg_match('/\.' . preg_quote($parsedWebsite, '/') . '$/', $requestDomain) ||
                preg_match('/^' . preg_quote($requestDomain, '/') . '$/', $parsedWebsite)) {
                $domainMatches = true;
                break;
            }
        }

        if (!$domainMatches) {
            Log::info('Domain mismatch - not in authorized list', [
                'authorized_websites' => $widget->website,
                'request_domain' => $requestDomain
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Domain verification failed',
                'verified' => false
            ], 403);
        }

        // Check if we should do active verification
        if (!$widget->is_installed) {
            // Try to actively verify the installation by checking the website
            $isActuallyInstalled = $this->activeVerification($widget);

            if ($isActuallyInstalled) {
                $widget->update([
                    'is_installed' => true,
                    'last_verified_at' => now(),
                ]);

                Log::info('Widget actively verified and marked as installed');
            } else {
                Log::info('Active verification failed');

                return response()->json([
                    'status' => 'error',
                    'message' => 'Could not verify widget code on website',
                    'verified' => false
                ], 403);
            }
        } else {
            // Widget is already marked as installed, update verification time
            $widget->update([
                'last_verified_at' => now(),
            ]);

            Log::info('Widget already verified, updated timestamp');
        }

        // Send notification to widget owner about new visitor
        $this->notifyWidgetOwner($widget, [
            'domain' => $validated['domain'],
            'page_url' => $validated['page_url'] ?? null,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Widget installation verified',
            'verified' => true
        ]);
    }

    /**
     * Check widget verification status
     */
    public function checkVerification($widgetKey)
    {
        $widget = Widget::where('widget_key', $widgetKey)->first();

        if (!$widget) {
            return response()->json([
                'status' => 'error',
                'message' => 'Widget not found'
            ], 404);
        }

        // If not installed, try active verification
        if (!$widget->is_installed) {
            // If widget doesn't have website, check onboarding
            if (empty($widget->website)) {
                $user = $widget->user;
                $onboarding = $user ? $user->onboarding : null;

                if ($onboarding && !empty($onboarding->website)) {
                    $widget->website = $onboarding->website;
                    $widget->save();
                }
            }

            if (!empty($widget->website)) {
                $isActuallyInstalled = $this->activeVerification($widget);

                if ($isActuallyInstalled) {
                    $widget->update([
                        'is_installed' => true,
                        'last_verified_at' => now(),
                    ]);

                    Log::info('Widget actively verified during status check');
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'verified' => (bool) $widget->is_installed,
            'last_verified_at' => $widget->last_verified_at
        ]);
    }

    /**
     * Actively verify widget installation by checking the website
     * 
     * @param Widget $widget
     * @return bool
     */
    protected function activeVerification(Widget $widget)
    {
        if (empty($widget->website)) {
            return false;
        }

        $website = $widget->website;

        // Handle if website is array (json column)
        if (is_array($website)) {
            $website = $website[0] ?? '';
        }

        try {
            Log::info('Attempting active verification', ['website' => $website]);

            // Make sure the URL has a protocol
            if (!preg_match('~^(?:f|ht)tps?://~i', $website)) {
                $website = 'https://' . $website;
            }

            // Fetch the website content
            $response = Http::timeout(30)->get($website);

            if (!$response->successful()) {
                // Try with http:// if https:// fails
                if (strpos($website, 'https://') === 0) {
                    $httpWebsite = str_replace('https://', 'http://', $website);
                    $response = Http::timeout(30)->get($httpWebsite);

                    if (!$response->successful()) {
                        Log::info('Failed to fetch website with both https and http', [
                            'status' => $response->status(),
                            'website' => $website
                        ]);
                        return false;
                    }
                } else {
                    Log::info('Failed to fetch website', [
                        'status' => $response->status(),
                        'website' => $website
                    ]);
                    return false;
                }
            }

            $content = $response->body();

            // Look for the widget script tag
            $scriptPattern = '/widget-' . preg_quote($widget->widget_key, '/') . '\.js/i';
            if (preg_match($scriptPattern, $content)) {
                Log::info('Widget script found on website', ['widget_key' => $widget->widget_key]);
                return true;
            }

            Log::info('Widget script not found on website');
            return false;
        } catch (\Exception $e) {
            Log::error('Error during active verification', [
                'error' => $e->getMessage(),
                'website' => $website
            ]);
            return false;
        }
    }

   /**
     * Generate widget JavaScript file
     * 
     * @param Widget $widget
     * @param bool $noObfuscate Skip obfuscation if true
     * @return bool
     */
    public function generateWidgetScript(Widget $widget, bool $noObfuscate = false)
    {
        // DIAGNOSTIC LOG 1: Entry point
        Log::info('🔍 generateWidgetScript called', [
            'widget_id' => $widget->id,
            'widget_key' => $widget->widget_key,
            'noObfuscate' => $noObfuscate,
            'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3)
        ]);

        $scriptTemplate = $this->getWidgetTemplate($widget);
        $path = public_path('widgets');

        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        $filename = 'widget-' . $widget->widget_key . '.js';

            Log::info('✅ Entering obfuscation block', ['widget_id' => $widget->id]);
            
            try {
                // Log original file size
                $originalSize = strlen($scriptTemplate);

                // DIAGNOSTIC LOG 3: Before calling obfuscateJs
                Log::info('🔍 About to call obfuscateJs', [
                    'widget_id' => $widget->id,
                    'original_size' => $originalSize
                ]);

                // Apply obfuscation
                $scriptTemplate = $this->obfuscateJs($scriptTemplate);

                // DIAGNOSTIC LOG 4: After calling obfuscateJs
                $obfuscatedSize = strlen($scriptTemplate);
                Log::info('🔍 After obfuscateJs returned', [
                    'widget_id' => $widget->id,
                    'original_size' => $originalSize,
                    'obfuscated_size' => $obfuscatedSize,
                    'size_changed' => $originalSize !== $obfuscatedSize,
                    'ratio' => $obfuscatedSize / $originalSize
                ]);

            } catch (\Exception $e) {
                Log::error('❌ Error obfuscating widget script', [
                    'widget_id' => $widget->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Continue with original script if obfuscation fails
            }
      

        File::put($path . '/' . $filename, $scriptTemplate);

        // Generate embed code for widget
        $scriptUrl = secure_url("/widgets/{$filename}");
        $widget->embed_code = "<script src=\"{$scriptUrl}\" async defer></script>";
        $widget->save();

        // DIAGNOSTIC LOG 5: Final result
        Log::info('✅ Widget script generation complete', [
            'widget_id' => $widget->id,
            'filename' => $filename,
            'final_size' => strlen($scriptTemplate)
        ]);

        return true;
    }

    /**
     * Get widget template with replacements
     * 
     * @param Widget $widget
     * @return string
     */
    public function getWidgetTemplate(Widget $widget)
    {
        $templatePath = resource_path('js/widget-template.js');

        if (!File::exists($templatePath)) {
            throw new \Exception('Widget template file not found at: ' . $templatePath);
        }

        $template = File::get($templatePath);

        // Get user's company name from onboarding if available
        $user = $widget->user;
        $companyName = $widget->name; // Default to widget name

        if ($user && $user->onboarding) {
            if (!empty($user->onboarding->company_name)) {
                $companyName = $user->onboarding->company_name;
            }
        }

        // Prepare replacement values (with escaping)
        $replacements = [
            '[WIDGET_KEY]' => addslashes($widget->widget_key),
            '[POSITION]' => addslashes($widget->position),
            '[COLOR]' => addslashes($widget->color),
            '[ICON]' => addslashes($widget->icon),
            '[BRAND_LOGO]' => addslashes($widget->brand_logo ?? ''),
            '[WELCOME_MESSAGE]' => addslashes($widget->welcome_message ?? 'Hi there! How can I help you today?'),
            '[API_URL]' => addslashes(config('app.url')),
            '[COMPANY_NAME]' => addslashes($companyName),

            // Add Firebase configuration values
            '[FIREBASE_API_KEY]' => addslashes(config('services.firebase.api_key', 'AIzaSyADZjk57dZ82lopzyCZf1pW0-a14BrIHOU')),
            '[FIREBASE_AUTH_DOMAIN]' => addslashes(config('services.firebase.auth_domain', 'livechat-tidu.firebaseapp.com')),
            '[FIREBASE_PROJECT_ID]' => addslashes(config('services.firebase.project_id', 'livechat-tidu')),
            '[FIREBASE_STORAGE_BUCKET]' => addslashes(config('services.firebase.storage_bucket', 'livechat-tidu.firebasestorage.app')),
            '[FIREBASE_MESSAGING_SENDER_ID]' => addslashes(config('services.firebase.messaging_sender_id', '414954993651')),
            '[FIREBASE_APP_ID]' => addslashes(config('services.firebase.app_id', '1:414954993651:web:182010935a2a9465944486')),
            '[FIREBASE_MEASUREMENT_ID]' => addslashes(config('services.firebase.measurement_id', 'G-JEP8GDWEGK')),
            '[FIREBASE_DATABASE_URL]' => addslashes(config('services.firebase.database_url', 'https://livechat-tidu.firebaseio.com')),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    /**
     * Bulk update widget scripts for all widgets
     */
    public function bulkUpdateWidgetScripts(Request $request)
    {
        // Validate request
        $validated = $request->validate([
            'no_obfuscate' => 'sometimes|boolean',
            'limit' => 'sometimes|integer|min:1',
        ]);

        // Extract options
        $noObfuscate = $validated['no_obfuscate'] ?? false;
        $limit = $validated['limit'] ?? null;

        // Start processing widgets
        $query = Widget::query();

        // Apply limit if specified
        if ($limit) {
            $query->limit($limit);
        }

        $totalCount = $query->count();
        $successCount = 0;
        $failCount = 0;

        // Process widgets
        foreach ($query->cursor() as $widget) {
            try {
                $this->generateWidgetScript($widget, $noObfuscate);
                $successCount++;
            } catch (\Exception $e) {
                $failCount++;
                Log::error('Failed to update widget script', [
                    'widget_id' => $widget->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Widget scripts updated',
            'total_widgets' => $totalCount,
            'success_count' => $successCount,
            'fail_count' => $failCount,
        ]);
    }

   /**
     * Obfuscate JavaScript code using Node.js javascript-obfuscator
     *
     * @param string $jsCode The JavaScript code to obfuscate
     * @return string The obfuscated code
     */
    public function obfuscateJs(string $jsCode): string
    {
        // Node and obfuscator paths
        $nodePath = '/home/qiviotalk/.nvm/versions/node/v24.11.0/bin/node';
        $obfuscatorPath = '/home/qiviotalk/.nvm/versions/node/v24.11.0/bin/javascript-obfuscator';

        // Create unique temp files
        $inputFile = storage_path('app/obf_input_' . uniqid() . '.js');
        $outputFile = storage_path('app/obf_output_' . uniqid() . '.js');

        try {
            // Write input code to temp file
            file_put_contents($inputFile, $jsCode);

            // Build obfuscation command with aggressive settings
            $cmd = "$nodePath $obfuscatorPath $inputFile --output $outputFile " .
                "--compact true " .
                "--control-flow-flattening true " .
                "--control-flow-flattening-threshold 1 " .
                "--dead-code-injection true " .
                "--dead-code-injection-threshold 0.4 " .
                "--debug-protection true " .
                "--debug-protection-interval 2000 " .
                "--disable-console-output true " .
                "--identifier-names-generator hexadecimal " .
                "--identifiers-prefix '' " .
                "--rename-globals true " .
                "--rename-properties false " .
                "--reserved-names [] " .
                "--rotate-string-array true " .
                "--self-defending true " .
                "--shuffle-string-array true " .
                "--split-strings true " .
                "--split-strings-chunk-length 5 " .
                "--string-array true " .
                "--string-array-calls-transform true " .
                "--string-array-encoding 'rc4' " .
                "--string-array-index-shift true " .
                "--string-array-rotate true " .
                "--string-array-shuffle true " .
                "--string-array-wrappers-count 2 " .
                "--string-array-wrappers-chained-calls true " .
                "--string-array-wrappers-parameters-max-count 4 " .
                "--string-array-wrappers-type 'function' " .
                "--string-array-threshold 1 " .
                "--transform-object-keys true " .
                "--unicode-escape-sequence true " .
                "2>&1";

            $descriptors = [
                0 => ["pipe", "r"],  // stdin
                1 => ["pipe", "w"],  // stdout
                2 => ["pipe", "w"]   // stderr
            ];

            $process = proc_open($cmd, $descriptors, $pipes);

            if (is_resource($process)) {
                fclose($pipes[0]);
                $cmdOutput = stream_get_contents($pipes[1]);
                $cmdError = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                $returnCode = proc_close($process);

                // Check if obfuscation succeeded
                if ($returnCode === 0 && file_exists($outputFile)) {
                    $obfuscatedCode = file_get_contents($outputFile);

                    // Log success
                    Log::info('✅ JavaScript obfuscation successful', [
                        'original_size' => strlen($jsCode),
                        'obfuscated_size' => strlen($obfuscatedCode)
                    ]);

                    // Cleanup temp files
                    @unlink($inputFile);
                    @unlink($outputFile);

                    return $obfuscatedCode;
                } else {
                    // Log failure and return original
                    Log::warning('⚠️ Obfuscation failed, returning original code', [
                        'return_code' => $returnCode,
                        'output' => $cmdOutput,
                        'error' => $cmdError
                    ]);

                    @unlink($inputFile);
                    @unlink($outputFile);
                    return $jsCode;
                }
            } else {
                Log::error('❌ Failed to open proc_open for obfuscation');
                @unlink($inputFile);
                return $jsCode;
            }

        } catch (\Exception $e) {
            Log::error('❌ Exception during obfuscation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Cleanup temp files
            @unlink($inputFile);
            @unlink($outputFile);

            // Return original code on error
            return $jsCode;
        }
    }

    /**
     * Send notification to widget owner about new visitor
     *
     * @param Widget $widget
     * @param array $visitorData
     * @return void
     */
    private function notifyWidgetOwner($widget, $visitorData)
    {
        try {
            $user = $widget->user;
            if (!$user) {
                return;
            }

            // Load user settings
            $user->load('usersettings');

            // Check if user has push notifications enabled
            if (!$user->usersettings || !$user->usersettings->push_enabled) {
                Log::info("User {$user->id} has push notifications disabled, skipping visitor notification");
                return;
            }

            // Get visitor location from IP using LocationTrait
            $locationData = $this->extractLocationData($visitorData['ip']);
            $country = $locationData['country']['name'] ?? 'Unknown';

            // Extract page path from URL
            $pagePath = '/';
            if (!empty($visitorData['page_url'])) {
                $parsed = parse_url($visitorData['page_url']);
                $pagePath = ($parsed['path'] ?? '/') . (!empty($parsed['query']) ? '?' . $parsed['query'] : '');
            }

            // Build notification message with detailed info
            $title = "New Visitor on Your Website";
            $timeFormatted = now()->format('g:i A'); // e.g., "3:45 PM"
            $fullUrl = $visitorData['domain'] . $pagePath; // e.g., "westernkits.com/path"
            $body = "Visitor from {$country} (IP: {$visitorData['ip']}) landed on {$fullUrl} at {$timeFormatted}";

            // Create database notification
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\WidgetVisitor',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $user->id,
                'data' => json_encode([
                    'title' => $title,
                    'body' => $body,
                    'widget_key' => $widget->widget_key,
                    'domain' => $visitorData['domain'],
                    'page_url' => $visitorData['page_url'] ?? null,
                    'country' => $country,
                    'ip' => $visitorData['ip'],
                    'user_agent' => $visitorData['user_agent'] ?? null,
                ]),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Database notification created for widget owner {$user->id}");

            // Send Firebase notification
            $devices = $user->devices()->whereNotNull('fcm_token')->get();

            if ($devices->isEmpty()) {
                Log::info("User {$user->id} has no devices with FCM tokens");
                return;
            }

            $messaging = Firebase::messaging();
            $notification = Notification::create($title, $body);

            $sentCount = 0;

            foreach ($devices as $device) {
                try {
                    $message = CloudMessage::withTarget('token', $device->fcm_token)
                        ->withNotification($notification)
                        ->withData([
                            'type' => 'widget_visitor',
                            'widget_key' => $widget->widget_key,
                            'domain' => $visitorData['domain'],
                            'page_url' => $visitorData['page_url'] ?? '',
                            'country' => $country,
                            'ip' => $visitorData['ip'],
                            'timestamp' => (string)now()->timestamp,
                            'time_formatted' => now()->format('Y-m-d g:i A'),
                            'sound_enabled' => (string)($user->usersettings->sound_enabled ?? true),
                        ]);

                    $messaging->send($message);
                    $sentCount++;
                    $device->update(['last_used_at' => now()]);

                } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                    Log::warning("Invalid FCM token for device {$device->id}, removing");
                    $device->delete();
                } catch (\Exception $e) {
                    Log::error("Failed to send to device {$device->id}: " . $e->getMessage());
                }
            }

            Log::info("Visitor notification sent to {$sentCount} devices for user {$user->id} - Country: {$country}, IP: {$visitorData['ip']}, URL: {$fullUrl}");

        } catch (\Exception $e) {
            Log::error('Failed to send widget visitor notification', [
                'widget_id' => $widget->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Get or create domain-specific context with auto-generated company name
     * NEW ENDPOINT - Non-breaking addition for dynamic company names
     */
    public function getDomainContext(Request $request, $widgetKey)
    {
        $validated = $request->validate([
            'domain' => 'required|string|max:255',
        ]);

        $domain = $validated['domain'];

        // Find widget by key
        $widget = Widget::where('widget_key', $widgetKey)->first();

        if (!$widget) {
            return response()->json([
                'status' => 'error',
                'message' => 'Widget not found'
            ], 404);
        }

        // Normalize domain (remove www, protocol, etc)
        $normalizedDomain = $this->normalizeDomain($domain);
        $websiteUrl = 'https://' . $normalizedDomain;

        // Check if context already exists for this domain
        $context = $widget->websiteContexts()
            ->where('website_url', $websiteUrl)
            ->first();

        // If context exists and has company_name, return it
        if ($context && !empty($context->company_name)) {
            return response()->json([
                'status' => 'success',
                'company_name' => $context->company_name,
                'website_url' => $context->website_url,
                'cached' => true
            ]);
        }

        // Auto-generate company name from domain
        $companyName = $this->extractCompanyName($normalizedDomain);

        // Create or update context
        if ($context) {
            // Update existing context with company_name
            $context->update(['company_name' => $companyName]);
        } else {
            // Create new context
            $context = $widget->websiteContexts()->create([
                'website_url' => $websiteUrl,
                'company_name' => $companyName,
                'is_active' => true,
                'scrape_status' => 'pending'
            ]);
        }

        Log::info('Domain context created/updated', [
            'widget_id' => $widget->id,
            'domain' => $normalizedDomain,
            'company_name' => $companyName
        ]);

        return response()->json([
            'status' => 'success',
            'company_name' => $companyName,
            'website_url' => $websiteUrl,
            'cached' => false
        ]);
    }

    /**
     * Normalize domain to consistent format
     */
    private function normalizeDomain($domain)
    {
        // Remove protocol
        $domain = preg_replace('#^https?://#', '', $domain);

        // Remove www
        $domain = preg_replace('#^www\.#', '', $domain);

        // Remove trailing slash and path
        $domain = explode('/', $domain)[0];

        // Convert to lowercase
        return strtolower($domain);
    }

    /**
     * Extract company name from domain
     * Examples: example.com -> Example, my-shop.com -> My Shop
     */
    private function extractCompanyName($domain)
    {
        // Remove TLD (.com, .org, etc)
        $parts = explode('.', $domain);
        $name = $parts[0];

        // Replace hyphens and underscores with spaces
        $name = str_replace(['-', '_'], ' ', $name);

        // Capitalize each word
        $name = ucwords($name);

        return $name;
    }

}
