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
        Schema::create('ai_response_caches', function (Blueprint $table) {
            $table->id();
            $table->string('message_fingerprint', 64)->unique();
            $table->text('normalized_message');
            $table->text('cached_response');
            $table->string('intent')->nullable();
            $table->integer('hit_count')->default(0);
            $table->integer('success_count')->default(0);
            $table->decimal('success_rate', 5, 2)->default(0.00);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('message_fingerprint');
            $table->index('intent');
            $table->index('expires_at');
            $table->index('success_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_response_caches');
    }
};
