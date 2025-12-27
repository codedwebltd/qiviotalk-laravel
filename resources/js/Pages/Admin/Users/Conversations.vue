<template>
  <AdminLayout :title="`Manage Conversations - ${user.name}`">
    <!-- Back Button -->
    <div class="mb-6">
      <Link
        :href="`/admin/users/${user.id}`"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to User Details
      </Link>
    </div>

    <!-- Header Card -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6 hover:shadow-xl transition-shadow duration-300">
      <div class="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-cyan-600">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
              {{ getUserInitials(user.name) }}
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-white mb-1">{{ user.name }}'s Conversations</h2>
              <p class="text-cyan-100 text-xs sm:text-sm">Manage and delete user conversations</p>
            </div>
          </div>
          <div class="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full self-start sm:self-center">
            <p class="text-white font-bold text-base sm:text-lg">{{ conversations.length }} Total</p>
          </div>
        </div>
      </div>

      <!-- Bulk Actions Bar -->
      <div class="p-3 sm:p-4 bg-gray-50 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div class="flex items-center gap-2 sm:gap-3">
            <input
              type="checkbox"
              :checked="allSelected"
              @change="toggleSelectAll"
              class="w-5 h-5 text-cyan-600 bg-white border-gray-300 rounded focus:ring-cyan-500 cursor-pointer flex-shrink-0"
            />
            <span class="text-xs sm:text-sm font-semibold text-gray-700">
              {{ selectedConversations.length > 0 ? `${selectedConversations.length} selected` : 'Select All' }}
            </span>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              v-if="selectedConversations.length > 0"
              @click="bulkDelete"
              :disabled="isDeleting"
              class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              <span class="hidden xs:inline">Delete Selected ({{ selectedConversations.length }})</span>
              <span class="xs:hidden">Delete ({{ selectedConversations.length }})</span>
            </button>

            <button
              @click="deleteAll"
              :disabled="isDeleting || conversations.length === 0"
              class="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg hover:from-rose-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              Delete All
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Conversations List -->
    <div v-if="conversations.length > 0" class="grid grid-cols-1 gap-3 sm:gap-4">
      <div
        v-for="conversation in conversations"
        :key="conversation.id"
        class="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
        :class="{ 'ring-2 ring-cyan-500': selectedConversations.includes(conversation.id) }"
      >
        <div class="p-3 sm:p-5">
          <!-- Mobile Layout -->
          <div class="flex flex-col gap-3 lg:hidden">
            <!-- Top Row: Checkbox, Avatar & Info -->
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :checked="selectedConversations.includes(conversation.id)"
                @change="toggleConversation(conversation.id)"
                class="w-5 h-5 mt-1 text-cyan-600 bg-white border-gray-300 rounded focus:ring-cyan-500 cursor-pointer flex-shrink-0"
              />
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
                  {{ conversation.visitor_name?.charAt(0).toUpperCase() || 'V' }}
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 text-sm sm:text-base truncate">{{ conversation.visitor_name || 'Anonymous Visitor' }}</h3>
                  <p class="text-xs sm:text-sm text-gray-500 truncate">{{ conversation.visitor_email || 'No email' }}</p>
                </div>
              </div>
            </div>

            <!-- Stats Row -->
            <div class="flex items-center justify-around gap-2 bg-gray-50 rounded-lg p-3 -mx-1">
              <div class="text-center">
                <p class="text-xl sm:text-2xl font-bold text-cyan-600">{{ conversation.messages_count || 0 }}</p>
                <p class="text-xs text-gray-500 font-semibold">Messages</p>
              </div>
              <div class="text-center">
                <span
                  :class="{
                    'bg-green-100 text-green-800': conversation.status === 'open',
                    'bg-gray-100 text-gray-800': conversation.status === 'closed',
                  }"
                  class="px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ conversation.status }}
                </span>
              </div>
              <div class="text-center">
                <p class="text-xs text-gray-500 font-semibold">Created</p>
                <p class="text-xs sm:text-sm font-bold text-gray-900">{{ formatDate(conversation.created_at) }}</p>
              </div>
            </div>

            <!-- Actions Row -->
            <div class="flex flex-col sm:flex-row items-stretch gap-2">
              <Link
                :href="`/admin/conversations/${conversation.id}`"
                class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold text-xs sm:text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                View Details
              </Link>
              <button
                @click="deleteConversation(conversation.id)"
                :disabled="isDeleting"
                class="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-semibold text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>

          <!-- Desktop Layout -->
          <div class="hidden lg:flex items-center justify-between">
            <!-- Checkbox & Info -->
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <input
                type="checkbox"
                :checked="selectedConversations.includes(conversation.id)"
                @change="toggleConversation(conversation.id)"
                class="w-5 h-5 text-cyan-600 bg-white border-gray-300 rounded focus:ring-cyan-500 cursor-pointer flex-shrink-0"
              />

              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
                  {{ conversation.visitor_name?.charAt(0).toUpperCase() || 'V' }}
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="font-bold text-gray-900 truncate">{{ conversation.visitor_name || 'Anonymous Visitor' }}</h3>
                  <p class="text-sm text-gray-500 truncate">{{ conversation.visitor_email || 'No email' }}</p>
                </div>
              </div>
            </div>

            <!-- Stats -->
            <div class="flex items-center gap-6 mx-6">
              <div class="text-center">
                <p class="text-2xl font-bold text-cyan-600">{{ conversation.messages_count || 0 }}</p>
                <p class="text-xs text-gray-500 font-semibold">Messages</p>
              </div>

              <div class="text-center">
                <span
                  :class="{
                    'bg-green-100 text-green-800': conversation.status === 'open',
                    'bg-gray-100 text-gray-800': conversation.status === 'closed',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ conversation.status }}
                </span>
              </div>

              <div class="text-center">
                <p class="text-xs text-gray-500 font-semibold">Created</p>
                <p class="text-sm font-bold text-gray-900">{{ formatDate(conversation.created_at) }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <Link
                :href="`/admin/conversations/${conversation.id}`"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                View Details
              </Link>

              <button
                @click="deleteConversation(conversation.id)"
                :disabled="isDeleting"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-12 text-center">
      <div class="max-w-md mx-auto">
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        </div>
        <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Conversations Found</h3>
        <p class="text-sm sm:text-base text-gray-500">This user hasn't started any conversations yet.</p>
      </div>
    </div>

    <!-- Delete Progress Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showDeleteModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm"
          @click.self="() => {}"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div class="p-4 sm:p-6 bg-gradient-to-r from-red-500 to-rose-600">
              <div class="flex items-center gap-2 sm:gap-3">
                <div class="p-2 sm:p-2.5 bg-white/20 rounded-xl backdrop-blur-sm flex-shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <h3 class="text-lg sm:text-xl font-bold text-white">Deleting Conversations</h3>
                  <p class="text-red-100 text-xs sm:text-sm">Please wait...</p>
                </div>
              </div>
            </div>

            <div class="p-4 sm:p-8">
              <!-- Progress Bar -->
              <div class="mb-3 sm:mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs sm:text-sm font-semibold text-gray-700">Progress</span>
                  <span class="text-xl sm:text-2xl font-bold text-cyan-600">{{ deleteProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden shadow-inner">
                  <div
                    class="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-300 ease-out flex items-center justify-end px-2"
                    :style="{ width: deleteProgress + '%' }"
                  >
                    <div v-if="deleteProgress > 10" class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Status Message -->
              <div class="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                <p class="text-xs sm:text-sm text-gray-600 text-center">
                  {{ deleteStatusMessage }}
                </p>
              </div>

              <!-- Processing Details -->
              <div v-if="deleteProgress > 0" class="mt-3 sm:mt-4 text-center">
                <p class="text-xs text-gray-500">
                  Deleted {{ Math.floor((deleteProgress / 100) * deleteTotal) }} of {{ deleteTotal }} conversations
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import axios from 'axios';

const props = defineProps({
  user: Object,
  conversations: Array,
});

// Refs
const selectedConversations = ref([]);
const isDeleting = ref(false);
const showDeleteModal = ref(false);
const deleteProgress = ref(0);
const deleteStatusMessage = ref('');
const deleteTotal = ref(0);

// Computed
const allSelected = computed(() => {
  return props.conversations.length > 0 && selectedConversations.value.length === props.conversations.length;
});

// Methods
const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedConversations.value = [];
  } else {
    selectedConversations.value = props.conversations.map(c => c.id);
  }
};

const toggleConversation = (id) => {
  const index = selectedConversations.value.indexOf(id);
  if (index > -1) {
    selectedConversations.value.splice(index, 1);
  } else {
    selectedConversations.value.push(id);
  }
};

const deleteConversation = async (id) => {
  if (!confirm('Are you sure you want to delete this conversation? This will permanently delete all messages and associated files from Backblaze B2.')) {
    return;
  }

  deleteTotal.value = 1;
  showDeleteModal.value = true;
  isDeleting.value = true;
  deleteProgress.value = 0;
  deleteStatusMessage.value = 'Preparing to delete conversation...';

  // Smooth progress animation
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    if (currentProgress < 80) {
      currentProgress += 5;
      deleteProgress.value = currentProgress;
      if (currentProgress < 30) {
        deleteStatusMessage.value = 'Preparing to delete conversation...';
      } else if (currentProgress < 60) {
        deleteStatusMessage.value = 'Deleting messages from database...';
      } else {
        deleteStatusMessage.value = 'Deleting files from Backblaze B2...';
      }
    }
  }, 200);

  try {
    const response = await axios.delete(`/admin/users/${props.user.id}/conversations/${id}`);

    clearInterval(progressInterval);
    deleteProgress.value = 100;
    deleteStatusMessage.value = 'Conversation deleted successfully!';

    setTimeout(() => {
      showDeleteModal.value = false;
      router.reload({ only: ['conversations'] });
    }, 1500);
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Failed to delete conversation:', error);
    alert('Failed to delete conversation. Please try again.');
    showDeleteModal.value = false;
  } finally {
    isDeleting.value = false;
  }
};

