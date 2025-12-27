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
        Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->uuid('uuid')->unique();
        $table->foreignId('wallet_id')->nullable()->constrained('wallets')->onUpdate('cascade')->onDelete('restrict');
        $table->foreignId('user_id')->constrained('users')->onUpdate('cascade')->onDelete('restrict');
        $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->onUpdate('cascade')->onDelete('set null');
        $table->string('type'); // deposit, withdrawal, transfer, referral_bonus, subscription
        $table->decimal('amount', 20, 2);
        $table->string('currency', 3)->default('USD');
        $table->string('status')->default('pending'); // pending, completed, failed, rejected, cancelled, expired
        $table->string('reference')->nullable();
        $table->text('description')->nullable();
        $table->jsonb('metadata')->nullable();
        $table->timestamps();
        
        // Indices
        $table->index('uuid');
        $table->index(['wallet_id', 'type']);
        $table->index(['user_id', 'type', 'status']);
        $table->index('created_at');
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
