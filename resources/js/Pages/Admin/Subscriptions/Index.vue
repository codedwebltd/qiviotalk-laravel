<template>
  <AdminLayout title="Subscriptions">
    <!-- Stats Cards -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Overview</h3>
            <p class="text-sm text-gray-600">Subscription plans</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.total.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Active</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.active.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Free Tier</div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.free.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <transition name="slide-down">
      <div v-if="toast.show" :class="[
        'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 max-w-md',
        toast.type === 'success' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
      ]">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" :class="toast.type === 'success' ? 'text-green-600' : 'text-red-600'" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="toast.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            <path v-else fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <p class="text-sm font-medium" :class="toast.type === 'success' ? 'text-green-700' : 'text-red-700'">{{ toast.message }}</p>
        </div>
      </div>
    </transition>

    <!-- Subscriptions Table -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 class="text-lg font-bold text-gray-900">Subscriptions</h3>
          <div class="flex gap-2 w-full sm:w-auto">
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search plans..."
              class="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <Link
            href="/admin/subscriptions/create"
            class="px-3 py-2 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            New Plan
          </Link>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Price</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Duration</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Features</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="subscription in filteredSubscriptions" :key="subscription.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                  <div :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0',
                    subscription.is_free_tier ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                  ]">
                    {{ subscription.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ subscription.name }}</p>
                    <p v-if="subscription.is_free_tier" class="text-xs text-blue-600 font-medium">Free Plan</p>
                    <p class="text-xs text-gray-500">{{ subscription.users_count || 0 }} users</p>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 hidden lg:table-cell">
                <div class="text-sm font-semibold text-gray-900">${{ parseFloat(subscription.price).toFixed(2) }}</div>
              </td>
              <td class="px-4 sm:px-6 py-4 hidden md:table-cell">
                <div class="text-sm text-gray-900">{{ subscription.duration }}</div>
                <div v-if="subscription.duration_days" class="text-xs text-gray-500">{{ subscription.duration_days }} days</div>
              </td>
              <td class="px-4 sm:px-6 py-4">
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold',
                  subscription.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                ]">
                  {{ subscription.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-4 hidden lg:table-cell">
                <div class="text-xs text-gray-600">
                  {{ subscription.features?.length || 0 }} mobile features
                </div>
                <div class="text-xs text-gray-600">
                  {{ Object.keys(subscription.feature_limits || {}).length }} limits
                </div>
                <div class="text-xs text-gray-600">
                  {{ subscription.users_count || 0 }} users subscribed
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center justify-end gap-1">
                  <Link
                    :href="`/admin/subscriptions/${subscription.id}/edit`"
                    class="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    @click="toggleActive(subscription)"
                    :class="[
                      'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      subscription.is_active ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                    ]"
                  >
                    {{ subscription.is_active ? 'Deactivate' : 'Activate' }}
                  </button>
                  <button
                    @click="deleteSubscription(subscription)"
                    class="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="subscriptions.last_page > 1" class="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ subscriptions.from }} to {{ subscriptions.to }} of {{ subscriptions.total }} plans
          </div>
          <div class="flex gap-1">
            <Link
              v-for="page in subscriptions.links"
              :key="page.label"
              :href="page.url"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                page.active ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100',
                !page.url && 'opacity-50 cursor-not-allowed'
              ]"
              v-html="page.label"
            />
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { router, Link } from '@inertiajs/vue3'
import AdminLayout from '@/Layouts/AdminLayout.vue'

const props = defineProps({
  subscriptions: Object,
  stats: Object,
})

const searchQuery = ref('')
const toast = reactive({
  show: false,
  type: 'success',
  message: '',
})

const filteredSubscriptions = computed(() => {
  if (!searchQuery.value) {
    return props.subscriptions.data
  }

  const query = searchQuery.value.toLowerCase()
  return props.subscriptions.data.filter(subscription => {
    return subscription.name.toLowerCase().includes(query) ||
           subscription.duration.toLowerCase().includes(query) ||
           subscription.price.toString().includes(query)
  })
})

const showToast = (message, type = 'success') => {
  toast.show = true
  toast.type = type
  toast.message = message
  setTimeout(() => {
    toast.show = false
  }, 5000)
}

const toggleActive = async (subscription) => {
  const action = subscription.is_active ? 'deactivate' : 'activate'
  const message = subscription.is_active
    ? `Deactivate subscription plan?\n\nThis will:\n- Make plan unavailable for new subscriptions\n- Not affect existing users with this plan\n- Can be reactivated anytime`
    : `Activate subscription plan?\n\nThis will:\n- Make plan available for new subscriptions\n- Allow users to subscribe to this plan`

  if (!confirm(message)) return

  try {
    router.post(`/admin/subscriptions/${subscription.id}/toggle`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        showToast(`Subscription ${action}d successfully`)
      },
      onError: () => {
        showToast(`Failed to ${action} subscription`, 'error')
      }
    })
  } catch (error) {
    showToast(`Failed to ${action} subscription`, 'error')
  }
}

const deleteSubscription = async (subscription) => {
  const message = `Delete subscription plan "${subscription.name}"?\n\nWARNING: This action cannot be undone!\n\nThis will:\n- Permanently delete this plan\n- May affect users currently subscribed to this plan\n- Remove all associated data`

  if (!confirm(message)) return

  try {
    router.delete(`/admin/subscriptions/${subscription.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        showToast('Subscription deleted successfully')
      },
      onError: () => {
        showToast('Failed to delete subscription', 'error')
      }
    })
  } catch (error) {
    showToast('Failed to delete subscription', 'error')
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
