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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->enum('type', ['text', 'image', 'file', 'system', 'bot'])->default('text');
            $table->enum('sender_type', ['visitor', 'agent', 'system', 'bot'])->default('visitor');
            $table->foreignId('user_id')->nullable()->constrained('users'); // The agent who sent the message (if sender_type is agent)
            $table->text('content'); // Message content
            $table->string('file_url')->nullable(); // URL to file if message has attachment
            $table->string('file_name')->nullable(); // Original filename if message has attachment
            $table->string('file_type')->nullable(); // MIME type if message has attachment
            $table->integer('file_size')->nullable(); // File size in bytes
            $table->boolean('is_read')->default(false); // Whether the recipient has read this message
            $table->timestamp('read_at')->nullable(); // When the message was read
            $table->boolean('is_delivered')->default(false); // Whether the message was delivered to the recipient
            $table->timestamp('delivered_at')->nullable(); // When the message was delivered
            $table->boolean('is_error')->default(false); // Whether there was an error sending the message
            $table->string('error_message')->nullable(); // Error message if is_error is true
            $table->json('meta_data')->nullable(); // Additional data as JSON
            $table->timestamps();
            $table->softDeletes();

            // Indexes for faster queries
            $table->index('conversation_id');
            $table->index('sender_type');
            $table->index('user_id');
            $table->index('created_at');

            // Composite indexes for optimized queries
            // For marking messages as read
            $table->index(['conversation_id', 'sender_type', 'is_read'], 'idx_msg_conv_sender_read');
            // For getting last agent message
            $table->index(['conversation_id', 'sender_type', 'created_at'], 'idx_msg_conv_sender_created');
            // For ordered message retrieval
            $table->index(['conversation_id', 'created_at'], 'idx_msg_conv_created');
        });

        
        
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
