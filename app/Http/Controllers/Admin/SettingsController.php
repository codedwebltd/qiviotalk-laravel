<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GlobalSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = GlobalSetting::get();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            // System Settings
            'cron_job_enabled' => 'nullable|boolean',

            // Cryptomus Payment Settings
            'cryptomus_merchant_id' => 'nullable|string|max:255',
            'cryptomus_api_key' => 'nullable|string|max:255',

            // Support Settings
            'support_email' => 'nullable|email|max:255',
            'support_phone' => 'nullable|string|max:50',

            // AI Configuration
            'ai_enabled' => 'nullable|boolean',
            'groq_api_key' => 'nullable|string|max:255',
            'groq_model' => 'nullable|string|max:100',
            'groq_max_tokens' => 'nullable|integer|min:100|max:5000',
            'groq_temperature' => 'nullable|numeric|min:0|max:2',
            'ai_max_responses_per_conversation' => 'nullable|integer|min:1|max:50',
            'ai_agent_wait_minutes' => 'nullable|integer|min:1|max:1440',

            // Mail Settings
            'mail_mailer' => 'nullable|string|max:50',
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|max:10',
            'mail_from_address' => 'nullable|email|max:255',
            'mail_from_name' => 'nullable|string|max:255',

            // Website Information
            'app_name' => 'nullable|string|max:255',
            'app_url' => 'nullable|url|max:255',
            'app_description' => 'nullable|string|max:1000',

            // Firebase Settings
            'firebase_api_key' => 'nullable|string|max:255',
            'firebase_auth_domain' => 'nullable|string|max:255',
            'firebase_project_id' => 'nullable|string|max:255',
            'firebase_storage_bucket' => 'nullable|string|max:255',
            'firebase_messaging_sender_id' => 'nullable|string|max:255',
            'firebase_app_id' => 'nullable|string|max:255',
            'firebase_measurement_id' => 'nullable|string|max:255',
            'firebase_database_url' => 'nullable|url|max:255',
            'firebase_credentials_path' => 'nullable|string|max:500',

            // Backblaze B2 Storage Settings
            'b2_key_id' => 'nullable|string|max:255',
            'b2_application_key' => 'nullable|string|max:255',
            'b2_bucket_name' => 'nullable|string|max:255',
            'b2_bucket_id' => 'nullable|string|max:255',
            'b2_api_url' => 'nullable|url|max:255',
        ]);

        $settings = GlobalSetting::get();
        $settings->update($validated);

        return back()->with('success', 'Settings updated successfully');
    }
}
