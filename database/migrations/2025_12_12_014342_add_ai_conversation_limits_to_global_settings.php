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
        Schema::table('global_settings', function (Blueprint $table) {
            // AI conversation limits
            $table->integer('ai_max_responses_per_conversation')->default(6)->after('groq_temperature');
            $table->integer('ai_agent_wait_minutes')->default(30)->after('ai_max_responses_per_conversation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('global_settings', function (Blueprint $table) {
            $table->dropColumn(['ai_max_responses_per_conversation', 'ai_agent_wait_minutes']);
        });
    }
};
