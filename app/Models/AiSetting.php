<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

  class AiSetting extends Model
  {
      use HasFactory;

      protected $fillable = [
          'user_id',
          'enabled',
          'auto_reply',
          'personality',
          'response_tone',
          'max_response_time',
          'fallback_to_human',
          'language',
          'knowledge_base_enabled',
          'greeting_message',
          'offline_message',
      ];

      protected $casts = [
          'enabled' => 'boolean',
          'auto_reply' => 'boolean',
          'fallback_to_human' => 'boolean',
          'knowledge_base_enabled' => 'boolean',
          'max_response_time' => 'integer',
      ];

      public function user()
      {
          return $this->belongsTo(User::class);
      }
  }
