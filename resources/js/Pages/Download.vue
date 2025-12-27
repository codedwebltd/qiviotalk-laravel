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
          <Link href="/" class="flex items-center gap-2 px-5 py-2.5 bg-white/90 hover:bg-white border-2 border-gray-300 hover:border-blue-400 text-gray-900 text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <!-- Animated background -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
      </div>

      <!-- Header Section -->
      <div class="relative text-center mb-12 sm:mb-16">
        <div class="inline-flex items-center gap-2 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6 border-2 border-blue-200">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span class="text-sm font-bold text-gray-900">Download Apps</span>
        </div>
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-black mb-4">
          Get <span class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">{{ appName }}</span>
        </h1>
        <p class="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
          Download our native apps for iOS and Android. Stay connected with your customers anywhere.
        </p>
      </div>
      <!-- Header -->
      <!-- <div class="text-center mb-12 sm:mb-16">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Download <span class="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">{{ appName }}</span>
        </h1>
        <p class="text-base sm:text-lg md:text-xl text-gray-400">
          Get the app for iOS and Android
        </p>
      </div> -->

      <!-- Download Cards -->
      <div class="relative space-y-8 max-w-4xl mx-auto">
        <!-- Android Card -->
        <div v-if="androidVersion" class="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl hover:border-green-300 transition-all duration-300 hover:shadow-2xl overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-green-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div class="relative p-6 sm:p-8">
            <!-- Header Section -->
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 sm:w-9 sm:h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C2.92 11.03 1 14.22 1 17.8h22c0-3.58-1.92-6.77-5.4-8.32zM8.06 15.32c-.59 0-1.07-.48-1.07-1.07 0-.59.48-1.07 1.07-1.07s1.07.48 1.07 1.07c0 .59-.48 1.07-1.07 1.07zm7.88 0c-.59 0-1.07-.48-1.07-1.07 0-.59.48-1.07 1.07-1.07s1.07.48 1.07 1.07c0 .59-.48 1.07-1.07 1.07z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Android</h2>
                  <p class="text-sm sm:text-base text-gray-600 mt-1">Version {{ androidVersion.version_name }}</p>
                </div>
              </div>
              <a
                :href="androidVersion.download_url"
                target="_blank"
                class="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group/btn"
              >
                <span class="flex items-center gap-2">
                  Download APK
                  <svg class="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </span>
              </a>
            </div>

            <!-- Changelog Section -->
            <div v-if="androidVersion.changelog" class="mb-6">
              <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                What's new
              </h3>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <pre class="text-sm text-gray-700 whitespace-pre-line font-sans leading-relaxed">{{ androidVersion.changelog }}</pre>
              </div>
            </div>

            <!-- Release Date -->
            <div v-if="androidVersion.release_date" class="pt-6 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Released on {{ formatDate(androidVersion.release_date) }}
            </div>
          </div>
        </div>

        <!-- Android Placeholder -->
        <div v-else class="bg-white/60 backdrop-blur-sm border-2 border-gray-200 rounded-3xl p-6 sm:p-8 opacity-50">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 sm:w-9 sm:h-9 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-2.86-1.21-6.08-1.21-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C2.92 11.03 1 14.22 1 17.8h22c0-3.58-1.92-6.77-5.4-8.32zM8.06 15.32c-.59 0-1.07-.48-1.07-1.07 0-.59.48-1.07 1.07-1.07s1.07.48 1.07 1.07c0 .59-.48 1.07-1.07 1.07zm7.88 0c-.59 0-1.07-.48-1.07-1.07 0-.59.48-1.07 1.07-1.07s1.07.48 1.07 1.07c0 .59-.48 1.07-1.07 1.07z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-400">Android</h2>
              <p class="text-sm sm:text-base text-gray-500 mt-1">Coming soon</p>
            </div>
          </div>
        </div>

        <!-- iOS Card -->
        <div v-if="iosVersion" class="group relative bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-3xl hover:border-orange-300 transition-all duration-300 hover:shadow-2xl overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div class="relative p-6 sm:p-8">
            <!-- Header Section -->
            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-8 h-8 sm:w-9 sm:h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </div>
                <div>
                  <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">iOS</h2>
                  <p class="text-sm sm:text-base text-gray-600 mt-1">Version {{ iosVersion.version_name }}</p>
                </div>
              </div>
              <a
                :href="iosVersion.download_url"
                target="_blank"
                class="w-full lg:w-auto inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group/btn"
              >
                <span class="flex items-center gap-2">
                  Download IPA
                  <svg class="w-5 h-5 group-hover/btn:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </span>
              </a>
            </div>

            <!-- Changelog Section -->
            <div v-if="iosVersion.changelog" class="mb-6">
              <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
                What's new
              </h3>
              <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                <pre class="text-sm text-gray-700 whitespace-pre-line font-sans leading-relaxed">{{ iosVersion.changelog }}</pre>
              </div>
            </div>

            <!-- Release Date -->
            <div v-if="iosVersion.release_date" class="pt-6 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              Released on {{ formatDate(iosVersion.release_date) }}
            </div>
          </div>
        </div>

        <!-- iOS Placeholder -->
        <div v-else class="bg-white/60 backdrop-blur-sm border-2 border-gray-200 rounded-3xl p-6 sm:p-8 opacity-50">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg class="w-8 h-8 sm:w-9 sm:h-9 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-2xl sm:text-3xl font-bold text-gray-400">iOS</h2>
              <p class="text-sm sm:text-base text-gray-500 mt-1">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Installation Note -->
      <div class="relative mt-12 max-w-4xl mx-auto">
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 hover:border-amber-300 transition-all duration-300 shadow-lg hover:shadow-xl">
          <div class="flex gap-3">
            <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div>
              <h3 class="text-sm font-bold text-amber-900 mb-1.5">Installation note</h3>
              <p class="text-sm text-amber-800 leading-relaxed">
                For iOS devices, you may need to trust the developer certificate in <strong class="text-amber-900">Settings → General → VPN & Device Management</strong> after installation.
              </p>
            </div>
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

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
</script>

<style scoped>
/* Custom scrollbar */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.scrollbar-thumb-gray-400:hover::-webkit-scrollbar-thumb {
  background-color: #9ca3af;
}

.scrollbar-track-gray-100::-webkit-scrollbar-track {
  background-color: #f3f4f6;
  border-radius: 3px;
}
</style>
