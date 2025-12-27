<template>
  <AdminLayout title="Dashboard">
    <!-- Welcome Banner -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Welcome back, Admin</h3>
            <p class="text-sm text-gray-600">Here's what's happening today</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Platform Overview -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Platform Overview</h3>
            <p class="text-sm text-gray-600">User statistics</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total Users</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalUsers.toLocaleString() }}</div>
            <div v-if="stats.userGrowth !== 0" class="text-xs font-medium mt-1" :class="stats.userGrowth > 0 ? 'text-green-600' : 'text-red-600'">
              {{ stats.userGrowth > 0 ? '+' : '' }}{{ stats.userGrowth }}%
            </div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Premium Members</div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.premiumMembers.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Active Chats</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.activeConversations.toLocaleString() }}</div>
            <div class="text-xs text-green-600 font-medium mt-1">Live</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Messages Today</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.messagesToday.toLocaleString() }}</div>
            <div v-if="stats.messageGrowth !== 0" class="text-xs font-medium mt-1" :class="stats.messageGrowth > 0 ? 'text-green-600' : 'text-red-600'">
              {{ stats.messageGrowth > 0 ? '+' : '' }}{{ stats.messageGrowth }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Management -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Widget Management</h3>
            <p class="text-sm text-gray-600">Widget statistics</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Active Widgets</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.activeWidgets.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Unverified</div>
            <div class="text-2xl font-bold text-orange-600">{{ stats.unverifiedWidgets.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Inactive 30+ Days</div>
            <div class="text-2xl font-bold text-yellow-600">{{ stats.inactiveWidgets.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Scheduled Deletion</div>
            <div class="text-2xl font-bold text-red-600">{{ stats.scheduledForDeletion.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Overview -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Financial Overview</h3>
            <p class="text-sm text-gray-600">Revenue statistics</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total Revenue</div>
            <div class="text-2xl font-bold text-green-600">${{ stats.totalRevenue }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Pending Refunds</div>
            <div class="text-2xl font-bold text-red-600">${{ stats.pendingRefunds }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Subscription Plans</div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.activeSubscriptions.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Stats -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">System Stats</h3>
            <p class="text-sm text-gray-600">Platform activity</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total Messages</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.totalMessages.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total Conversations</div>
            <div class="text-2xl font-bold text-indigo-600">{{ stats.totalConversations.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total Devices</div>
            <div class="text-2xl font-bold text-teal-600">{{ stats.totalDevices.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Recent Activity</h3>
            <p class="text-sm text-gray-600">Real-time platform events</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50 max-h-96 overflow-y-auto">
        <div v-if="recentActivity && recentActivity.length > 0" class="space-y-3">
          <div
            v-for="(activity, index) in recentActivity"
            :key="index"
            class="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-start gap-3">
              <!-- Icon -->
              <div
                class="flex-shrink-0 p-2 rounded-lg"
                :class="{
                  'bg-blue-100': activity.color === 'blue',
                  'bg-green-100': activity.color === 'green',
                  'bg-purple-100': activity.color === 'purple',
                  'bg-emerald-100': activity.color === 'emerald',
                  'bg-indigo-100': activity.color === 'indigo',
                  'bg-orange-100': activity.color === 'orange',
                  'bg-red-100': activity.color === 'red',
                }"
              >
                <!-- User icon -->
                <svg v-if="activity.icon === 'user'" class="w-5 h-5" :class="{
                  'text-blue-600': activity.color === 'blue',
                  'text-green-600': activity.color === 'green',
                  'text-purple-600': activity.color === 'purple',
                  'text-emerald-600': activity.color === 'emerald',
                  'text-indigo-600': activity.color === 'indigo',
                  'text-orange-600': activity.color === 'orange',
                  'text-red-600': activity.color === 'red',
                }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>

                <!-- Message icon -->
                <svg v-else-if="activity.icon === 'message'" class="w-5 h-5" :class="{
                  'text-blue-600': activity.color === 'blue',
                  'text-green-600': activity.color === 'green',
                  'text-purple-600': activity.color === 'purple',
                  'text-emerald-600': activity.color === 'emerald',
                  'text-indigo-600': activity.color === 'indigo',
                  'text-orange-600': activity.color === 'orange',
                  'text-red-600': activity.color === 'red',
                }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>

                <!-- Chat icon -->
                <svg v-else-if="activity.icon === 'chat'" class="w-5 h-5" :class="{
                  'text-blue-600': activity.color === 'blue',
                  'text-green-600': activity.color === 'green',
                  'text-purple-600': activity.color === 'purple',
                  'text-emerald-600': activity.color === 'emerald',
                  'text-indigo-600': activity.color === 'indigo',
                  'text-orange-600': activity.color === 'orange',
                  'text-red-600': activity.color === 'red',
                }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>

                <!-- Widget icon -->
                <svg v-else-if="activity.icon === 'widget'" class="w-5 h-5" :class="{
                  'text-blue-600': activity.color === 'blue',
                  'text-green-600': activity.color === 'green',
                  'text-purple-600': activity.color === 'purple',
                  'text-emerald-600': activity.color === 'emerald',
                  'text-indigo-600': activity.color === 'indigo',
                  'text-orange-600': activity.color === 'orange',
                  'text-red-600': activity.color === 'red',
                }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                </svg>

                <!-- Chat-new icon -->
                <svg v-else-if="activity.icon === 'chat-new'" class="w-5 h-5" :class="{
                  'text-blue-600': activity.color === 'blue',
                  'text-green-600': activity.color === 'green',
                  'text-purple-600': activity.color === 'purple',
                  'text-emerald-600': activity.color === 'emerald',
                  'text-indigo-600': activity.color === 'indigo',
                  'text-orange-600': activity.color === 'orange',
                  'text-red-600': activity.color === 'red',
                }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-900">{{ activity.title }}</h4>
                    <p class="text-sm text-gray-700 mt-0.5">{{ activity.description }}</p>

                    <!-- Details row -->
                    <div class="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span v-if="activity.details" class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ activity.details }}
                      </span>

                      <span v-if="activity.owner" class="flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Owner: {{ activity.owner }}
                      </span>
                    </div>

                    <!-- Message preview for widget interactions -->
                    <p v-if="activity.message_preview" class="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-200">
                      "{{ activity.message_preview }}"
                    </p>
                  </div>

                  <!-- Timestamp -->
                  <div class="flex-shrink-0 text-right">
                    <div class="text-xs text-gray-500" :title="activity.timestamp">
                      {{ activity.time }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8">
          <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="text-gray-500 text-sm">No recent activity to display</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
  stats: Object,
  recentActivity: Array,
});
</script>
