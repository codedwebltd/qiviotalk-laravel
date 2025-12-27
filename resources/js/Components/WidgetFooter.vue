<template>
  <footer class="relative border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white py-12 overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute inset-0 opacity-30">
      <div class="absolute top-10 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Brand -->
        <div class="space-y-4">
          <Link href="/" class="inline-flex items-center gap-2 group">
            <span class="text-2xl font-bold">
              <span class="text-blue-600 group-hover:text-blue-700 transition-colors">&lt;</span>
              <span class="text-gray-900 group-hover:text-blue-600 transition-colors">{{ appName }}</span>
              <span class="text-blue-600 group-hover:text-blue-700 transition-colors">/&gt;</span>
            </span>
          </Link>
          <p class="text-sm text-gray-600 leading-relaxed">
            Transform customer conversations into meaningful connections with our multi-widget, AI-powered chat solution.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">Quick Links</h3>
          <ul class="space-y-3">
            <li>
              <Link href="/" class="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                Home
              </Link>
            </li>
            <li>
              <Link href="/download" class="text-gray-600 hover:text-blue-600 transition-colors text-sm flex items-center gap-2 group">
                <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
                Downloads
              </Link>
            </li>
          </ul>
        </div>

        <!-- Features -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">Features</h3>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Multi-widget support
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              AI Co-pilot features
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Real-time messaging
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Cross-platform apps
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.</p>
        <p>Built with <span class="text-red-500">❤</span> by <span class="text-gray-900 font-semibold">CodedWeb</span></p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import { onMounted } from 'vue';

defineProps({
  appName: {
    type: String,
    default: 'QIVIOTALK'
  }
});

// Load widget script dynamically
onMounted(() => {
  // Check if widget script is already loaded
  if (!document.querySelector('script[src*="widget-412cdf8d0d9c1aa501b073cfac8985c4.js"]')) {
    const script = document.createElement('script');
    script.src = '/widgets/widget-412cdf8d0d9c1aa501b073cfac8985c4.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }
});
</script>
