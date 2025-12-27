<?php

use Pusher\Pusher;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\WidgetController;
use App\Http\Controllers\FirebaseProxyController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', [App\Http\Controllers\WelcomeController::class, 'index'])->name('welcome');
Route::get('/download', [App\Http\Controllers\WelcomeController::class, 'download'])->name('download');

Route::get('/landing', function () {
    return view('landing');
})->name('landing');

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Template management routes
    Route::get('/template', [App\Http\Controllers\TemplateController::class, 'edit'])->name('template.edit');
    Route::post('/template/update', [App\Http\Controllers\TemplateController::class, 'update'])->name('template.update');
    Route::post('/template/restore', [App\Http\Controllers\TemplateController::class, 'restore'])->name('template.restore');
    Route::post('/template/restore-original', [App\Http\Controllers\TemplateController::class, 'restoreOriginal'])->name('template.restore-original');

    // User detail page route
    Route::get('/user/{id}', [App\Http\Controllers\Admin\UserController::class, 'show'])->name('user.show');
});

Route::get('/test-pusher/{channel}/{event}', function ($channel, $event) {
    // Get message content from query parameters or use default
    $message = request('message', 'Test message from server');
    $senderId = request('sender_id', 'agent-123');
    
    // Create a test message payload
    $messageData = [
        'id' => rand(1000, 9999),
        'conversation_id' => $channel,
        'content' => $message,
        'sender_type' => 'agent',
        'sender_id' => $senderId,
        'created_at' => now()->toDateTimeString(),
        'updated_at' => now()->toDateTimeString(),
        'type' => 'text'
    ];
    
    // Create Pusher instance
    $pusher = new Pusher(
        env('PUSHER_APP_KEY'),
        env('PUSHER_APP_SECRET'),
        env('PUSHER_APP_ID'),
        [
            'cluster' => env('PUSHER_APP_CLUSTER'),
            'useTLS' => true
        ]
    );
    
    // For typing indicators
    if ($event == 'typing') {
        $data = [
            'conversation_id' => $channel,
            'is_typing' => request('is_typing', true),
            'visitor_id' => request('visitor_id', 'agent-123')
        ];
        
        // Trigger event on the channel
        $pusher->trigger("conversation.{$channel}", 'typing', $data);
        return response()->json([
            'status' => 'success',
            'message' => 'Typing indicator triggered',
            'data' => $data
        ]);
    }
    
    // For new message event
    if ($event == 'new-message') {
        // Trigger event on the channel
        $pusher->trigger("conversation.{$channel}", 'new-message', $messageData);
        return response()->json([
            'status' => 'success',
            'message' => 'Message event triggered',
            'data' => $messageData
        ]);
    }
    
    return response()->json([
        'status' => 'error',
        'message' => 'Unknown event type. Use "typing" or "new-message".'
    ], 400);
});


Route::get('/test-pusher', function(){
    return view('test-pusher');
});


