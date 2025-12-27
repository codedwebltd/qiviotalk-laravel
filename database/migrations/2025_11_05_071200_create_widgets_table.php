<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('widgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('widget_key', 64)->unique();
            $table->longText('embed_code')->nullable();
            $table->string('name');
            $table->string('website')->nullable();
            $table->enum('position', ['left', 'right'])->default('right');
            $table->string('color', 20)->default('#3B82F6');
            $table->string('icon', 50)->default('comments');
            $table->string('brand_logo')->nullable();
            $table->text('welcome_message')->nullable();
            $table->boolean('is_installed')->default(false);
            $table->timestamp('last_verified_at')->nullable();
            $table->enum('widget_status', ['active', 'suspended', 'deactivated', 'fraudulent'])->default('active');
            $table->json('widget_meta_data')->nullable();
            $table->timestamp('widget_expiry_date')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('widgets');
    }
};