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
        Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->uuid('uuid')->unique();
        $table->string('name');
        $table->string('fcm_token')->nullable();
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->string('password_confirm')->nullable();
        $table->string('referral_code')->unique()->nullable();
        $table->foreignId('referral_id')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
        $table->foreignId('affiliate_id')->nullable()->constrained('users')->onUpdate('cascade')->onDelete('set null');
        $table->boolean('onboarding_completed')->default(false);
        $table->smallInteger('onboarding_step')->default(1);
        $table->string('status')->default('active');
        $table->integer('role')->default(0);
        $table->timestamp('last_login_at')->nullable();
        $table->unsignedBigInteger('subscription_id')->nullable();
        $table->string('membership_type', 50)->default('free');
        $table->timestamp('membership_expires_at')->nullable();
        $table->integer('reset_code')->nullable();
        $table->timestamp('reset_code_expires_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
        $table->softDeletes();
        
        // Indices for performance
        $table->index('email');
        $table->index('referral_code');
        $table->index(['referral_id', 'affiliate_id']);
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