const bulkDelete = async () => {
  if (selectedConversations.value.length === 0) return;

  if (!confirm(`Are you sure you want to delete ${selectedConversations.value.length} conversation(s)? This will permanently delete all messages and associated files from Backblaze B2.`)) {
    return;
  }

  deleteTotal.value = selectedConversations.value.length;
  showDeleteModal.value = true;
  isDeleting.value = true;
  deleteProgress.value = 0;
  deleteStatusMessage.value = 'Preparing to delete conversations...';

  // Start progress animation BEFORE API call
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    if (currentProgress < 80) {
      currentProgress += 8;
      deleteProgress.value = currentProgress;
      const deletedCount = Math.floor((currentProgress / 100) * deleteTotal.value);
      if (currentProgress < 30) {
        deleteStatusMessage.value = 'Preparing to delete conversations...';
      } else if (currentProgress < 60) {
        deleteStatusMessage.value = `Deleting messages from database... (${deletedCount}/${deleteTotal.value})`;
      } else {
        deleteStatusMessage.value = `Deleting files from Backblaze B2... (${deletedCount}/${deleteTotal.value})`;
      }
    }
  }, 250);

  try {
    await axios.post(`/admin/users/${props.user.id}/conversations/bulk-delete`, {
      conversation_ids: selectedConversations.value
    });

    clearInterval(progressInterval);
    deleteProgress.value = 100;
    deleteStatusMessage.value = 'All conversations deleted successfully!';

    setTimeout(() => {
      showDeleteModal.value = false;
      selectedConversations.value = [];
      router.reload({ only: ['conversations'] });
    }, 1500);
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Failed to delete conversations:', error);
    alert('Failed to delete conversations. Please try again.');
    showDeleteModal.value = false;
  } finally {
    isDeleting.value = false;
  }
};

