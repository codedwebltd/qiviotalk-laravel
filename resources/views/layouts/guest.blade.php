<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans text-gray-900 antialiased">
        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gradient-to-br from-gray-50 to-gray-100">
            <!-- Logo Section -->
            <div class="mb-8">
                <a href="/" class="flex flex-col items-center gap-3">
                    <div class="w-20 h-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl flex items-center justify-center">
                        <span class="text-3xl font-bold text-white tracking-tight">
                            {{ strtoupper(substr(config('app.name'), 0, 1) . (strlen(config('app.name')) > 1 ? substr(config('app.name'), 1, 1) : '')) }}
                        </span>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900">{{ config('app.name') }}</h1>
                </a>
            </div>

            <!-- Login Card -->
            <div class="w-full sm:max-w-md px-6 py-8 bg-white shadow-2xl overflow-hidden rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                {{ $slot }}
            </div>

            <!-- Footer -->
            <div class="mt-8 text-center">
                <p class="text-sm text-gray-600">
                    Designed with <span class="text-red-500">&hearts;</span> by <span class="font-semibold text-gray-900">CodedWeb</span>
                </p>
                <p class="text-xs text-gray-500 mt-1">
                    &copy; {{ date('Y') }} All rights reserved
                </p>
            </div>
        </div>
    </body>
</html>
