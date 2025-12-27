<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
        <div class="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="close"></div>

          <!-- Modal -->
          <div class="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-4xl max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 p-6 text-white flex-shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                    {{ conversation.visitor_name?.charAt(0).toUpperCase() || 'V' }}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold">{{ conversation.visitor_name || 'Anonymous Visitor' }}</h3>
                    <p class="text-blue-100 text-sm">Visitor Information</p>
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
                  <p v-if="conversation.visitor_email" class="text-gray-600 text-sm mb-2">{{ conversation.visitor_email }}</p>
                  <p class="text-gray-500 text-xs font-mono">ID: {{ conversation.visitor_id }}</p>
                </div>

                <!-- Contact Information -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-purple-100 rounded-lg">
                      <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                    </div>
                    Contact Information
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="Name" :value="conversation.visitor_name || 'Not provided'" />
                    <InfoCard label="Email" :value="conversation.visitor_email || 'Not provided'" />
                    <InfoCard label="Visitor ID" :value="conversation.visitor_id || 'Not provided'" />
                    <InfoCard label="Language" :value="conversation.visitor_language || 'Unknown'" />
                  </div>
                </div>

                <!-- Location & Device -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </div>
                    Location & Device
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="Country" :value="meta.location?.country?.name || 'Unknown'">
                      <template #icon>
                        <span class="text-2xl">{{ getCountryFlag(meta.location?.country?.code) }}</span>
                      </template>
                    </InfoCard>
                    <InfoCard label="City" :value="meta.location?.city?.name || (meta.location?.region?.name || 'Unknown')" />
                    <InfoCard label="IP Address" :value="conversation.visitor_ip || meta.location?.ip || 'Unknown'" />
                    <InfoCard label="Timezone" :value="meta.location?.timezone || meta.visitor_timezone || 'Unknown'" />
                    <InfoCard label="Browser" :value="`${meta.location?.device?.browser || 'Unknown'} ${meta.location?.device?.browser_version || ''}`" />
                    <InfoCard label="Platform" :value="`${meta.location?.device?.platform || meta.visitor_platform || 'Unknown'} ${meta.location?.device?.platform_version || ''}`" />
                    <InfoCard label="Device Type" :value="meta.location?.device?.device_type?.toUpperCase() || 'DESKTOP'" badge />
                    <InfoCard label="Screen" :value="meta.visitor_screen_resolution || 'Unknown'" />
                  </div>

                  <!-- User Agent -->
                  <div v-if="conversation.visitor_user_agent || meta.location?.device?.user_agent" class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p class="text-xs font-semibold text-gray-500 mb-2">User Agent</p>
                    <p class="text-xs text-gray-700 font-mono break-all">{{ conversation.visitor_user_agent || meta.location?.device?.user_agent }}</p>
                  </div>
                </div>

                <!-- Network Information -->
                <div v-if="meta.location?.network" class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-teal-100 rounded-lg">
                      <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                      </svg>
                    </div>
                    Network Information
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="ISP" :value="meta.location?.network?.isp || 'Unknown'" />
                    <InfoCard label="Organization" :value="meta.location?.network?.organization || 'Unknown'" />
                    <InfoCard label="ASN" :value="meta.location?.network?.autonomous_system_number || 'Unknown'" />
                    <InfoCard label="AS Organization" :value="meta.location?.network?.autonomous_system_organization || 'Unknown'" />
                  </div>
                </div>

                <!-- Activity -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-amber-100 rounded-lg">
                      <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    Activity
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard label="First Visit" :value="formatDate(conversation.created_at)" />
                    <InfoCard label="Last Activity" :value="formatDate(conversation.last_message_at || conversation.updated_at)" />
                    <InfoCard label="Session ID" :value="meta.location?.session_id || 'N/A'" />
                    <InfoCard label="Window Size" :value="meta.browser_capabilities?.windowSize || 'Unknown'" />
                    <InfoCard label="Current Page" :value="meta.visitor_url || 'N/A'" link />
                    <InfoCard label="Referrer" :value="conversation.visitor_referrer || 'Direct'" :link="conversation.visitor_referrer && conversation.visitor_referrer !== 'Direct'" />
                  </div>

                  <!-- Coordinates -->
                  <div v-if="meta.location?.coordinates" class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p class="text-xs font-semibold text-gray-500 mb-2">Geographic Coordinates</p>
                    <p class="text-sm text-gray-900">
                      Latitude: {{ meta.location.coordinates.latitude }}, Longitude: {{ meta.location.coordinates.longitude }}
                      <span v-if="meta.location.accuracy_radius" class="text-xs text-gray-600">(±{{ meta.location.accuracy_radius }}km accuracy)</span>
                    </p>
                  </div>

                  <!-- First Message -->
                  <div v-if="conversation.first_message" class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p class="text-xs font-semibold text-gray-500 mb-2">First Message</p>
                    <p class="text-sm text-gray-900">{{ conversation.first_message }}</p>
                  </div>
                </div>

                <!-- Visited Pages -->
                <div v-if="meta.visitor_pages && meta.visitor_pages.length > 0" class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-indigo-100 rounded-lg">
                      <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    Visited Pages ({{ meta.visitor_pages.length }})
                  </h4>
                  <div class="space-y-2 max-h-48 overflow-y-auto">
                    <a
                      v-for="(page, index) in meta.visitor_pages"
                      :key="index"
                      :href="page"
                      target="_blank"
                      class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div class="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {{ index + 1 }}
                      </div>
                      <p class="text-sm text-blue-600 group-hover:underline truncate flex-1">{{ page }}</p>
                      <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                      </svg>
                    </a>
                  </div>
                </div>

                <!-- Browser Capabilities -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-violet-100 rounded-lg">
                      <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    Browser Features
                  </h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <CapabilityBadge label="Cookies" :enabled="meta.browser_capabilities?.cookiesEnabled" />
                    <CapabilityBadge label="Local Storage" :enabled="meta.browser_capabilities?.localStorage" />
                    <CapabilityBadge label="Touch Screen" :enabled="meta.browser_capabilities?.touchScreen" />
                    <CapabilityBadge label="Java" :enabled="meta.browser_capabilities?.javaEnabled" />
                  </div>
                </div>

                <!-- Security -->
                <div class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-red-100 rounded-lg">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    Security
                  </h4>
                  <div class="grid grid-cols-3 gap-3">
                    <SecurityBadge label="VPN" :detected="meta.location?.security?.is_vpn" />
                    <SecurityBadge label="TOR" :detected="meta.location?.security?.is_tor" />
                    <SecurityBadge label="Proxy" :detected="meta.location?.security?.is_anonymous_proxy" />
                  </div>
                </div>

                <!-- Conversation Status -->
                <div v-if="conversation.status === 'closed'" class="bg-white rounded-xl border border-gray-200 p-5">
                  <h4 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div class="p-2 bg-gray-100 rounded-lg">
                      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    Conversation Status
                  </h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard v-if="conversation.closed_at" label="Closed At" :value="formatDate(conversation.closed_at)" />
                    <InfoCard v-if="conversation.closed_by_user" label="Closed By" :value="conversation.closed_by_user.name || conversation.closed_by_user.email" />
                    <InfoCard v-if="conversation.rating" label="Rating" :value="'⭐'.repeat(conversation.rating)" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 bg-gray-50 border-t border-gray-200 flex justify-between flex-shrink-0">
              <button @click="close" class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Close
              </button>
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

