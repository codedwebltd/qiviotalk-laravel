<template>
  <AdminLayout :title="`User Details - ${user.name}`">
    <!-- Back Button -->
    <div class="mb-6">
      <Link
        href="/admin/users"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Users
      </Link>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - User Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- User Overview Card -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-purple-600">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {{ getUserInitials(user.name) }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold text-white mb-1">{{ user.name }}</h2>
                  <p class="text-blue-100 text-sm">{{ user.email }}</p>
                </div>
              </div>
              <span
                v-if="user.role === 1"
                class="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold"
              >
                ADMIN
              </span>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- User ID -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">User ID</label>
                <p class="text-sm font-bold text-gray-900">#{{ user.id }}</p>
              </div>

              <!-- Referral Code -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Referral Code</label>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-mono font-bold text-gray-900">{{ user.referral_code || 'N/A' }}</p>
                  <button
                    v-if="user.referral_code"
                    @click="copyToClipboard(user.referral_code)"
                    class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy referral code"
                  >
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Status -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                <span
                  :class="{
                    'bg-green-100 text-green-800': user.status === 'active',
                    'bg-red-100 text-red-800': user.status === 'inactive',
                  }"
                  class="px-4 py-2 rounded-full text-sm font-bold uppercase inline-flex items-center gap-2"
                >
                  <span
                    :class="{
                      'bg-green-500': user.status === 'active',
                      'bg-red-500': user.status === 'inactive',
                    }"
                    class="w-2.5 h-2.5 rounded-full"
                  ></span>
                  {{ user.status }}
                </span>
              </div>

              <!-- Role -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Role</label>
                <span class="text-sm font-bold text-gray-900">{{ user.role === 1 ? 'Admin' : 'User' }}</span>
              </div>

              <!-- Created At -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Member Since</label>
                <p class="text-sm text-gray-900">{{ formatDate(user.created_at) }}</p>
              </div>

              <!-- Last Login -->
              <div v-if="user.last_login_at">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Last Login</label>
                <p class="text-sm text-gray-900">{{ formatDate(user.last_login_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Wallet Card -->
        <div
          v-if="user.wallet"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-emerald-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Wallet Information</h2>
                <p class="text-emerald-100 text-sm">User wallet details</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Balance</label>
                <p class="text-2xl font-bold text-emerald-600">${{ user.wallet.balance }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Currency</label>
                <p class="text-sm text-gray-900">{{ user.wallet.currency }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                <span
                  :class="user.wallet.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ user.wallet.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Card -->
        <div
          v-if="user.subscription"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Subscription Plan</h2>
                <p class="text-purple-100 text-sm">Current subscription details</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Plan Name</label>
                <p class="text-sm font-bold text-gray-900">{{ user.subscription.name }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                <p class="text-sm font-bold text-gray-900">${{ user.subscription.price }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Membership Type</label>
                <p class="text-sm text-gray-900 capitalize">{{ user.membership_type || 'N/A' }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Expires At</label>
                <p class="text-sm text-gray-900">{{ formatDate(user.membership_expires_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Widget Card -->
        <div
          v-if="user.widget"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-indigo-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Widget Information</h2>
                <p class="text-indigo-100 text-sm">Widget configuration</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Widget Name</label>
                <p class="text-sm font-bold text-gray-900">{{ user.widget.name }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Widget Key</label>
                <p class="text-sm font-mono text-gray-900">{{ user.widget.widget_key?.substring(0, 16) }}...</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                <span
                  :class="{
                    'bg-green-100 text-green-800': user.widget.widget_status === 'active',
                    'bg-orange-100 text-orange-800': user.widget.widget_status === 'suspended',
                    'bg-gray-100 text-gray-800': user.widget.widget_status === 'deactivated',
                    'bg-red-100 text-red-800': user.widget.widget_status === 'fraudulent',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ user.widget.widget_status }}
                </span>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Position</label>
                <p class="text-sm text-gray-900 capitalize">{{ user.widget.position }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - Stats & Actions -->
      <div class="space-y-6">
        <!-- Statistics Card -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-amber-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">User Statistics</h2>
                <p class="text-amber-100 text-sm">Activity overview</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-semibold text-gray-700">Transactions</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ user.transactions_count || 0 }}</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-purple-100 rounded-lg">
                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-semibold text-gray-700">Widgets</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ user.widgets_count || 0 }}</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-semibold text-gray-700">Conversations</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ user.conversations_count || 0 }}</span>
              </div>

              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-orange-100 rounded-lg">
                    <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                  </div>
                  <span class="text-sm font-semibold text-gray-700">Referrals</span>
                </div>
                <span class="text-lg font-bold text-gray-900">{{ user.referrals_count || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-rose-500 to-rose-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Quick Actions</h2>
                <p class="text-rose-100 text-sm">Manage user account</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-3">
            <Link
              href="/admin/users"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              Edit User Details
            </Link>

            <Link
              :href="`/admin/users/${user.id}/conversations`"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
              Manage Conversations
            </Link>

            <button
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
              Manage Wallet
            </button>

            <button
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              Change Subscription
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
  user: Object,
});

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

const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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