// Simulate full widget obfuscation for widget ID 2
Route::get('/test-widget-obfuscate/{widgetId}', function($widgetId) {
    $logFile = base_path('widget-obfuscate-test.log');
    $log = "=== Widget Obfuscation Test at " . date('Y-m-d H:i:s') . " ===\n";
    $log .= "Widget ID: $widgetId\n\n";

    try {
        // Load the widget
        $widget = \App\Models\Widget::find($widgetId);

        if (!$widget) {
            $log .= "❌ Widget not found!\n";
            file_put_contents($logFile, $log);
            return response()->json(['error' => 'Widget not found'], 404);
        }

        $log .= "Widget Key: {$widget->widget_key}\n";
        $log .= "Widget Name: {$widget->name}\n\n";

        // Get widget template (simulate what WidgetController does)
        $templatePath = resource_path('js/widget-template.js');

        if (!file_exists($templatePath)) {
            $log .= "❌ Template file not found at: $templatePath\n";
            file_put_contents($logFile, $log);
            return response()->json(['error' => 'Template not found'], 500);
        }

        $template = file_get_contents($templatePath);

        // Get user's company name from onboarding if available
        $user = $widget->user;
        $companyName = $widget->name;

        if ($user && $user->onboarding) {
            if (!empty($user->onboarding->company_name)) {
                $companyName = $user->onboarding->company_name;
            }
        }

        // Apply replacements
        $replacements = [
            '[WIDGET_KEY]' => addslashes($widget->widget_key),
            '[POSITION]' => addslashes($widget->position),
            '[COLOR]' => addslashes($widget->color),
            '[ICON]' => addslashes($widget->icon),
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

        $scriptTemplate = str_replace(array_keys($replacements), array_values($replacements), $template);

        $originalSize = strlen($scriptTemplate);
        $log .= "Original widget script size: $originalSize bytes\n\n";

        // Now obfuscate it
        $nodePath = '/home/qiviotalk/.nvm/versions/node/v24.11.0/bin/node';
        $obfuscatorPath = '/home/qiviotalk/.nvm/versions/node/v24.11.0/bin/javascript-obfuscator';

        $inputFile = storage_path('app/test_widget_input_' . time() . '.js');
        $outputFile = storage_path('app/test_widget_output_' . time() . '.js');

        file_put_contents($inputFile, $scriptTemplate);

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

            $log .= "Obfuscation command executed\n";
            $log .= "Return code: $returnCode\n";
            $log .= "Command output: $cmdOutput\n";

            if ($cmdError) {
                $log .= "Error output: $cmdError\n";
            }

            if ($returnCode === 0 && file_exists($outputFile)) {
                $obfuscatedCode = file_get_contents($outputFile);
                $obfuscatedSize = strlen($obfuscatedCode);

                $log .= "\n✅ Obfuscation successful!\n";
                $log .= "Obfuscated size: $obfuscatedSize bytes\n";
                $log .= "Size increase: " . ($obfuscatedSize - $originalSize) . " bytes (" .
                        round(($obfuscatedSize / $originalSize) * 100, 2) . "%)\n\n";

                // Save test widget file
                $testWidgetFile = public_path('widgets/TEST-widget-' . $widget->widget_key . '.js');
                file_put_contents($testWidgetFile, $obfuscatedCode);
                $log .= "Test widget saved to: $testWidgetFile\n";

                // Cleanup
                unlink($inputFile);
                unlink($outputFile);
            } else {
                $log .= "\n❌ Obfuscation failed!\n";
                unlink($inputFile);
                if (file_exists($outputFile)) unlink($outputFile);
            }
        } else {
            $log .= "❌ Failed to open process\n";
            unlink($inputFile);
        }

    } catch (\Exception $e) {
        $log .= "\n❌ Exception: " . $e->getMessage() . "\n";
        $log .= "Trace: " . $e->getTraceAsString() . "\n";
    }

    // Write to log file
    file_put_contents($logFile, $log);

    return response("<h2>Widget Obfuscation Test Completed!</h2>
        <p>Widget ID: $widgetId</p>
        <p>Check <code>widget-obfuscate-test.log</code> in the root directory for detailed results.</p>
        <pre>" . htmlspecialchars($log) . "</pre>");
});

// Test obfuscation - simpler version that writes to log
Route::get('/test-obfuscator', function() {
    $logFile = base_path('obfuscate.log');
    $log = '';

    // Test JavaScript code
    $testJs = "function hello() { console.log('Hello World'); alert('Test'); }";

    // Node and obfuscator paths
    $nodePath = '/home/qiviotalk/.nvm/versions/node/v24.11.0/bin/node';
    $obfuscatorPath = '/home/qiviotalk/.nvm/versions/node/v24.11.0/bin/javascript-obfuscator';

    // Create temp files
    $inputFile = storage_path('app/temp_input_' . time() . '.js');
    $outputFile = storage_path('app/temp_output_' . time() . '.js');

    try {
        file_put_contents($inputFile, $testJs);

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

            $log .= "=== Obfuscation Test at " . date('Y-m-d H:i:s') . " ===\n";
            $log .= "Return code: $returnCode\n";
            $log .= "Command output: $cmdOutput\n";

            if ($cmdError) {
                $log .= "Error output: $cmdError\n";
            }

            if (file_exists($outputFile)) {
                $obfuscated = file_get_contents($outputFile);
                $log .= "\nOriginal code:\n$testJs\n";
                $log .= "\nObfuscated code:\n$obfuscated\n";
                $log .= "\n✅ Obfuscation successful!\n";

                // Cleanup
                unlink($outputFile);
            } else {
                $log .= "\n❌ Output file not created!\n";
            }

            unlink($inputFile);
        } else {
            $log .= "❌ Failed to open process\n";
        }

    } catch (\Exception $e) {
        $log .= "❌ Exception: " . $e->getMessage() . "\n";
    }

    // Write to log file
    file_put_contents($logFile, $log);

    return response("<h2>Obfuscation test completed!</h2><p>Check <code>obfuscate.log</code> in the root directory for results.</p><pre>" . htmlspecialchars($log) . "</pre>");
});



Route::get('/test/groq', function () {

    $apiKey = ""; // replace this

    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
        'Content-Type'  => 'application/json',
    ])->post('https://api.groq.com/openai/v1/chat/completions', [
        "model" => "llama-3.1-8b-instant",  // free fast model
        "messages" => [
            ["role" => "user", "content" => "Hello Groq!"],
        ],
    ]);

    return $response->json();
});

Route::get('/test-url-check', function() {
      $url = 'https://palestinesrelief.org';

      try {
          $ch = curl_init($url);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
          curl_setopt($ch, CURLOPT_TIMEOUT, 10);
          curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
          curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
          curl_setopt($ch, CURLOPT_HEADER, true);
          curl_setopt($ch, CURLOPT_NOBODY, false);

          $response = curl_exec($ch);
          $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
          $error = curl_error($ch);
          $info = curl_getinfo($ch);
          curl_close($ch);

          return response()->json([
              'url' => $url,
              'http_code' => $httpCode,
              'error' => $error ?: null,
              'curl_info' => $info,
              'response_preview' => substr($response, 0, 500)
          ]);

      } catch (\Exception $e) {
          return response()->json([
              'error' => $e->getMessage(),
              'trace' => $e->getTraceAsString()
          ], 500);
      }
  });


require __DIR__.'/auth.php';
