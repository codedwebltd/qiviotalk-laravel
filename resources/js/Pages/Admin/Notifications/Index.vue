<template>
  <AdminLayout title="Notifications">
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- Total Notifications -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Total</p>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats.total.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Unread -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Unread</p>
              <h3 class="text-2xl font-bold text-red-600">{{ stats.unread.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Read -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Read</p>
              <h3 class="text-2xl font-bold text-green-600">{{ stats.read.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <button
            @click="filterBy = 'all'"
            :class="filterBy === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
          >
            All
          </button>
          <button
            @click="filterBy = 'unread'"
            :class="filterBy === 'unread' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
          >
            Unread
          </button>
          <button
            @click="filterBy = 'read'"
            :class="filterBy === 'read' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-4 py-2 rounded-xl font-semibold text-sm transition-colors"
          >
            Read
          </button>
        </div>

        <button
          v-if="stats.unread > 0"
          @click="markAllAsRead"
          :disabled="processing"
          class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Mark All as Read
        </button>
      </div>
    </div>

    <!-- Notifications List -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-white">Your Notifications</h2>
            <p class="text-purple-100 text-sm">Stay updated with latest activities</p>
          </div>
        </div>
      </div>

      <div class="divide-y divide-gray-200">
        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          @click="openNotificationModal(notification)"
          :class="{
            'bg-blue-50/50 hover:bg-blue-50': !notification.read_at,
            'bg-white hover:bg-gray-50': notification.read_at,
          }"
          class="p-6 cursor-pointer transition-all duration-200 group"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              :class="getIconClass(notification)"
              class="p-3 rounded-xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200"
            >
              <component :is="getNotificationIcon(notification)" class="w-6 h-6 text-white" />
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-2">
                <h3 class="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {{ notification.data?.title || 'Notification' }}
                </h3>
                <span
                  v-if="!notification.read_at"
                  class="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"
                  title="Unread"
                ></span>
              </div>

              <p class="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                {{ notification.data?.message || notification.data?.body || 'No message' }}
              </p>

              <!-- Metadata -->
              <div class="flex items-center gap-4 text-xs">
                <span class="flex items-center gap-1.5 text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="font-medium">{{ formatDate(notification.created_at) }}</span>
                </span>
                <span
                  v-if="notification.read_at"
                  class="flex items-center gap-1.5 text-green-600 font-semibold"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Read
                </span>
              </div>

              <!-- Action Button (if link exists) -->
              <div v-if="notification.data?.link" class="mt-3">
                <Link
                  :href="notification.data.link"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold"
                >
                  View Details
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>

            <!-- Delete Button -->
            <button
              @click.stop="deleteNotification(notification)"
              class="flex-shrink-0 p-2.5 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
              title="Delete notification"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredNotifications.length === 0" class="text-center py-20 px-4">
          <div class="inline-flex p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner mb-6">
            <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
          </div>
          <h3 class="text-gray-700 text-xl font-bold mb-2">No notifications found</h3>
          <p class="text-gray-500 text-sm">You're all caught up! Check back later for updates.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="notifications.data && notifications.data.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ notifications.from }} to {{ notifications.to }} of {{ notifications.total }} notifications
          </div>
          <div class="flex gap-2">
            <Link
              v-for="link in notifications.links"
              :key="link.label"
              :href="link.url"
              :class="{
                'bg-blue-600 text-white': link.active,
                'bg-white text-gray-700 hover:bg-gray-100': !link.active,
                'opacity-50 cursor-not-allowed': !link.url,
              }"
              class="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 transition-colors"
              v-html="link.label"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showModal && selectedNotification"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto"
        @click.self="closeModal"
      >
        <div class="min-h-screen px-4 py-8 flex items-center justify-center">
          <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-scale-in flex flex-col">
            <!-- Modal Header -->
            <div
              :class="getHeaderClass(selectedNotification)"
              class="p-6 flex items-start gap-4"
            >
            <div class="flex-1 min-w-0">
              <div class="flex items-start gap-3 mb-2">
                <component :is="getNotificationIcon(selectedNotification)" class="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <h3 class="text-xl font-bold text-white break-words">
                  {{ selectedNotification.data?.title || 'Notification Details' }}
                </h3>
              </div>
              <div class="flex items-center gap-4 text-sm text-white/90">
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ formatDate(selectedNotification.created_at) }}
                </span>
                <span
                  v-if="selectedNotification.read_at"
                  class="flex items-center gap-1.5"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Read
                </span>
                <span
                  v-else
                  class="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full"
                >
                  <span class="w-2 h-2 bg-white rounded-full"></span>
                  Unread
                </span>
              </div>
            </div>
            <button
              @click="closeModal"
              class="flex-shrink-0 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Modal Body (Scrollable) -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Notification Message -->
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Message</label>
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p class="text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
                  {{ selectedNotification.data?.message || selectedNotification.data?.body || 'No message content available.' }}
                </p>
              </div>
            </div>

            <!-- Additional Data -->
            <div v-if="selectedNotification.data && Object.keys(selectedNotification.data).filter(k => !['title', 'message', 'body', 'type', 'link'].includes(k)).length > 0">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Additional Information</label>
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div class="space-y-3">
                  <div
                    v-for="(value, key) in getAdditionalData(selectedNotification.data)"
                    :key="key"
                    class="grid grid-cols-1 gap-2 py-2 border-b border-gray-200 last:border-0"
                  >
                    <span class="text-sm font-semibold text-gray-600 capitalize">{{ formatKey(key) }}:</span>
                    <span class="text-sm text-gray-900 font-medium break-words break-all overflow-wrap-anywhere">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notification Type -->
            <div>
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
              <span
                :class="{
                  'bg-blue-100 text-blue-800': getNotificationType(selectedNotification) === 'info',
                  'bg-green-100 text-green-800': getNotificationType(selectedNotification) === 'success',
                  'bg-amber-100 text-amber-800': getNotificationType(selectedNotification) === 'warning',
                  'bg-red-100 text-red-800': getNotificationType(selectedNotification) === 'error',
                  'bg-purple-100 text-purple-800': getNotificationType(selectedNotification) === 'general',
                }"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold uppercase"
              >
                <component :is="getNotificationIcon(selectedNotification)" class="w-4 h-4" />
                {{ getNotificationType(selectedNotification) }}
              </span>
            </div>

            <!-- Timestamps -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Created At</label>
                <p class="text-sm text-gray-900 font-medium">{{ formatFullDate(selectedNotification.created_at) }}</p>
              </div>
              <div v-if="selectedNotification.read_at">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Read At</label>
                <p class="text-sm text-gray-900 font-medium">{{ formatFullDate(selectedNotification.read_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-6 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-3">
            <button
              v-if="selectedNotification.data?.link"
              @click="goToLink(selectedNotification.data.link)"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <span class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                </svg>
                View Details
              </span>
            </button>
            <button
              @click="deleteNotificationFromModal"
              class="px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <span class="flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Delete
              </span>
            </button>
            <button
              @click="closeModal"
              class="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-sm"
            >
              Close
            </button>
          </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, h } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
  notifications: Object,
  stats: Object,
});

