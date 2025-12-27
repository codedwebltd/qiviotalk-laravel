<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlobalSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        // System Settings
        'cron_job_enabled',

        // Cryptomus Payment Settings
        'cryptomus_merchant_id',
        'cryptomus_api_key',

        // Support Settings
        'support_email',
        'support_phone',

        // AI Configuration
        'ai_enabled',
        'groq_api_key',
        'groq_model',
        'groq_max_tokens',
        'groq_temperature',
        'ai_max_responses_per_conversation',
        'ai_agent_wait_minutes',

        // Mail Settings
        'mail_mailer',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',

        // Website Information
        'app_name',
        'app_url',
        'app_description',

        // Firebase Settings
        'firebase_api_key',
        'firebase_auth_domain',
        'firebase_project_id',
        'firebase_storage_bucket',
        'firebase_messaging_sender_id',
        'firebase_app_id',
        'firebase_measurement_id',
        'firebase_database_url',
        'firebase_credentials_path',

        // Backblaze B2 Storage
        'b2_key_id',
        'b2_application_key',
        'b2_bucket_name',
        'b2_bucket_id',
        'b2_api_url',
    ];

    protected $casts = [
        'cron_job_enabled' => 'boolean',
        'ai_enabled' => 'boolean',
        'mail_port' => 'integer',
        'groq_max_tokens' => 'integer',
        'groq_temperature' => 'decimal:2',
        'ai_max_responses_per_conversation' => 'integer',
        'ai_agent_wait_minutes' => 'integer',
    ];

    /**
     * Get the global settings instance (singleton pattern)
     */
    public static function get()
    {
        return self::firstOrCreate([]);
    }
}
