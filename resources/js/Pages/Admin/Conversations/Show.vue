<template>
  <AdminLayout title="Conversation">
    <!-- Chat Container -->
    <div class="flex flex-col h-[calc(100vh-200px)] bg-white rounded-2xl shadow-lg overflow-hidden">

      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between border-b border-gray-700 shadow-lg">
        <div class="flex items-center gap-4 min-w-0 flex-1">
          <!-- Back Button -->
          <Link href="/admin/conversations" class="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </Link>

          <!-- Visitor Avatar & Info -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
              {{ conversation.visitor_name?.charAt(0).toUpperCase() || 'V' }}
            </div>
            <div class="min-w-0 flex-1">
              <h2 class="text-white font-bold text-lg truncate">{{ conversation.visitor_name || 'Anonymous Visitor' }}</h2>
              <p class="text-gray-300 text-xs flex items-center gap-2">
                <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                <span class="truncate">{{ isTyping ? 'Typing...' : (conversation.status === 'open' ? 'Online' : 'Offline') }}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Visitor Info Button -->
          <button
            @click="showVisitorInfoModal = true"
            class="p-2.5 hover:bg-white/10 rounded-lg transition-colors group flex-shrink-0"
            title="Visitor Information"
          >
            <svg class="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </button>

          <!-- Agent/Widget Owner Info Button -->
          <button
            @click="showAgentInfoModal = true"
            class="p-2.5 hover:bg-white/10 rounded-lg transition-colors group flex-shrink-0"
            title="Widget Owner Info"
          >
            <svg class="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
            </svg>
          </button>

          <!-- More Options -->
          <button
            @click="showMenu = !showMenu"
            class="p-2.5 hover:bg-white/10 rounded-lg transition-colors relative flex-shrink-0"
            title="More Options"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>

            <!-- Dropdown Menu -->
            <div
              v-if="showMenu"
              class="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-2xl py-2 z-50"
              @click.stop
            >
              <button
                v-if="conversation.status === 'open'"
                @click="closeConversation"
                :disabled="isClosing"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 transition-colors"
              >
                <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                {{ isClosing ? 'Closing...' : 'Close Conversation' }}
              </button>
              <button
                v-else
                @click="reopenConversation"
                :disabled="isReopening"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm font-medium text-gray-700 transition-colors"
              >
                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ isReopening ? 'Reopening...' : 'Reopen Conversation' }}
              </button>
            </div>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col-reverse"
        style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%239C92AC&quot; fill-opacity=&quot;0.03&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        @scroll="handleScroll"
      >
        <!-- Messages -->
        <div class="space-y-4 flex flex-col-reverse">
          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex gap-3',
              message.sender_type === 'agent' ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- Visitor/Bot Avatar (left side) -->
            <div
              v-if="message.sender_type !== 'agent'"
              class="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-md"
              :class="message.sender_type === 'bot' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'"
            >
              {{ message.sender_type === 'bot' ? 'AI' : (message.sender_type === 'system' ? 'S' : conversation.visitor_name?.charAt(0).toUpperCase() || 'V') }}
            </div>

            <!-- Message Bubble -->
            <div
              :class="[
                'max-w-[70%] rounded-2xl px-4 py-3 shadow-md relative',
                message.sender_type === 'agent'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-sm'
                  : message.sender_type === 'system'
                  ? 'bg-amber-100 text-amber-900 text-center mx-auto max-w-md'
                  : 'bg-white text-gray-900 rounded-bl-sm'
              ]"
            >
              <!-- File/Image Attachment -->
              <div v-if="message.file_url || message.attachment_url" class="mb-2">
                <a
                  :href="message.file_url || message.attachment_url"
                  target="_blank"
                  class="block hover:opacity-80 transition-opacity"
                >
                  <img
                    v-if="isImage(message.file_url || message.attachment_url)"
                    :src="message.file_url || message.attachment_url"
                    class="rounded-lg max-w-full h-auto max-h-64 object-cover"
                    alt="Attachment"
                  />
                  <div v-else class="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                    </svg>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{{ message.file_name || message.attachment_name || 'File' }}</p>
                      <p class="text-xs opacity-75">Click to download</p>
                    </div>
                  </div>
                </a>
              </div>

              <!-- Message Content -->
              <p v-if="message.content" class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>

              <!-- Timestamp -->
              <span
                :class="[
                  'text-xs mt-1 block text-right',
                  message.sender_type === 'agent' ? 'text-blue-200' : message.sender_type === 'system' ? 'text-amber-600' : 'text-gray-500'
                ]"
              >
                {{ formatTime(message.created_at) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMore && !loadingMore" class="text-center mt-6">
          <button
            @click="loadMoreMessages"
            class="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:shadow-lg hover:bg-blue-50 transition-all duration-300 flex items-center gap-2 mx-auto border border-blue-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Load Earlier Messages
          </button>
        </div>

        <div v-if="loadingMore" class="text-center mt-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md">
            <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-medium text-gray-600">Loading...</span>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="border-t border-gray-200 p-4 bg-white">
        <form @submit.prevent="sendMessage" class="flex items-end gap-3">
          <!-- Attachment Button -->
          <button
            type="button"
            class="p-3 text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
            title="Attach file"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>

          <!-- Message Input -->
          <div class="flex-1 relative">
            <textarea
              v-model="newMessage"
              @keydown.enter.exact.prevent="sendMessage"
              @input="handleTyping"
              placeholder="Type a message..."
              rows="1"
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
              style="min-height: 48px;"
            ></textarea>
            <!-- Emoji Button -->
            <button
              type="button"
              class="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 transition-colors"
              title="Add emoji"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>

          <!-- Send Button -->
          <button
            type="submit"
            :disabled="!newMessage.trim() || isSending"
            class="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0 shadow-lg hover:shadow-xl"
            title="Send message"
          >
            <svg v-if="!isSending" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
            <svg v-else class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>
      </div>
    </div>

    <!-- Visitor Info Modal -->
    <VisitorInfoModal
      v-model:show="showVisitorInfoModal"
      :conversation="conversation"
    />

    <!-- Agent/Widget Owner Info Modal -->
    <AgentInfoModal
      v-model:show="showAgentInfoModal"
      :conversation="conversation"
    />
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import VisitorInfoModal from '@/Components/VisitorInfoModal.vue';
import AgentInfoModal from '@/Components/AgentInfoModal.vue';
import axios from 'axios';

const props = defineProps({
  conversation: Object,
  initialMessages: Array,
  hasMore: Boolean,
  oldestMessageId: Number,
});

// Refs
const messages = ref([...props.initialMessages]);
const newMessage = ref('');
const isSending = ref(false);
const isTyping = ref(false);
const messagesContainer = ref(null);
const showMenu = ref(false);
const isClosing = ref(false);
const isReopening = ref(false);
const showVisitorInfoModal = ref(false);
const showAgentInfoModal = ref(false);
const hasMore = ref(props.hasMore);
const oldestMessageId = ref(props.oldestMessageId);
const loadingMore = ref(false);
const typingTimeout = ref(null);

// Auto-scroll to bottom
const scrollToBottom = (smooth = true) => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  });
};

