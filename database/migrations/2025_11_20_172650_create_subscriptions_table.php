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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->string('duration');
            $table->integer('duration_days')->nullable();
            $table->json('features'); // Mobile app descriptions (array of strings)
            $table->json('feature_limits')->nullable(); // Backend programmatic limits (structured JSON)
            $table->boolean('is_active')->default(true);
            $table->boolean('is_free_tier')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
