<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Widget;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class UpdateWidgetScriptsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'widgets:update-scripts {widget_key?} {--obfuscate : Obfuscate the widget JavaScript}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate widget JavaScript files. Use --obfuscate flag to obfuscate the code. Optionally specify widget_key to regenerate a single widget.';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $widgetKey = $this->argument('widget_key');

        // If widget_key is provided, regenerate only that widget
        if ($widgetKey) {
            $widget = Widget::where('widget_key', $widgetKey)->first();

            if (!$widget) {
                $this->error("Widget with key '{$widgetKey}' not found.");
                return 1;
            }

            try {
                $this->info("Regenerating widget: {$widgetKey}");
                $obfuscate = $this->option('obfuscate');
                $this->generateWidgetScript($widget, $obfuscate);
                $this->info("✅ Widget regenerated successfully" . ($obfuscate ? ' (obfuscated)' : ''));
                Log::info('Widget regenerated', ['widget_key' => $widgetKey, 'obfuscated' => $obfuscate]);
                return 0;
            } catch (\Exception $e) {
                $this->error("Failed to regenerate widget: {$e->getMessage()}");
                Log::error('Widget regeneration failed', [
                    'widget_key' => $widgetKey,
                    'error' => $e->getMessage()
                ]);
                return 1;
            }
        }

        // Otherwise, regenerate all widgets
        $widgets = Widget::all();

        if ($widgets->isEmpty()) {
            $this->info('No widgets found to update.');
            return 0;
        }

        $obfuscate = $this->option('obfuscate');

        $this->info("Found {$widgets->count()} widgets.");
        if ($obfuscate) {
            $this->info("🔒 Obfuscation enabled");
        }

        if (!$this->confirm('Do you want to continue with the update?', true)) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $bar = $this->output->createProgressBar($widgets->count());
        $bar->start();

        $success = 0;
        $failed = 0;

        foreach ($widgets as $widget) {
            try {
                $this->generateWidgetScript($widget, $obfuscate);
                $success++;
                Log::info('Widget generated', ['widget_id' => $widget->id, 'obfuscated' => $obfuscate]);
            } catch (\Exception $e) {
                $failed++;
                $this->error("\nFailed for widget {$widget->id}: {$e->getMessage()}");
                Log::error('Widget generation failed', [
                    'widget_id' => $widget->id,
                    'error' => $e->getMessage()
                ]);
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info("✅ Generated: {$success} successful, {$failed} failed");

        if (!$obfuscate) {
            $this->newLine();
            $this->comment('💡 Tip: Use --obfuscate flag to obfuscate widget code');
        }

        return 0;
    }

    /**
     * Generate widget script with optional obfuscation
     */
    protected function generateWidgetScript(Widget $widget, bool $obfuscate = false)
    {
        $scriptTemplate = $this->getWidgetTemplate($widget);
        $path = public_path('widgets');

        if (!File::exists($path)) {
            File::makeDirectory($path, 0755, true);
        }

        $filename = 'widget-' . $widget->widget_key . '.js';

        // Apply obfuscation if requested
        if ($obfuscate) {
            try {
                $scriptTemplate = $this->obfuscateJs($scriptTemplate);
            } catch (\Exception $e) {
                Log::warning('Obfuscation failed in artisan command, saving without obfuscation', [
                    'widget_id' => $widget->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Save script
        File::put($path . '/' . $filename, $scriptTemplate);

        // Update embed code
        $scriptUrl = secure_url("/widgets/{$filename}");
        $widget->embed_code = "<script src=\"{$scriptUrl}\" async defer></script>";
        $widget->save();
    }

    /**
     * Get widget template with replacements
     */
    protected function getWidgetTemplate(Widget $widget): string
    {
        $templatePath = resource_path('js/widget-template.js');

        if (!File::exists($templatePath)) {
            throw new \Exception('Widget template file not found at: ' . $templatePath);
        }

        $template = File::get($templatePath);
        $user = $widget->user;
        $companyName = $widget->name;

        if ($user && $user->onboarding && !empty($user->onboarding->company_name)) {
            $companyName = $user->onboarding->company_name;
        }

        $replacements = [
            '[WIDGET_KEY]' => addslashes($widget->widget_key),
            '[POSITION]' => addslashes($widget->position),
            '[COLOR]' => addslashes($widget->color),
            '[ICON]' => addslashes($widget->icon),
            '[BRAND_LOGO]' => addslashes($widget->brand_logo ?? ''),
            '[WELCOME_MESSAGE]' => addslashes($widget->welcome_message ?? 'Hi there! How can I help you today?'),
            '[API_URL]' => addslashes(config('app.url')),
            '[COMPANY_NAME]' => addslashes($companyName),
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
     * Obfuscate JavaScript code using Node.js javascript-obfuscator
     */
    protected function obfuscateJs(string $jsCode): string
    {
        $nodePath = '/home/palestine/.nvm/versions/node/v24.11.0/bin/node';
        $obfuscatorPath = '/home/palestine/.nvm/versions/node/v24.11.0/bin/javascript-obfuscator';

        $inputFile = storage_path('app/cmd_obf_input_' . uniqid() . '.js');
        $outputFile = storage_path('app/cmd_obf_output_' . uniqid() . '.js');

        try {
            file_put_contents($inputFile, $jsCode);

            $cmd = "$nodePath $obfuscatorPath $inputFile --output $outputFile --compact true --self-defending false 2>&1";

            $descriptors = [
                0 => ["pipe", "r"],
                1 => ["pipe", "w"],
                2 => ["pipe", "w"]
            ];

            $process = proc_open($cmd, $descriptors, $pipes);

            if (is_resource($process)) {
                fclose($pipes[0]);
                $cmdOutput = stream_get_contents($pipes[1]);
                $cmdError = stream_get_contents($pipes[2]);
                fclose($pipes[1]);
                fclose($pipes[2]);
                $returnCode = proc_close($process);

                if ($returnCode === 0 && file_exists($outputFile)) {
                    $obfuscatedCode = file_get_contents($outputFile);

                    Log::info('✅ Artisan command: JavaScript obfuscation successful', [
                        'original_size' => strlen($jsCode),
                        'obfuscated_size' => strlen($obfuscatedCode)
                    ]);

                    @unlink($inputFile);
                    @unlink($outputFile);

                    return $obfuscatedCode;
                } else {
                    Log::warning('⚠️ Artisan command: Obfuscation failed', [
                        'return_code' => $returnCode,
                        'output' => $cmdOutput,
                        'error' => $cmdError
                    ]);

                    @unlink($inputFile);
                    @unlink($outputFile);
                    return $jsCode;
                }
            } else {
                Log::error('❌ Artisan command: Failed to open proc_open');
                @unlink($inputFile);
                return $jsCode;
            }

        } catch (\Exception $e) {
            Log::error('❌ Artisan command: Exception during obfuscation', [
                'error' => $e->getMessage()
            ]);

            @unlink($inputFile);
            @unlink($outputFile);
            return $jsCode;
        }
    }
}