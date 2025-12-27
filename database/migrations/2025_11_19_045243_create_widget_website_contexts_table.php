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
        Schema::create('widget_website_contexts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('widget_id')->constrained('widgets')->onDelete('cascade');
            $table->string('website_url');
            $table->string('company_name')->nullable(); // Auto-extracted from domain or manually set
            $table->text('about_content')->nullable();
            $table->json('products_services')->nullable();
            $table->json('faq_data')->nullable();
            $table->json('contact_info')->nullable();
            $table->json('pricing_info')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('key_features')->nullable();
            $table->longText('full_context')->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('scrape_status', ['pending', 'success', 'failed'])->default('pending');
            $table->text('scrape_error')->nullable();
            $table->timestamp('last_scraped_at')->nullable();
            $table->timestamp('next_scrape_at')->nullable();
            $table->timestamps();

            $table->index('widget_id');
            $table->index('is_active');
            $table->index('next_scrape_at');

            // Unique constraint: one context per widget per website URL
            $table->unique(['widget_id', 'website_url'], 'widget_website_url_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('widget_website_contexts');
    }
};
