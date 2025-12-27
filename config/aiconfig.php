<?php

return [
    /*
    |--------------------------------------------------------------------------
    | AI Service Configuration
    |--------------------------------------------------------------------------
    | This configuration will be manageable from admin backend in the future
    |
    */

    'enabled' => env('AI_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Groq API Settings
    |--------------------------------------------------------------------------
    */

    'groq' => [
        'api_key' => env('GROQ_API_KEY', ''),
        'api_url' => 'https://api.groq.com/openai/v1/chat/completions',
        'model' => env('GROQ_API_MODEL', 'llama-3.1-8b-instant'),
        'max_tokens' => 500,
        'temperature' => 0.7,
    ],

    /*
    |--------------------------------------------------------------------------
    | Caching Configuration
    |--------------------------------------------------------------------------
    */

    'cache' => [
        'enabled' => true,
        'ttl' => 86400, // 24 hours in seconds
        'similarity_threshold' => 0.85, // For smart matching (0.0 to 1.0)
    ],

    /*
    |--------------------------------------------------------------------------
    | Conversation Context
    |--------------------------------------------------------------------------
    */

    'context' => [
        'max_messages' => 10, // How many previous messages to include in context
        'include_website_context' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Escalation Settings
    |--------------------------------------------------------------------------
    */

    'escalation' => [
        'keywords' => [
            'help',
            'urgent',
            'manager',
            'complaint',
            'speak to someone',
            'human',
            'agent',
            'talk to person',
            'real person',
            'customer service'
        ],
        'max_ai_responses' => 5, // After 5 AI responses, suggest human agent
        'frustration_threshold' => 0.7, // Sentiment score below this triggers escalation
    ],

    /*
    |--------------------------------------------------------------------------
    | Website Scraping Configuration
    |--------------------------------------------------------------------------
    */

    'scraping' => [
        'enabled' => true,
        'frequency' => 'weekly', // How often to re-scrape (used by cron)
        'frequency_days' => 7, // Days between scrapes
        'max_pages' => 10, // Maximum pages to scrape per widget
        'timeout' => 30, // Request timeout in seconds
        'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ],

    /*
    |--------------------------------------------------------------------------
    | Learning & Improvement Settings
    |--------------------------------------------------------------------------
    */

    'learning' => [
        'enabled' => true,
        'min_rating_for_pattern' => 4, // Only learn from conversations rated 4+ stars
        'pattern_confidence_threshold' => 3, // Need 3+ successful uses to trust pattern
        'max_patterns_per_intent' => 50, // Limit stored patterns per intent type
    ],

    /*
    |--------------------------------------------------------------------------
    | Response Settings
    |--------------------------------------------------------------------------
    */

    'response' => [
        'typing_delay' => 2000, // Milliseconds to show "typing..." before response
        'max_retries' => 3, // Retry failed API calls
        'fallback_message' => 'I apologize, but I am having trouble processing your request. Let me connect you with a human agent who can better assist you.',
        'escalation_system_message' => 'An agent will be with you shortly.',
    ],

    /*
    |--------------------------------------------------------------------------
    | Display Settings
    |--------------------------------------------------------------------------
    */

    'display' => [
        'bot_name' => env('AI_BOT_NAME', 'AI Assistant'), // Name shown in widget for bot messages
        'show_sender_names' => true, // Show sender names in widget
    ],

    /*
    |--------------------------------------------------------------------------
    | Agent Takeover Settings
    |--------------------------------------------------------------------------
    */

    'agent_takeover' => [
        'backoff_minutes' => env('AI_AGENT_BACKOFF_MINUTES', 30), // AI backs off if agent messaged within X minutes
    ],
];
