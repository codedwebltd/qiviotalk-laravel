<?php

  use Illuminate\Database\Migrations\Migration;
  use Illuminate\Database\Schema\Blueprint;
  use Illuminate\Support\Facades\Schema;

  return new class extends Migration
  {
      public function up()
      {
          Schema::create('ai_settings', function (Blueprint $table) {
              $table->id();
              $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->onUpdate('cascade');
              $table->boolean('enabled')->default(false);
              $table->boolean('auto_reply')->default(false);
              $table->string('personality')->default('friendly');
              $table->string('response_tone')->default('professional');
              $table->integer('max_response_time')->default(5);
              $table->boolean('fallback_to_human')->default(true);
              $table->string('language')->default('en');
              $table->boolean('knowledge_base_enabled')->default(true);
              $table->text('greeting_message')->nullable();
              $table->text('offline_message')->nullable();
              $table->timestamps();
          });
      }

      public function down()
      {
          Schema::dropIfExists('ai_settings');
      }
  };