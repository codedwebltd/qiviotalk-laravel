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
        Schema::table('widget_website_contexts', function (Blueprint $table) {
            // Add company_name column after website_url (nullable for backwards compatibility)
            $table->string('company_name')->nullable()->after('website_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('widget_website_contexts', function (Blueprint $table) {
            $table->dropColumn('company_name');
        });
    }
};
