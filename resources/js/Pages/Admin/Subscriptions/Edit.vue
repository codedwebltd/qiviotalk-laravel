<template>
  <AdminLayout title="Edit Subscription">
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

    <!-- Header -->
    <div class="mb-6">
      <Link href="/admin/subscriptions" class="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Subscriptions
      </Link>
    </div>

    <form @submit.prevent="submitForm" class="pb-20">
      <!-- Basic Information -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Basic Information</h3>
              <p class="text-sm text-gray-600">Plan details and pricing</p>
            </div>
          </div>
        </div>

        <div class="p-4 sm:p-6 space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Professional"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                v-model="form.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                v-model="form.duration"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Monthly, Annual"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
              <input
                v-model="form.duration_days"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., 30, 365"
              />
            </div>
          </div>

          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span class="text-sm font-medium text-gray-700">Active</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="form.is_free_tier"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="text-sm font-medium text-gray-700">Free Tier</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Feature Limits (Programmatic Logic) -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">Feature Limits</h3>
                <p class="text-sm text-gray-600">Backend programmatic logic (read by FeatureManager)</p>
              </div>
            </div>
            <button
              type="button"
              @click="addFeatureLimit"
              class="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-medium rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Limit
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-blue-800">
              <strong>Examples:</strong> <code>widgets_limit: 5</code>, <code>conversations_limit: 100</code>, <code>team_members_limit: 3</code>,
              <code>ai_responses: true</code>, <code>custom_branding: false</code>.
              Use <code>-1</code> or <code>"unlimited"</code> for unlimited resources.
            </p>
          </div>

          <div class="max-h-[400px] lg:max-h-none overflow-y-auto space-y-3 pr-2">
            <div v-for="(value, key, index) in form.feature_limits" :key="index" class="flex gap-2">
              <input
                v-model="featureLimitKeys[index]"
                @input="updateFeatureLimitKey(index, key)"
                type="text"
                placeholder="Feature key (e.g., widgets_limit)"
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <input
                v-model="form.feature_limits[key]"
                type="text"
                placeholder="Value (number, true/false, or 'unlimited')"
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <button
                type="button"
                @click="removeFeatureLimit(key)"
                class="px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition-colors shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div v-if="Object.keys(form.feature_limits || {}).length === 0" class="text-center py-8 text-gray-500">
              No feature limits defined. Click "Add Limit" to add programmatic limits.
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Features (Descriptions) -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
        <div class="p-4 sm:p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">Mobile Features</h3>
                <p class="text-sm text-gray-600">User-facing descriptions (shown in mobile app)</p>
              </div>
            </div>
            <button
              type="button"
              @click="addMobileFeature"
              class="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Add Feature
            </button>
          </div>
        </div>

        <div class="p-4 sm:p-6">
          <div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p class="text-xs text-green-800">
              <strong>Examples:</strong> "Up to 5 chat widgets", "100 conversations per month", "Priority support", "Custom branding", "Advanced analytics"
            </p>
          </div>

          <div class="max-h-[400px] lg:max-h-none overflow-y-auto space-y-3 pr-2">
            <div v-for="(feature, index) in form.features" :key="index" class="flex gap-2">
              <input
                v-model="form.features[index]"
                type="text"
                placeholder="Feature description"
                class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                @click="removeMobileFeature(index)"
                class="px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition-colors shrink-0"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div v-if="form.features.length === 0" class="text-center py-8 text-gray-500">
              No mobile features defined. Click "Add Feature" to add user-facing descriptions.
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg lg:relative lg:border-0 lg:shadow-none lg:p-0 lg:bg-transparent z-40">
        <div class="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <Link
            href="/admin/subscriptions"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
          >
            Cancel
          </Link>
          <button
            type="submit"
            :disabled="processing"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
            <svg v-if="processing" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            {{ processing ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </form>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { router, Link } from '@inertiajs/vue3'
import AdminLayout from '@/Layouts/AdminLayout.vue'

const props = defineProps({
  subscription: Object,
})

const form = reactive({
  name: props.subscription.name || '',
  price: props.subscription.price || 0,
  duration: props.subscription.duration || '',
  duration_days: props.subscription.duration_days || null,
  is_active: props.subscription.is_active ?? true,
  is_free_tier: props.subscription.is_free_tier ?? false,
  feature_limits: props.subscription.feature_limits || {},
  features: props.subscription.features || [],
})

const processing = ref(false)
const toast = reactive({
  show: false,
  type: 'success',
  message: '',
})

// Keep track of feature limit keys for editing
const featureLimitKeys = ref(Object.keys(form.feature_limits))

const showToast = (message, type = 'success') => {
  toast.show = true
  toast.type = type
  toast.message = message
  setTimeout(() => {
    toast.show = false
  }, 5000)
}

const addFeatureLimit = () => {
  const newKey = `feature_${Date.now()}`
  form.feature_limits[newKey] = ''
  featureLimitKeys.value.push(newKey)
}

const removeFeatureLimit = (key) => {
  if (!confirm('Remove this feature limit?')) return
  delete form.feature_limits[key]
  featureLimitKeys.value = Object.keys(form.feature_limits)
}

const updateFeatureLimitKey = (index, oldKey) => {
  const newKey = featureLimitKeys.value[index]
  if (newKey !== oldKey && newKey) {
    const value = form.feature_limits[oldKey]
    delete form.feature_limits[oldKey]
    form.feature_limits[newKey] = value
  }
}

const addMobileFeature = () => {
  form.features.push('')
}

const removeMobileFeature = (index) => {
  if (!confirm('Remove this mobile feature?')) return
  form.features.splice(index, 1)
}

const submitForm = () => {
  if (!confirm('Save changes to this subscription plan?\n\nThis will update:\n- Basic plan information\n- Backend feature limits (programmatic logic)\n- Mobile feature descriptions\n\nExisting subscribers may be affected.')) {
    return
  }

  processing.value = true

  // Process feature_limits to convert values
  const processedLimits = {}
  Object.entries(form.feature_limits).forEach(([key, value]) => {
    if (value === 'true' || value === true) {
      processedLimits[key] = true
    } else if (value === 'false' || value === false) {
      processedLimits[key] = false
    } else if (value === 'unlimited' || value === '-1') {
      processedLimits[key] = -1
    } else if (!isNaN(value) && value !== '') {
      processedLimits[key] = parseFloat(value)
    } else {
      processedLimits[key] = value
    }
  })

  const data = {
    ...form,
    feature_limits: processedLimits,
    features: form.features.filter(f => f.trim() !== ''),
  }

  router.put(`/admin/subscriptions/${props.subscription.id}`, data, {
    preserveScroll: true,
    onSuccess: () => {
      processing.value = false
      showToast('Subscription updated successfully')
    },
    onError: (errors) => {
      processing.value = false
      showToast('Failed to update subscription', 'error')
      console.error(errors)
    }
  })
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