const filterBy = ref('all');
const processing = ref(false);
const showModal = ref(false);
const selectedNotification = ref(null);

const filteredNotifications = computed(() => {
  if (!props.notifications?.data) return [];

  if (filterBy.value === 'unread') {
    return props.notifications.data.filter(n => !n.read_at);
  } else if (filterBy.value === 'read') {
    return props.notifications.data.filter(n => n.read_at);
  }
  return props.notifications.data;
});

const getNotificationType = (notification) => {
  return notification.data?.type || 'general';
};

const getHeaderClass = (notification) => {
  const type = getNotificationType(notification);
  const classes = {
    'info': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'success': 'bg-gradient-to-r from-green-500 to-green-600',
    'warning': 'bg-gradient-to-r from-amber-500 to-amber-600',
    'error': 'bg-gradient-to-r from-red-500 to-red-600',
    'general': 'bg-gradient-to-r from-purple-500 to-purple-600'
  };
  return classes[type] || classes['general'];
};

const getIconClass = (notification) => {
  const type = getNotificationType(notification);
  const classes = {
    'info': 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200',
    'success': 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-200',
    'warning': 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-200',
    'error': 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-200',
    'general': 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-200'
  };
  return classes[type] || classes['general'];
};

const getNotificationIcon = (notification) => {
  const type = getNotificationType(notification);

  const icons = {
    'success': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-6 h-6' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    'error': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-6 h-6' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    'warning': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-6 h-6' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })
    ]),
    'info': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-6 h-6' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ]),
    'general': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'w-6 h-6' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' })
    ])
  };

  return icons[type] || icons['general'];
};

const formatDate = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInSeconds = Math.floor((now - notificationDate) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

const markAsRead = (notification) => {
  if (notification.read_at) return;

  router.post(`/admin/notifications/${notification.id}/mark-as-read`, {}, {
    preserveState: true,
    preserveScroll: true,
  });
};

const markAllAsRead = () => {
  if (processing.value) return;

  processing.value = true;
  router.post('/admin/notifications/mark-all-as-read', {}, {
    preserveState: true,
    preserveScroll: true,
    onFinish: () => {
      processing.value = false;
    },
  });
};

const deleteNotification = (notification) => {
  if (confirm('Are you sure you want to delete this notification?')) {
    router.delete(`/admin/notifications/${notification.id}`, {
      preserveState: true,
      preserveScroll: true,
    });
  }
};

// Modal Functions
const openNotificationModal = (notification) => {
  selectedNotification.value = notification;
  showModal.value = true;

  // Mark as read when opening modal
  if (!notification.read_at) {
    markAsRead(notification);
  }
};

const closeModal = () => {
  showModal.value = false;
  setTimeout(() => {
    selectedNotification.value = null;
  }, 300);
};

const deleteNotificationFromModal = () => {
  if (confirm('Are you sure you want to delete this notification?')) {
    router.delete(`/admin/notifications/${selectedNotification.value.id}`, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
      },
    });
  }
};

const goToLink = (link) => {
  closeModal();
  router.visit(link);
};

const formatFullDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const getAdditionalData = (data) => {
  const excluded = ['title', 'message', 'body', 'type', 'link'];
  const additional = {};

  for (const key in data) {
    if (!excluded.includes(key)) {
      additional[key] = typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key];
    }
  }

  return additional;
};

const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
</script>

<style scoped>
@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
</style>
