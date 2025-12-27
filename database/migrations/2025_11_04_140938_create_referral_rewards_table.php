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
        Schema::create('referral_rewards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onUpdate('cascade')->onDelete('restrict');
            $table->foreignId('referred_id')->constrained('users')->onUpdate('cascade')->onDelete('restrict');
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onUpdate('cascade')->onDelete('set null');
            $table->string('status')->default('pending'); // pending, paid, cancelled
            $table->decimal('amount', 20, 2);
            $table->string('currency', 3)->default('USD');
            $table->timestamps();
            
            // Indices
            $table->unique(['referrer_id', 'referred_id']);
            $table->index(['referrer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referral_rewards');
    }
};