const meta = computed(() => {
  const metaData = props.conversation?.meta_data || {};
  console.log('VisitorInfoModal meta_data:', metaData);
  return metaData;
});

const close = () => {
  emit('update:show', false);
};

const getCountryFlag = (code) => {
  const flags = {
    'NG': '🇳🇬', 'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'DE': '🇩🇪',
    'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'BR': '🇧🇷', 'IN': '🇮🇳',
    'AU': '🇦🇺', 'JP': '🇯🇵', 'CN': '🇨🇳', 'ZA': '🇿🇦', 'MX': '🇲🇽',
  };
  return flags[code] || '🌍';
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
// Info Card Component
export const InfoCard = {
  props: {
    label: String,
    value: String,
    link: Boolean,
    badge: Boolean,
  },
  template: `
    <div class="bg-gray-50 p-4 rounded-lg">
      <p class="text-xs text-gray-600 mb-1.5 font-medium">{{ label }}</p>
      <a
        v-if="link && value !== 'N/A' && value !== 'Unknown' && value !== 'Not provided'"
        :href="value"
        target="_blank"
        class="text-sm font-semibold text-blue-600 hover:underline truncate block"
      >
        {{ value }}
      </a>
      <p
        v-else
        :class="[
          'text-sm font-semibold truncate',
          badge ? 'inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full' : 'text-gray-900'
        ]"
      >
        <slot name="icon"></slot>
        {{ value }}
      </p>
    </div>
  `,
};

// Capability Badge Component
export const CapabilityBadge = {
  props: {
    label: String,
    enabled: Boolean,
  },
  template: `
    <div class="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
      <div :class="enabled ? 'text-green-500' : 'text-red-500'" class="text-2xl mb-2">
        {{ enabled ? '✓' : '✕' }}
      </div>
      <p class="text-xs text-gray-600 font-medium text-center">{{ label }}</p>
    </div>
  `,
};

// Security Badge Component
export const SecurityBadge = {
  props: {
    label: String,
    detected: Boolean,
  },
  template: `
    <div :class="detected ? 'bg-red-50' : 'bg-green-50'" class="p-4 rounded-lg text-center">
      <p :class="detected ? 'text-red-700' : 'text-green-700'" class="font-bold text-sm">
        {{ detected ? label : \`No \${label}\` }}
      </p>
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
