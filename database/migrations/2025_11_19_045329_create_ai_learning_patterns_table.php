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
        Schema::create('ai_learning_patterns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->nullable()->constrained('conversations')->onDelete('set null');
            $table->string('pattern_type');
            $table->text('visitor_message_pattern');
            $table->text('successful_response');
            $table->string('intent')->nullable();
            $table->integer('success_count')->default(1);
            $table->decimal('confidence_score', 5, 2)->default(50.00);
            $table->integer('avg_rating')->nullable();
            $table->json('context_tags')->nullable();
            $table->timestamps();

            $table->index('pattern_type');
            $table->index('confidence_score');
            $table->index('intent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_learning_patterns');
    }
};
