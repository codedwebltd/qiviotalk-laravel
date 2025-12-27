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
        Schema::create('app_versions', function (Blueprint $table) {
            $table->id();
            $table->integer('version_code')->comment('Integer version code (e.g., 1, 2, 3)');
            $table->string('version_name')->comment('Human-readable version (e.g., 1.0.0, 2.1.3)');
            $table->enum('platform', ['android', 'ios'])->default('android');
            $table->text('download_url')->comment('URL to download the app');
            $table->text('changelog')->nullable()->comment('What\'s new in this version');
            $table->boolean('is_mandatory')->default(false)->comment('Force users to update');
            $table->boolean('is_active')->default(true)->comment('Is this version active');
            $table->timestamp('release_date')->nullable();
            $table->timestamps();

            $table->index(['platform', 'is_active', 'version_code']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_versions');
    }
};
