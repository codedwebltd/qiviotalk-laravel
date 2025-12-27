<template>
  <AdminLayout title="System Logs">
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Laravel Log Viewer</h3>
            <p class="text-sm text-gray-600">{{ logInfo.path }}</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50 border-b border-gray-100">
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex items-center gap-2">
            <button
              @click="refreshLogs"
              :disabled="isRefreshing"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <svg :class="['w-5 h-5', isRefreshing ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              Refresh
            </button>
            <button
              @click="clearLogs"
              :disabled="isClearing"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              {{ isClearing ? 'Clearing...' : 'Clear' }}
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total Lines</div>
            <div class="text-2xl font-bold text-gray-900">{{ logInfo.totalLines.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">File Size</div>
            <div class="text-2xl font-bold text-gray-900">{{ logInfo.fileSize }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Last Modified</div>
            <div class="text-sm font-medium text-gray-900">{{ logInfo.lastModified }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Status</div>
            <div class="flex items-center gap-2">
              <span :class="['w-2 h-2 rounded-full', logInfo.exists ? 'bg-green-500' : 'bg-red-500']"></span>
              <span class="text-sm font-medium text-gray-900">{{ logInfo.exists ? 'Active' : 'Not Found' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-900 overflow-auto" style="max-height: calc(100vh - 400px);">
        <pre v-if="logContent" class="text-xs sm:text-sm text-green-400 font-mono whitespace-pre-wrap break-words">{{ logContent }}</pre>
        <div v-else class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-gray-500 font-medium">No log content available</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import axios from 'axios';

const props = defineProps({
  logContent: String,
  logInfo: Object,
});

const isRefreshing = ref(false);
const isClearing = ref(false);

const refreshLogs = () => {
  isRefreshing.value = true;
  router.reload({
    only: ['logContent', 'logInfo'],
    onFinish: () => {
      isRefreshing.value = false;
    }
  });
};

const clearLogs = async () => {
  if (!confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
    return;
  }

  isClearing.value = true;

  try {
    const response = await axios.post('/admin/logs/clear');
    if (response.data.status === 'success') {
      await router.reload({ only: ['logContent', 'logInfo'] });
    }
  } catch (error) {
    console.error('Failed to clear logs:', error);
    alert('Failed to clear logs');
  } finally {
    isClearing.value = false;
  }
};
</script>
