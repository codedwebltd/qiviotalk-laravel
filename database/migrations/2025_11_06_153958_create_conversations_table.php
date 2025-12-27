<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained('widgets')->onDelete('cascade');
            $table->string('visitor_id')->nullable(); // Unique visitor identifier
            $table->string('visitor_email')->nullable(); // Visitor email if provided
            $table->string('visitor_name')->nullable(); // Visitor name if provided
            $table->string('visitor_ip')->nullable(); // Visitor IP address
            $table->string('visitor_location')->nullable(); // Visitor location based on IP
            $table->string('visitor_user_agent')->nullable(); // Browser/device info
            $table->string('visitor_referrer')->nullable(); // Referrer URL
            $table->string('visitor_language')->nullable(); // Detected language from first message (e.g., 'en', 'es', 'fr')
            $table->text('first_message')->nullable(); // First message content
            $table->enum('status', ['open', 'closed', 'archived'])->default('open');
            $table->boolean('is_read')->default(false); // Whether the agent has read this conversation
            $table->boolean('has_new_messages')->default(true); // Whether there are new messages
            $table->timestamp('last_message_at')->nullable(); // Timestamp of the last message
            $table->timestamp('closed_at')->nullable(); // When the conversation was closed
            $table->foreignId('closed_by')->nullable()->constrained('users'); // Who closed the conversation
            $table->string('close_reason')->nullable(); // Reason for closing
            $table->integer('rating')->nullable(); // Customer satisfaction rating
            $table->text('rating_comment')->nullable(); // Customer feedback
            $table->json('meta_data')->nullable(); // Additional data as JSON
            $table->timestamps();
            $table->softDeletes();

            // Indexes for faster queries
            $table->index('visitor_id');
            $table->index('visitor_email');
            $table->index('status');
            $table->index('created_at');
            $table->index('last_message_at');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
