<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

     'firebase' => [
        'api_key' => env('FIREBASE_API_KEY', 'AIzaSyADZjk57dZ82lopzyCZf1pW0-a14BrIHOU'),
        'auth_domain' => env('FIREBASE_AUTH_DOMAIN', 'livechat-tidu.firebaseapp.com'),
        'project_id' => env('FIREBASE_PROJECT_ID', 'livechat-tidu'),
        'storage_bucket' => env('FIREBASE_STORAGE_BUCKET', 'livechat-tidu.firebasestorage.app'),
        'messaging_sender_id' => env('FIREBASE_MESSAGING_SENDER_ID', '414954993651'),
        'app_id' => env('FIREBASE_APP_ID', '1:414954993651:web:182010935a2a9465944486'),
        'measurement_id' => env('FIREBASE_MEASUREMENT_ID', 'G-JEP8GDWEGK'),
        'database_url' => env('FIREBASE_DATABASE_URL', 'https://livechat-tidu.firebaseio.com'),
    ],

];
