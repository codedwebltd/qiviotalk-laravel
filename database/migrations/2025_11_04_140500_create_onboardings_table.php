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
        Schema::create('onboarding', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onUpdate('cascade')->onDelete('cascade');
            $table->string('current_step')->nullable();
            $table->string('company_name')->nullable();
            $table->string('industry')->nullable();
            $table->string('team_size')->nullable();
            $table->string('website')->nullable();
            $table->string('primary_goal')->nullable();
            $table->string('widget_position')->default('right');
            $table->string('primary_color')->default('#3B82F6');
            $table->string('chat_icon')->default('comments');
            $table->string('brand_logo')->nullable();
            $table->string('welcome_message')->nullable();
            $table->boolean('completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            // Indices
            $table->unique('user_id');
            $table->index('completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('onboardings');
    }
};
