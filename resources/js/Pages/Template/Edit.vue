<template>
  <AdminLayout title="Widget Template Editor">
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <!-- Header -->
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Edit Widget Template</h3>
              <p class="text-xs sm:text-sm text-gray-600 break-all">resources/js/widget-template.js</p>
            </div>
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
              v-if="originalBackupExists"
              @click="restoreOriginal"
              :disabled="isRestoringOriginal"
              class="flex-1 sm:flex-none px-2 sm:px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 text-xs"
              title="Restore original pristine template"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span class="hidden sm:inline">{{ isRestoringOriginal ? 'Restoring...' : 'Original' }}</span>
            </button>
            <button
              v-if="backupExists"
              @click="restoreBackup"
              :disabled="isRestoring"
              class="flex-1 sm:flex-none px-2 sm:px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1 text-xs"
              title="Restore last saved version"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
              <span class="hidden sm:inline">{{ isRestoring ? 'Restoring...' : 'Restore' }}</span>
            </button>
            <button
              @click="saveTemplate"
              :disabled="isSaving"
              class="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <svg :class="['w-4 h-4 sm:w-5 sm:h-5', isSaving ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              <span class="hidden sm:inline">{{ isSaving ? 'Saving...' : 'Save' }}</span>
              <span class="sm:hidden">{{ isSaving ? '...' : 'Save' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Alert Messages -->
      <transition name="slide-down">
        <div v-if="alert.show" :class="[
          'mx-4 sm:mx-6 mt-4 p-4 rounded-lg border-l-4',
          alert.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-red-50 border-red-400 text-red-700'
        ]">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path v-if="alert.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-sm font-medium">{{ alert.message }}</p>
          </div>
        </div>
      </transition>

      <!-- Warning Notice -->
      <div class="mx-4 sm:mx-6 mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-sm text-yellow-700">
              <strong>Warning:</strong> This is your base widget template. Changes here will affect all widgets. A backup is automatically created before each save.
            </p>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-4 sm:px-6 pt-4">
        <div class="flex flex-col sm:flex-row gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div class="flex-1 flex gap-2">
            <input
              v-model="searchQuery"
              @input="performSearch"
              @keydown.enter.prevent="findNext"
              @keydown.escape="clearSearch"
              type="text"
              placeholder="Search in code... (Press Enter for next, Esc to clear)"
              class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <label class="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                v-model="caseSensitive"
                @change="performSearch"
                type="checkbox"
                class="rounded text-purple-600 focus:ring-purple-500"
              />
              <span class="text-sm text-gray-700">Aa</span>
            </label>
          </div>
          <div class="flex gap-1">
            <button
              @click="findPrevious"
              :disabled="!searchQuery || matches.length === 0"
              class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous match"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/>
              </svg>
            </button>
            <button
              @click="findNext"
              :disabled="!searchQuery || matches.length === 0"
              class="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next match"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div class="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 min-w-[80px] justify-center">
              <span v-if="searchQuery && matches.length > 0">{{ currentMatchIndex + 1 }} / {{ matches.length }}</span>
              <span v-else-if="searchQuery && matches.length === 0">0 / 0</span>
              <span v-else>-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Code Editor -->
      <div class="p-4 sm:p-6">
        <div class="relative">
          <textarea
            v-model="content"
            ref="editorRef"
            @keydown="handleKeydown"
            @input="updateStats"
            class="w-full font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none bg-gray-50"
            spellcheck="false"
            style="tab-size: 4; height: 500px;"
          ></textarea>
          <div class="absolute bottom-2 right-2 text-xs bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-200">
            <span class="text-gray-600">Lines: </span>
            <span class="font-semibold text-gray-900">{{ stats.lines }}</span>
            <span class="text-gray-400 mx-2">|</span>
            <span class="text-gray-600">Chars: </span>
            <span class="font-semibold text-gray-900">{{ stats.chars }}</span>
          </div>
        </div>
      </div>

      <!-- File Info -->
      <div class="px-4 sm:px-6 pb-4 sm:pb-6 text-sm text-gray-600 space-y-1">
        <p><strong class="text-gray-900">Main:</strong> resources/js/widget-template.js</p>
        <p><strong class="text-gray-900">Last Save Backup:</strong> resources/js/backup/widget-template.js (auto-updated on save)</p>
        <p><strong class="text-green-700">Original Backup:</strong> resources/js/backup/widget-template-original.js (untouchable)</p>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import axios from 'axios';

const props = defineProps({
  content: String,
  backupExists: Boolean,
  originalBackupExists: Boolean,
});

const content = ref(props.content);
const originalContent = ref(props.content);
const editorRef = ref(null);
const isSaving = ref(false);
const isRestoring = ref(false);
const isRestoringOriginal = ref(false);

const stats = reactive({
  lines: 0,
  chars: 0,
});

const alert = reactive({
  show: false,
  type: 'success',
  message: '',
});

// Search functionality
const searchQuery = ref('');
const caseSensitive = ref(false);
const matches = ref([]);
const currentMatchIndex = ref(0);

const showAlert = (message, type = 'success') => {
  alert.show = true;
  alert.type = type;
  alert.message = message;

  setTimeout(() => {
    alert.show = false;
  }, 5000);
};

const updateStats = () => {
  stats.lines = content.value.split('\n').length;
  stats.chars = content.value.length;
};

// Search functions
const performSearch = () => {
  matches.value = [];
  currentMatchIndex.value = 0;

  if (!searchQuery.value) {
    return;
  }

  const text = caseSensitive.value ? content.value : content.value.toLowerCase();
  const query = caseSensitive.value ? searchQuery.value : searchQuery.value.toLowerCase();

  let index = 0;
  while (index !== -1) {
    index = text.indexOf(query, index);
    if (index !== -1) {
      matches.value.push(index);
      index += query.length;
    }
  }

  if (matches.value.length > 0) {
    jumpToMatch(0);
  }
};

const jumpToMatch = (matchIndex) => {
  if (matches.value.length === 0) return;

  const matchPosition = matches.value[matchIndex];
  const textarea = editorRef.value;

  if (textarea) {
    textarea.focus();
    textarea.setSelectionRange(matchPosition, matchPosition + searchQuery.value.length);

    // Scroll to make the selection visible
    const lineHeight = 20; // approximate
    const linesBeforeMatch = content.value.substring(0, matchPosition).split('\n').length;
    textarea.scrollTop = Math.max(0, (linesBeforeMatch - 5) * lineHeight);
  }

  currentMatchIndex.value = matchIndex;
};

const findNext = () => {
  if (matches.value.length === 0) return;

  const nextIndex = (currentMatchIndex.value + 1) % matches.value.length;
  jumpToMatch(nextIndex);
};

const findPrevious = () => {
  if (matches.value.length === 0) return;

  const prevIndex = currentMatchIndex.value === 0
    ? matches.value.length - 1
    : currentMatchIndex.value - 1;
  jumpToMatch(prevIndex);
};

const clearSearch = () => {
  searchQuery.value = '';
  matches.value = [];
  currentMatchIndex.value = 0;
};

const handleKeydown = (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const value = e.target.value;

    content.value = value.substring(0, start) + '    ' + value.substring(end);

    // Move cursor after the inserted tab
    setTimeout(() => {
      e.target.selectionStart = e.target.selectionEnd = start + 4;
    }, 0);
  }
};

const saveTemplate = async () => {
  if (!confirm('Save changes to the template?\n\nThis will:\n- Update the main template file\n- Create a backup of the current version\n- Affect all future widgets')) {
    return;
  }

  isSaving.value = true;

  try {
    const response = await axios.post('/template/update', {
      content: content.value,
    });

    if (response.data.success) {
      showAlert(response.data.message, 'success');
      originalContent.value = content.value;
    } else {
      showAlert(response.data.message || 'Failed to save template', 'error');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Network error: ' + error.message;
    showAlert(message, 'error');
  } finally {
    isSaving.value = false;
  }
};

const restoreBackup = async () => {
  if (!confirm('Restore from LAST SAVE backup?\n\nThis will:\n- Replace current editor content\n- Load the last saved version\n- Lose any unsaved changes\n\nContinue?')) {
    return;
  }

  isRestoring.value = true;

  try {
    const response = await axios.post('/template/restore');

    if (response.data.success) {
      content.value = response.data.content;
      originalContent.value = response.data.content;
      updateStats();
      showAlert(response.data.message, 'success');
    } else {
      showAlert(response.data.message || 'Failed to restore backup', 'error');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Network error: ' + error.message;
    showAlert(message, 'error');
  } finally {
    isRestoring.value = false;
  }
};

const restoreOriginal = async () => {
  if (!confirm('⚠️ Restore ORIGINAL PRISTINE template?\n\nThis will:\n- Replace current editor content\n- Load the untouched original template\n- ERASE ALL modifications you ever made\n- Cannot be undone\n\n🚨 This is a FULL RESET! Continue?')) {
    return;
  }

  isRestoringOriginal.value = true;

  try {
    const response = await axios.post('/template/restore-original');

    if (response.data.success) {
      content.value = response.data.content;
      originalContent.value = response.data.content;
      updateStats();
      showAlert(response.data.message, 'success');
    } else {
      showAlert(response.data.message || 'Failed to restore original', 'error');
    }
  } catch (error) {
    const message = error.response?.data?.message || 'Network error: ' + error.message;
    showAlert(message, 'error');
  } finally {
    isRestoringOriginal.value = false;
  }
};

// Warn before leaving if there are unsaved changes
const handleBeforeUnload = (e) => {
  if (content.value !== originalContent.value) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onMounted(() => {
  updateStats();
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
