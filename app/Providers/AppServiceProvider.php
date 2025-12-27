<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Config;
use App\Models\User;
use App\Models\GlobalSetting;
use App\Observers\UserObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::observe(UserObserver::class);

        // Load global settings and share with all views
        try {
            $globalSettings = GlobalSetting::get();

            // Share with all views
            View::share('globalSettings', $globalSettings);

            // Apply mail config from database (override .env)
            if ($globalSettings->mail_host) {
                Config::set('mail.mailers.smtp.host', $globalSettings->mail_host);
                Config::set('mail.mailers.smtp.port', $globalSettings->mail_port);
                Config::set('mail.mailers.smtp.username', $globalSettings->mail_username);
                Config::set('mail.mailers.smtp.password', $globalSettings->mail_password);
                Config::set('mail.mailers.smtp.encryption', $globalSettings->mail_encryption);
                Config::set('mail.from.address', $globalSettings->mail_from_address);
                Config::set('mail.from.name', $globalSettings->mail_from_name);
            }

            // Apply AI config from database (override .env)
            if ($globalSettings->groq_api_key) {
                Config::set('aiconfig.enabled', $globalSettings->ai_enabled);
                Config::set('aiconfig.groq.api_key', $globalSettings->groq_api_key);
                Config::set('aiconfig.groq.model', $globalSettings->groq_model);
                Config::set('aiconfig.groq.max_tokens', (int) $globalSettings->groq_max_tokens);
                Config::set('aiconfig.groq.temperature', (float) $globalSettings->groq_temperature);
            }

            // Apply app config from database (override .env)
            if ($globalSettings->app_name) {
                Config::set('app.name', $globalSettings->app_name);
            }
            if ($globalSettings->app_url) {
                Config::set('app.url', $globalSettings->app_url);
            }

            // Apply Firebase config from database (override .env)
            if ($globalSettings->firebase_api_key) {
                Config::set('services.firebase.api_key', $globalSettings->firebase_api_key);
                Config::set('services.firebase.auth_domain', $globalSettings->firebase_auth_domain);
                Config::set('services.firebase.project_id', $globalSettings->firebase_project_id);
                Config::set('services.firebase.storage_bucket', $globalSettings->firebase_storage_bucket);
                Config::set('services.firebase.messaging_sender_id', $globalSettings->firebase_messaging_sender_id);
                Config::set('services.firebase.app_id', $globalSettings->firebase_app_id);
                Config::set('services.firebase.measurement_id', $globalSettings->firebase_measurement_id);
                Config::set('services.firebase.database_url', $globalSettings->firebase_database_url);
            }

            // Apply Firebase credentials path
            if ($globalSettings->firebase_credentials_path) {
                putenv('FIREBASE_CREDENTIALS=' . $globalSettings->firebase_credentials_path);
            }

            // Apply B2 config from database (override .env)
            if ($globalSettings->b2_key_id) {
                Config::set('filesystems.disks.b2.key_id', $globalSettings->b2_key_id);
                Config::set('filesystems.disks.b2.application_key', $globalSettings->b2_application_key);
                Config::set('filesystems.disks.b2.bucket_name', $globalSettings->b2_bucket_name);
                Config::set('filesystems.disks.b2.bucket_id', $globalSettings->b2_bucket_id);
            }
        } catch (\Exception $e) {
            // Fail silently if table doesn't exist yet (during migration)
        }
    }
}
