<template>
  <AdminLayout title="Conversations">
    <!-- Stats Cards -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Overview</h3>
            <p class="text-sm text-gray-600">Conversation statistics</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.total.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Open</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.open.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Closed</div>
            <div class="text-2xl font-bold text-gray-600">{{ stats.closed.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">New Messages</div>
            <div class="text-2xl font-bold text-red-600">{{ stats.new.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 class="text-lg font-bold text-gray-900">Conversations</h3>
          <input
            v-model="searchQuery"
            @input="filterConversations"
            type="search"
            placeholder="Search..."
            class="w-full sm:w-auto px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visitor</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Widget</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Created</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="conversation in filteredConversations" :key="conversation.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {{ (conversation.visitor_name || 'A').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ conversation.visitor_name || 'Anonymous' }}</p>
                    <p class="text-xs text-gray-600 truncate">{{ conversation.visitor_email || 'No email' }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 hidden lg:table-cell">
                <div v-if="conversation.widget">
                  <p class="text-sm font-medium text-gray-900">{{ conversation.widget.name || 'Unknown' }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ conversation.widget.domain || 'No domain' }}</p>
                </div>
                <span v-else class="text-sm text-gray-500">-</span>
              </td>
              <td class="px-4 sm:px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit',
                    conversation.status === 'open' ? 'bg-green-100 text-green-700' :
                    conversation.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  ]">
                    {{ conversation.status }}
                  </span>
                  <span v-if="conversation.has_new_messages" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 w-fit">
                    New
                  </span>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                {{ formatDate(conversation.created_at) }}
              </td>
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center justify-end gap-1">
                  <Link
                    :href="`/admin/conversations/${conversation.id}`"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </Link>
                </div>
              </td>
            </tr>
            <tr v-if="filteredConversations.length === 0">
              <td colspan="5" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <p class="text-gray-500 font-medium">{{ searchQuery ? 'No matching conversations' : 'No conversations yet' }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="text-sm text-gray-600">
            Showing <span class="font-semibold text-gray-900">{{ conversations.from || 0 }}</span> to <span class="font-semibold text-gray-900">{{ conversations.to || 0 }}</span> of <span class="font-semibold text-gray-900">{{ conversations.total }}</span>
          </div>
          <div class="flex gap-2">
            <Link
              v-if="conversations.prev_page_url"
              :href="conversations.prev_page_url"
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700"
            >
              Previous
            </Link>
            <Link
              v-if="conversations.next_page_url"
              :href="conversations.next_page_url"
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
  conversations: Object,
  stats: Object,
});

const searchQuery = ref('');

// Filtered conversations based on search
const filteredConversations = computed(() => {
  if (!searchQuery.value) {
    return props.conversations.data;
  }

  const query = searchQuery.value.toLowerCase();
  return props.conversations.data.filter(conversation => {
    return (conversation.visitor_name && conversation.visitor_name.toLowerCase().includes(query)) ||
           (conversation.visitor_email && conversation.visitor_email.toLowerCase().includes(query)) ||
           (conversation.widget && conversation.widget.name && conversation.widget.name.toLowerCase().includes(query)) ||
           conversation.id.toString().includes(query);
  });
});

const filterConversations = () => {
  // Trigger reactivity
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
</script>
