<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add unique constraint to support multiple websites per widget
     */
    public function up(): void
    {
        Schema::table('widget_website_contexts', function (Blueprint $table) {
            // Add unique constraint on widget_id + website_url combination
            // This allows one widget to have multiple website contexts (one per URL)
            $table->unique(['widget_id', 'website_url'], 'widget_website_url_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('widget_website_contexts', function (Blueprint $table) {
            $table->dropUnique('widget_website_url_unique');
        });
    }
};
