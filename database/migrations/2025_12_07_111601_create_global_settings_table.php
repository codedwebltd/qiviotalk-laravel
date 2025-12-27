<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('global_settings', function (Blueprint $table) {
            $table->id();

            // System Settings
            $table->boolean('cron_job_enabled')->default(false);

            // Cryptomus Payment Settings
            $table->string('cryptomus_merchant_id')->nullable();
            $table->string('cryptomus_api_key')->nullable();

            // Support Settings
            $table->string('support_email')->nullable();
            $table->string('support_phone')->nullable();

            // AI Configuration
            $table->boolean('ai_enabled')->default(true);
            $table->string('groq_api_key')->nullable();
            $table->string('groq_model')->default('llama-3.1-8b-instant');
            $table->integer('groq_max_tokens')->default(500);
            $table->decimal('groq_temperature', 3, 2)->default(0.70);
            $table->integer('ai_max_responses_per_conversation')->default(6);
            $table->integer('ai_agent_wait_minutes')->default(30);

            // Mail Settings
            $table->string('mail_mailer')->default('smtp');
            $table->string('mail_host')->nullable();
            $table->integer('mail_port')->default(587);
            $table->string('mail_username')->nullable();
            $table->string('mail_password')->nullable();
            $table->string('mail_encryption')->default('tls');
            $table->string('mail_from_address')->nullable();
            $table->string('mail_from_name')->nullable();

            // Website Information
            $table->string('app_name')->nullable();
            $table->string('app_url')->nullable();
            $table->text('app_description')->nullable();

            // Firebase Settings
            $table->string('firebase_api_key')->nullable();
            $table->string('firebase_auth_domain')->nullable();
            $table->string('firebase_project_id')->nullable();
            $table->string('firebase_storage_bucket')->nullable();
            $table->string('firebase_messaging_sender_id')->nullable();
            $table->string('firebase_app_id')->nullable();
            $table->string('firebase_measurement_id')->nullable();
            $table->string('firebase_database_url')->nullable();
            $table->string('firebase_credentials_path')->nullable();

            // Backblaze B2 Storage Settings
            $table->string('b2_key_id')->nullable();
            $table->string('b2_application_key')->nullable();
            $table->string('b2_bucket_name')->nullable();
            $table->string('b2_bucket_id')->nullable();
            $table->string('b2_api_url')->default('https://api.backblazeb2.com');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('global_settings');
    }
};
