<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Navigation -->
    <nav class="border-b border-white/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
          <Link href="/" class="flex items-center gap-3 group">
            <div class="relative">
              <div class="absolute inset-0 bg-blue-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <div class="relative bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
            </div>
            <span class="text-2xl font-bold">
              <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">{{ appName }}</span>
            </span>
          </Link>
          <Link
            href="/download"
            class="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
          >
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download
            </span>
            <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Link>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main>
      <div class="relative overflow-hidden">
        <!-- Animated background -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
          <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div class="text-center max-w-5xl mx-auto">
            <!-- Badge -->
            <div class="inline-flex items-center gap-3 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm px-5 py-3 rounded-full shadow-xl mb-8 border-2 border-green-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 group cursor-default hover:scale-105">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-lg shadow-green-500/50"></span>
              </span>
              <span class="text-sm font-bold bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ⚡ Live Now • Multi-Widget • AI-Powered • 100% Free
              </span>
              <span class="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full">NEW</span>
            </div>

            <!-- Main Headline -->
            <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tight">
              <span class="block text-gray-900 mb-2">Transform</span>
              <span class="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">Customer Support</span>
              <span class="block text-gray-900">Into Conversations</span>
            </h1>

            <!-- Subheadline -->
            <p class="text-lg sm:text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
              One widget code. Multiple websites. Unlimited possibilities.
              <span class="block mt-3 text-indigo-600 font-semibold">Powered by AI to deliver exceptional customer experiences.</span>
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
              <Link
                href="/download"
                class="group relative w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white text-lg font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 overflow-hidden"
              >
                <span class="relative z-10 flex items-center justify-center gap-3">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download Free App
                  <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </span>
                <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Link>

              <button class="group w-full sm:w-auto px-10 py-5 bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-gray-300 hover:border-blue-400 text-gray-900 text-lg font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                <span class="flex items-center justify-center gap-3">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Watch Demo
                </span>
              </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div class="group relative bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 hover:bg-white hover:border-blue-200 transition-all duration-300 hover:shadow-xl cursor-default hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <div class="relative">
                  <div class="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">∞</div>
                  <div class="text-sm font-semibold text-gray-700">Websites</div>
                  <div class="text-xs text-gray-500 mt-1">One widget code</div>
                </div>
              </div>

              <div class="group relative bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 hover:bg-white hover:border-green-200 transition-all duration-300 hover:shadow-xl cursor-default hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <div class="relative">
                  <div class="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">AI</div>
                  <div class="text-sm font-semibold text-gray-700">Co-Pilot</div>
                  <div class="text-xs text-gray-500 mt-1">Smart assistance</div>
                </div>
              </div>

              <div class="group relative bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 hover:bg-white hover:border-orange-200 transition-all duration-300 hover:shadow-xl cursor-default hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <div class="relative">
                  <div class="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">&lt;1s</div>
                  <div class="text-sm font-semibold text-gray-700">Response</div>
                  <div class="text-xs text-gray-500 mt-1">Lightning fast</div>
                </div>
              </div>

              <div class="group relative bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl p-6 hover:bg-white hover:border-purple-200 transition-all duration-300 hover:shadow-xl cursor-default hover:scale-105">
                <div class="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                <div class="relative">
                  <div class="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">24/7</div>
                  <div class="text-sm font-semibold text-gray-700">Available</div>
                  <div class="text-xs text-gray-500 mt-1">Always online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="relative py-20 sm:py-28">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern customer support
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div
              @click="toggleFeature(0)"
              class="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              :class="{ 'ring-2 ring-blue-500': expandedFeature === 0 }"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all duration-300" :class="{ 'rotate-180 text-blue-600': expandedFeature === 0 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Multi-Widget Magic</h3>
                <p class="text-gray-600 leading-relaxed mb-4">
                  Deploy a single widget code across unlimited websites. Manage all conversations from one powerful dashboard.
                </p>
                <div v-show="expandedFeature === 0" class="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fadeIn">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">One widget code for unlimited websites</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Centralized dashboard for all conversations</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Easy installation - copy & paste</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Track performance across all domains</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 2 -->
            <div
              @click="toggleFeature(1)"
              class="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-green-300 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              :class="{ 'ring-2 ring-green-500': expandedFeature === 1 }"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                    </svg>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-green-600 transition-all duration-300" :class="{ 'rotate-180 text-green-600': expandedFeature === 1 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">AI Co-Pilot</h3>
                <p class="text-gray-600 leading-relaxed mb-4">
                  Smart AI suggestions help you respond faster and better. Let artificial intelligence assist your team.
                </p>
                <div v-show="expandedFeature === 1" class="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fadeIn">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">AI-powered response suggestions</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Smart auto-complete for faster replies</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Sentiment analysis & tone detection</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Context-aware recommendations</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 3 -->
            <div
              @click="toggleFeature(2)"
              class="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-purple-300 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              :class="{ 'ring-2 ring-purple-500': expandedFeature === 2 }"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-purple-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-purple-600 transition-all duration-300" :class="{ 'rotate-180 text-purple-600': expandedFeature === 2 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Native Apps</h3>
                <p class="text-gray-600 leading-relaxed mb-4">
                  Beautiful native iOS and Android apps. Stay connected with customers anywhere, anytime.
                </p>
                <div v-show="expandedFeature === 2" class="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fadeIn">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Native iOS & Android applications</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Push notifications for new messages</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Offline mode & message sync</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Optimized battery & data usage</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 4 -->
            <div
              @click="toggleFeature(3)"
              class="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-orange-300 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              :class="{ 'ring-2 ring-orange-500': expandedFeature === 3 }"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-orange-600 transition-all duration-300" :class="{ 'rotate-180 text-orange-600': expandedFeature === 3 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Real-Time Speed</h3>
                <p class="text-gray-600 leading-relaxed mb-4">
                  Instant message delivery with zero lag. Your customers never wait for responses.
                </p>
                <div v-show="expandedFeature === 3" class="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fadeIn">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Messages delivered in milliseconds</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Live typing indicators</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Read receipts & delivery status</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">WebSocket-powered connections</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 5 -->
            <div
              @click="toggleFeature(4)"
              class="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-cyan-300 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              :class="{ 'ring-2 ring-cyan-500': expandedFeature === 4 }"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-cyan-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-cyan-600 transition-all duration-300" :class="{ 'rotate-180 text-cyan-600': expandedFeature === 4 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-cyan-600 transition-colors">Secure & Private</h3>
                <p class="text-gray-600 leading-relaxed mb-4">
                  Enterprise-grade security with end-to-end encryption. Your data stays protected.
                </p>
                <div v-show="expandedFeature === 4" class="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fadeIn">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">End-to-end encryption</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">GDPR & privacy compliant</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Secure data storage</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-cyan-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">SSL/TLS encrypted connections</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 6 -->
            <div
              @click="toggleFeature(5)"
              class="group relative bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 hover:bg-white hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
              :class="{ 'ring-2 ring-indigo-500': expandedFeature === 5 }"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
              <div class="relative">
                <div class="flex items-start justify-between mb-6">
                  <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                    </svg>
                  </div>
                  <svg class="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-all duration-300" :class="{ 'rotate-180 text-indigo-600': expandedFeature === 5 }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Easy Customization</h3>
                <p class="text-gray-600 leading-relaxed mb-4">
                  Match your brand perfectly. Customize colors, themes, and messages effortlessly.
                </p>
                <div v-show="expandedFeature === 5" class="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fadeIn">
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Custom colors & branding</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Widget position & appearance</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Custom welcome messages</p>
                  </div>
                  <div class="flex items-start gap-3">
                    <svg class="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <p class="text-sm text-gray-700">Multi-language support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Section -->
      <div class="relative py-20 sm:py-28">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-5"></div>
        <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div class="bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-3xl p-12">
            <h2 class="text-4xl sm:text-5xl font-black text-gray-900 mb-6">
              Ready to Transform Your
              <span class="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">Customer Experience?</span>
            </h2>
            <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses delivering exceptional support with {{ appName }}.
            </p>
            <Link
              href="/download"
              class="group inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white text-xl font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
            >
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download Free Now
              <svg class="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
              </svg>
            </Link>
            <p class="text-sm text-gray-500 mt-6">No credit card required • Free forever • Multi-platform</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer Component -->
    <WidgetFooter :appName="appName" />
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { ref } from 'vue';
import WidgetFooter from '@/Components/WidgetFooter.vue';

defineProps({
  appName: {
    type: String,
    default: 'QIVIOTALK'
  },
  androidVersion: {
    type: Object,
    default: null
  },
  iosVersion: {
    type: Object,
    default: null
  }
});

const expandedFeature = ref(null);

const toggleFeature = (index) => {
  expandedFeature.value = expandedFeature.value === index ? null : index;
};
</script>

<style scoped>
@keyframes gradient {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 3s ease infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
