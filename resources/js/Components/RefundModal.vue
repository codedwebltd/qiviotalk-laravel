<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click.self="close">
        <div class="flex min-h-screen items-end sm:items-center justify-center p-0 sm:p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" @click="close"></div>

          <!-- Modal -->
          <div class="relative bg-white w-full sm:rounded-2xl shadow-2xl sm:max-w-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 p-6 text-white">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center shadow-lg">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold">Approve Refund</h3>
                    <p class="text-emerald-100 text-sm">Debit amount from user wallet</p>
                  </div>
                </div>
                <button @click="close" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <!-- Transaction Details -->
              <div class="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 class="text-sm font-bold text-gray-700 mb-3">Transaction Details</h4>
                <div class="space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Reference:</span>
                    <span class="font-mono font-semibold text-gray-900">{{ transaction?.reference }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Amount:</span>
                    <span class="font-bold text-purple-600">{{ transaction?.currency }} {{ transaction?.amount }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Type:</span>
                    <span class="font-semibold text-gray-900 capitalize">{{ transaction?.type }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">User:</span>
                    <span class="font-semibold text-gray-900">{{ transaction?.user?.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Notes Input -->
              <div class="mb-6">
                <label class="text-sm font-bold text-gray-700 mb-2 block">Admin Notes (Optional)</label>
                <textarea
                  v-model="notes"
                  rows="3"
                  placeholder="Enter notes about this refund approval..."
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                  :disabled="processing"
                ></textarea>
              </div>

              <!-- Warning -->
              <div class="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <div class="text-sm">
                    <p class="font-semibold text-amber-800 mb-1">Important Notice</p>
                    <p class="text-amber-700">This will DEBIT the refund amount from the user's wallet and mark the refund as completed. This action cannot be undone.</p>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm text-red-700">{{ error }}</p>
                </div>
              </div>

              <!-- Success Message -->
              <div v-if="success" class="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-sm text-green-700">{{ success }}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-6 pb-6 flex gap-3">
              <button
                @click="close"
                :disabled="processing"
                class="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                @click="approveRefund"
                :disabled="processing || success"
                class="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="processing" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ processing ? 'Approving...' : 'Approve Refund' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  show: Boolean,
  transaction: Object,
});

const emit = defineEmits(['update:show', 'refunded']);

const notes = ref('');
const processing = ref(false);
const error = ref('');
const success = ref('');

const close = () => {
  if (!processing.value) {
    emit('update:show', false);
    // Reset after animation
    setTimeout(() => {
      notes.value = '';
      error.value = '';
      success.value = '';
    }, 300);
  }
};

const approveRefund = async () => {
  if (!props.transaction) return;

  processing.value = true;
  error.value = '';
  success.value = '';

  try {
    const response = await axios.post(`/admin/transactions/${props.transaction.id}/approve-refund`, {
      notes: notes.value || 'Refund approved and processed manually',
    });

    if (response.data.status === 'success') {
      success.value = response.data.message;
      emit('refunded');

      // Close modal after 2 seconds
      setTimeout(() => {
        close();
      }, 2000);
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to approve refund. Please try again.';
  } finally {
    processing.value = false;
  }
};

// Reset when modal opens
watch(() => props.show, (newVal) => {
  if (newVal) {
    notes.value = '';
    error.value = '';
    success.value = '';
  }
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
