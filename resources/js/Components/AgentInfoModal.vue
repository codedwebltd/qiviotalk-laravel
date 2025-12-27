<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
        <div class="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="close"></div>

          <!-- Modal -->
          <div class="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-3xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-6 text-white flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                    {{ widgetOwner?.name?.charAt(0).toUpperCase() || 'A' }}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold">{{ widgetOwner?.name || 'Widget Owner' }}</h3>
                    <p class="text-emerald-100 text-sm">Agent Information & Activity</p>
                  </div>
                </div>
                <button @click="close" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content - Scrollable -->
            <div class="flex-1 overflow-y-auto">
              <div class="p-6 space-y-6">
                <!-- Profile Section -->
                <div class="text-center pb-6 border-b border-gray-200">
                  <p v-if="widgetOwner?.email" class="text-gray-600 text-sm mb-2">{{ widgetOwner.email }}</p>
                  <div class="flex items-center justify-center gap-2 mt-3">
                    <span :class="[
                      'px-3 py-1.5 rounded-full text-xs font-bold',
                      widgetOwner?.subscription?.plan_name === 'Pro' || widgetOwner?.subscription?.plan_name === 'Premium'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700'
                    ]">
                      {{ widgetOwner?.subscription?.plan_name || 'Free' }}
                    </span>
                    <span :class="[
                      'px-3 py-1.5 rounded-full text-xs font-bold',
                      widgetOwner?.subscription?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    ]">
                      {{ widgetOwner?.subscription?.status || 'Inactive' }}
                    </span>
                  </div>
                </div>

                <!-- Account Information -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    Account Information
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Full Name</p>
                      <p class="text-sm font-semibold text-gray-900">{{ widgetOwner?.name || 'Not provided' }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Email</p>
                      <p class="text-sm font-semibold text-gray-900">{{ widgetOwner?.email || 'Not provided' }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">User ID</p>
                      <p class="text-sm font-semibold text-gray-900 font-mono">#{{ widgetOwner?.id }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Member Since</p>
                      <p class="text-sm font-semibold text-gray-900">{{ formatDate(widgetOwner?.created_at) }}</p>
                    </div>
                  </div>
                </div>

                <!-- Widget Information -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-purple-100 rounded-lg">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                      </svg>
                    </div>
                    Current Widget
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Widget Name</p>
                      <p class="text-sm font-semibold text-gray-900">{{ conversation.widget?.name || 'N/A' }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Widget ID</p>
                      <p class="text-sm font-semibold text-gray-900 font-mono">#{{ conversation.widget_id }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Domain</p>
                      <a
                        v-if="conversation.widget?.domain"
                        :href="`https://${conversation.widget.domain}`"
                        target="_blank"
                        class="text-sm font-semibold text-blue-600 hover:underline truncate block"
                      >
                        {{ conversation.widget.domain }}
                      </a>
                      <p v-else class="text-sm font-semibold text-gray-900">Not configured</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Widget Status</p>
                      <span :class="[
                        'inline-block px-3 py-1 rounded-full text-xs font-bold',
                        conversation.widget?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      ]">
                        {{ conversation.widget?.status || 'Unknown' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Activity Statistics -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-amber-100 rounded-lg">
                      <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    Activity & Statistics
                  </h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      label="Total Widgets"
                      :value="widgetOwner?.stats?.total_widgets || 0"
                      color="blue"
                    />
                    <StatCard
                      label="Conversations"
                      :value="widgetOwner?.stats?.total_conversations || 0"
                      color="green"
                    />
                    <StatCard
                      label="Messages"
                      :value="widgetOwner?.stats?.total_messages || 0"
                      color="purple"
                    />
                    <StatCard
                      label="Active Chats"
                      :value="widgetOwner?.stats?.active_conversations || 0"
                      color="orange"
                    />
                  </div>
                </div>

                <!-- Recent Activity -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-teal-100 rounded-lg">
                      <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    Recent Activity
                  </h4>
                  <div class="space-y-3">
                    <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div class="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Last Login</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(widgetOwner?.last_login_at) || 'Never' }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div class="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Account Created</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(widgetOwner?.created_at) }}</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div class="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">Last Message Sent</p>
                        <p class="text-xs text-gray-500 mt-0.5">{{ formatDate(widgetOwner?.last_message_at) || 'No messages yet' }}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Subscription Details -->
                <div v-if="widgetOwner?.subscription" class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-pink-100 rounded-lg">
                      <svg class="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                      </svg>
                    </div>
                    Subscription Details
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Plan</p>
                      <p class="text-sm font-semibold text-gray-900">{{ widgetOwner.subscription.plan_name || 'Free' }}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Status</p>
                      <span :class="[
                        'inline-block px-3 py-1 rounded-full text-xs font-bold',
                        widgetOwner.subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      ]">
                        {{ widgetOwner.subscription.status }}
                      </span>
                    </div>
                    <div v-if="widgetOwner.subscription.expires_at" class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Expires</p>
                      <p class="text-sm font-semibold text-gray-900">{{ formatDate(widgetOwner.subscription.expires_at) }}</p>
                    </div>
                    <div v-if="widgetOwner.subscription.price" class="bg-gray-50 p-4 rounded-lg">
                      <p class="text-xs text-gray-600 mb-1.5 font-medium">Price</p>
                      <p class="text-sm font-semibold text-gray-900">${{ widgetOwner.subscription.price }}/{{ widgetOwner.subscription.interval || 'month' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-between flex-shrink-0">
              <button @click="close" class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Close
              </button>
              <a
                v-if="widgetOwner?.id"
                :href="`/admin/users/${widgetOwner.id}`"
                class="px-6 py-2.5 text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium"
              >
                View Full Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  conversation: Object,
});

const emit = defineEmits(['update:show']);

const widgetOwner = computed(() => {
  const owner = props.conversation?.widget?.user || props.conversation?.user || {};
  console.log('AgentInfoModal widgetOwner:', owner);
  console.log('AgentInfoModal conversation:', props.conversation);
  return owner;
});

const close = () => {
  emit('update:show', false);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<script>
// Stat Card Component
export const StatCard = {
  props: {
    label: String,
    value: [Number, String],
    color: String,
  },
  computed: {
    colorClasses() {
      const colors = {
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
        purple: 'bg-purple-100 text-purple-700',
        orange: 'bg-orange-100 text-orange-700',
        red: 'bg-red-100 text-red-700',
      };
      return colors[this.color] || colors.blue;
    },
  },
  template: `
    <div class="bg-gray-50 p-4 rounded-lg text-center">
      <p :class="colorClasses" class="text-2xl font-bold mb-1">{{ value }}</p>
      <p class="text-xs text-gray-600 font-medium">{{ label }}</p>
    </div>
  `,
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
</style>
