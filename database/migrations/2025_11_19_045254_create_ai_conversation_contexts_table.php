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
        Schema::create('ai_conversation_contexts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->json('topics')->nullable();
            $table->string('primary_intent')->nullable();
            $table->string('sentiment')->default('neutral');
            $table->decimal('sentiment_score', 3, 2)->default(0.50);
            $table->integer('visitor_messages_count')->default(0);
            $table->integer('ai_responses_count')->default(0);
            $table->boolean('escalation_needed')->default(false);
            $table->string('escalation_reason')->nullable();
            $table->boolean('escalation_message_sent')->default(false);
            $table->timestamp('last_ai_response_at')->nullable();
            $table->timestamp('last_escalation_notification_at')->nullable();
            $table->text('context_summary')->nullable();
            $table->timestamps();

            $table->index('conversation_id');
            $table->index('escalation_needed');
            $table->index('sentiment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_conversation_contexts');
    }
};