const deleteAll = async () => {
  if (props.conversations.length === 0) return;

  if (!confirm(`Are you sure you want to delete ALL ${props.conversations.length} conversations? This action cannot be undone and will permanently delete all messages and files from Backblaze B2.`)) {
    return;
  }

  deleteTotal.value = props.conversations.length;
  showDeleteModal.value = true;
  isDeleting.value = true;
  deleteProgress.value = 0;
  deleteStatusMessage.value = 'Preparing to delete all conversations...';

  // Start progress animation BEFORE API call
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    if (currentProgress < 80) {
      currentProgress += 5;
      deleteProgress.value = currentProgress;
      const deletedCount = Math.floor((currentProgress / 100) * deleteTotal.value);
      if (currentProgress < 30) {
        deleteStatusMessage.value = 'Preparing to delete all conversations...';
      } else if (currentProgress < 60) {
        deleteStatusMessage.value = `Deleting messages from database... (${deletedCount}/${deleteTotal.value})`;
      } else {
        deleteStatusMessage.value = `Deleting files from Backblaze B2... (${deletedCount}/${deleteTotal.value})`;
      }
    }
  }, 350);

  try {
    const allIds = props.conversations.map(c => c.id);

    await axios.post(`/admin/users/${props.user.id}/conversations/bulk-delete`, {
      conversation_ids: allIds
    });

    clearInterval(progressInterval);
    deleteProgress.value = 100;
    deleteStatusMessage.value = 'All conversations deleted successfully!';

    setTimeout(() => {
      showDeleteModal.value = false;
      selectedConversations.value = [];
      router.reload({ only: ['conversations'] });
    }, 1500);
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Failed to delete all conversations:', error);
    alert('Failed to delete conversations. Please try again.');
    showDeleteModal.value = false;
  } finally {
    isDeleting.value = false;
  }
};
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* Checkbox custom styling */
input[type="checkbox"]:checked {
  background-color: #06b6d4;
  border-color: #06b6d4;
}
</style>