// Load more messages
const loadMoreMessages = async () => {
  if (!hasMore.value || loadingMore.value) return;

  loadingMore.value = true;
  const scrollHeightBefore = messagesContainer.value?.scrollHeight || 0;

  try {
    const response = await axios.get(`/admin/conversations/${props.conversation.id}/messages`, {
      params: {
        before_id: oldestMessageId.value,
        limit: 20
      }
    });

    if (response.data.status === 'success') {
      const olderMessages = response.data.messages || [];
      messages.value = [...olderMessages, ...messages.value];
      hasMore.value = response.data.has_more || false;
      oldestMessageId.value = response.data.oldest_message_id || null;

      // Maintain scroll position
      nextTick(() => {
        if (messagesContainer.value) {
          const scrollHeightAfter = messagesContainer.value.scrollHeight;
          messagesContainer.value.scrollTop = scrollHeightAfter - scrollHeightBefore;
        }
      });
    }
  } catch (error) {
    console.error('Failed to load more messages:', error);
  } finally {
    loadingMore.value = false;
  }
};

const handleScroll = () => {
  if (!messagesContainer.value) return;
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value;
  if (Math.abs(scrollTop) + clientHeight >= scrollHeight - 100 && hasMore.value && !loadingMore.value) {
    loadMoreMessages();
  }
};

// Send message
const sendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return;

  const content = newMessage.value.trim();
  newMessage.value = '';
  isSending.value = true;

  try {
    const response = await axios.post(`/admin/conversations/${props.conversation.id}/messages`, {
      content
    });

    if (response.data.status === 'success' && response.data.data) {
      messages.value.push(response.data.data);
      scrollToBottom();
    }
  } catch (error) {
    console.error('Failed to send message:', error);
    newMessage.value = content;
  } finally {
    isSending.value = false;
  }
};

// Handle typing
const handleTyping = () => {
  // Send typing indicator to backend
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }

  typingTimeout.value = setTimeout(() => {
    // Stop typing indicator
  }, 1000);
};

// Close conversation
const closeConversation = async () => {
  if (isClosing.value) return;

  isClosing.value = true;
  showMenu.value = false;

  try {
    await axios.post(`/admin/conversations/${props.conversation.id}/close`);
    router.reload({ only: ['conversation'] });
  } catch (error) {
    console.error('Failed to close conversation:', error);
  } finally {
    isClosing.value = false;
  }
};

// Reopen conversation
const reopenConversation = async () => {
  if (isReopening.value) return;

  isReopening.value = true;
  showMenu.value = false;

  try {
    await axios.post(`/admin/conversations/${props.conversation.id}/reopen`);
    router.reload({ only: ['conversation'] });
  } catch (error) {
    console.error('Failed to reopen conversation:', error);
  } finally {
    isReopening.value = false;
  }
};

// Format time
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Check if URL is an image
const isImage = (url) => {
  if (!url) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = url.split('.').pop().toLowerCase();
  return imageExtensions.includes(extension);
};

// Close menu when clicking outside
const handleClickOutside = (e) => {
  if (showMenu.value && !e.target.closest('button')) {
    showMenu.value = false;
  }
};

onMounted(() => {
  scrollToBottom(false);
  document.addEventListener('click', handleClickOutside);

  // TODO: Initialize Pusher for real-time messages
  // Listen for new messages and typing indicators
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
});
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Textarea auto-grow */
textarea {
  field-sizing: content;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
