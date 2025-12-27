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
        Schema::create('feature_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('feature_key'); // e.g., 'whatsapp_messages', 'conversations', 'ai_responses'
            $table->integer('usage_count')->default(0);
            $table->string('period'); // e.g., '2025-12' for monthly tracking
            $table->timestamps();

            // Ensure one record per user per feature per period
            $table->unique(['user_id', 'feature_key', 'period']);
            $table->index(['user_id', 'period']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_usages');
    }
};
