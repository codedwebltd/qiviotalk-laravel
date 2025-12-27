<template>
  <AdminLayout :title="`Transaction Details - ${transaction.reference}`">
    <!-- Back Button -->
    <div class="mb-6">
      <Link
        href="/admin/transactions"
        class="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to Transactions
      </Link>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column - Transaction Details -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Transaction Overview Card -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold text-white mb-1">Transaction Overview</h2>
                <p class="text-purple-100 text-sm">Complete transaction information</p>
              </div>
              <div class="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Reference -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Reference</label>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-mono font-bold text-gray-900">{{ transaction.reference || 'N/A' }}</p>
                  <button
                    v-if="transaction.reference"
                    @click="copyToClipboard(transaction.reference)"
                    class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copy reference"
                  >
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- UUID -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">UUID</label>
                <p class="text-sm font-mono text-gray-900">{{ transaction.uuid }}</p>
              </div>

              <!-- Amount -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Amount</label>
                <p
                  :class="{
                    'text-green-600': ['deposit', 'subscription'].includes(transaction.type),
                    'text-red-600': ['withdrawal'].includes(transaction.type),
                    'text-purple-600': transaction.type === 'refund',
                  }"
                  class="text-2xl font-bold"
                >
                  {{ ['withdrawal'].includes(transaction.type) ? '-' : '+' }}{{ transaction.currency }} {{ Number(transaction.amount).toLocaleString() }}
                </p>
              </div>

              <!-- Type -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
                <span
                  :class="{
                    'bg-blue-100 text-blue-800': transaction.type === 'subscription',
                    'bg-green-100 text-green-800': transaction.type === 'deposit',
                    'bg-red-100 text-red-800': transaction.type === 'withdrawal',
                    'bg-purple-100 text-purple-800': transaction.type === 'refund',
                  }"
                  class="px-4 py-2 rounded-full text-sm font-bold uppercase inline-block"
                >
                  {{ transaction.type }}
                </span>
              </div>

              <!-- Status -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                <span
                  :class="{
                    'bg-green-100 text-green-800': transaction.status === 'completed',
                    'bg-amber-100 text-amber-800': transaction.status === 'pending',
                    'bg-red-100 text-red-800': transaction.status === 'failed',
                    'bg-gray-100 text-gray-800': ['cancelled', 'rejected'].includes(transaction.status),
                    'bg-orange-100 text-orange-800': transaction.status === 'expired',
                  }"
                  class="px-4 py-2 rounded-full text-sm font-bold uppercase inline-flex items-center gap-2"
                >
                  <span
                    :class="{
                      'bg-green-500': transaction.status === 'completed',
                      'bg-amber-500': transaction.status === 'pending',
                      'bg-red-500': transaction.status === 'failed',
                      'bg-gray-500': ['cancelled', 'rejected'].includes(transaction.status),
                      'bg-orange-500': transaction.status === 'expired',
                    }"
                    class="w-2.5 h-2.5 rounded-full"
                  ></span>
                  {{ transaction.status }}
                </span>
              </div>

              <!-- Created At -->
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Created At</label>
                <p class="text-sm text-gray-900">{{ formatDate(transaction.created_at) }}</p>
              </div>

              <!-- Description -->
              <div class="md:col-span-2">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Description</label>
                <p class="text-sm text-gray-900">{{ transaction.description || 'No description provided' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Subscription Details (if applicable) -->
        <div
          v-if="transaction.subscription"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Subscription Plan</h2>
                <p class="text-blue-100 text-sm">Details of the subscription</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Plan Name</label>
                <p class="text-sm font-bold text-gray-900">{{ transaction.subscription.name }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Duration</label>
                <p class="text-sm text-gray-900 capitalize">{{ transaction.subscription.duration }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                <p class="text-sm font-bold text-gray-900">{{ transaction.subscription.currency }} {{ Number(transaction.subscription.price).toLocaleString() }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                <span
                  :class="transaction.subscription.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ transaction.subscription.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div
          v-if="transaction.metadata && Object.keys(transaction.metadata).length > 0"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-indigo-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Additional Information</h2>
                <p class="text-indigo-100 text-sm">Metadata and extra details</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="bg-gray-50 rounded-xl p-4 font-mono text-sm">
              <pre class="text-gray-800 whitespace-pre-wrap break-words">{{ JSON.stringify(transaction.metadata, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column - User & Actions -->
      <div class="space-y-6">
        <!-- User Card -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-emerald-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">User Information</h2>
                <p class="text-emerald-100 text-sm">Transaction owner</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="flex flex-col items-center text-center mb-6">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
                {{ getUserInitials(transaction.user?.name) }}
              </div>
              <h3 class="text-lg font-bold text-gray-900">{{ transaction.user?.name || 'Unknown User' }}</h3>
              <p class="text-sm text-gray-600">{{ transaction.user?.email || 'No email' }}</p>
            </div>

            <div class="space-y-3 pt-4 border-t border-gray-100">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">User ID</label>
                <p class="text-sm text-gray-900">#{{ transaction.user_id }}</p>
              </div>
              <div v-if="transaction.user?.membership_type">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Membership</label>
                <p class="text-sm text-gray-900 capitalize">{{ transaction.user.membership_type }}</p>
              </div>
              <div v-if="transaction.user?.membership_expires_at">
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Expires At</label>
                <p class="text-sm text-gray-900">{{ formatDate(transaction.user.membership_expires_at) }}</p>
              </div>
            </div>

            <Link
              :href="`/admin/users/${transaction.user_id}`"
              class="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              View User Profile
            </Link>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="transaction.status === 'pending'"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-amber-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Admin Actions</h2>
                <p class="text-amber-100 text-sm">Manage transaction</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-3">
            <!-- Approve Button -->
            <button
              v-if="transaction.type !== 'refund'"
              @click="showApproveModal = true"
              :disabled="processing"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Approve Transaction
            </button>

            <!-- Approve Refund Button -->
            <button
              v-if="transaction.type === 'refund'"
              @click="showRefundModal = true"
              :disabled="processing"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Approve Refund
            </button>

            <!-- Reject Button -->
            <button
              @click="showRejectModal = true"
              :disabled="processing"
              class="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Reject Transaction
            </button>
          </div>
        </div>

        <!-- Wallet Info (if applicable) -->
        <div
          v-if="transaction.wallet"
          class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-500 to-teal-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Wallet Information</h2>
                <p class="text-teal-100 text-sm">User wallet details</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Balance</label>
                <p class="text-xl font-bold text-gray-900">{{ transaction.wallet.currency }} {{ Number(transaction.wallet.balance).toLocaleString() }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Currency</label>
                <p class="text-sm text-gray-900">{{ transaction.wallet.currency }}</p>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                <span
                  :class="transaction.wallet.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ transaction.wallet.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Approve Modal -->
    <Teleport to="body">
      <div
        v-if="showApproveModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showApproveModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-green-500 to-green-600">
            <h3 class="text-xl font-bold text-white">Approve Transaction</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p class="text-sm text-blue-900">
                <strong>Note:</strong> Approving this transaction will activate the user's subscription plan and update their membership details.
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Admin Notes (Optional)</label>
              <textarea
                v-model="approveNotes"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="Add any notes about this approval..."
              ></textarea>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showApproveModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="approveTransaction"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processing ? 'Processing...' : 'Approve' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Reject Modal -->
    <Teleport to="body">
      <div
        v-if="showRejectModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showRejectModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600">
            <h3 class="text-xl font-bold text-white">Reject Transaction</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">
                <strong>Warning:</strong> This will permanently reject this transaction. This action cannot be undone.
              </p>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Reason for Rejection (Optional)</label>
              <textarea
                v-model="rejectNotes"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                placeholder="Explain why this transaction is being rejected..."
              ></textarea>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showRejectModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="rejectTransaction"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ processing ? 'Processing...' : 'Reject' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Refund Modal -->
    <RefundModal
      v-model:show="showRefundModal"
      :transaction="transaction"
      @refunded="handleRefunded"
    />
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import RefundModal from '@/Components/RefundModal.vue';

const props = defineProps({
  transaction: Object,
  refund: Object,
  originalTransaction: Object,
});

const showApproveModal = ref(false);
const showRejectModal = ref(false);
const showRefundModal = ref(false);
const approveNotes = ref('');
const rejectNotes = ref('');
const processing = ref(false);
const error = ref('');

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
    alert('Reference copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

const approveTransaction = async () => {
  if (processing.value) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post(`/admin/transactions/${props.transaction.id}/approve`, {
      notes: approveNotes.value,
    }, {
      preserveState: false,
      onSuccess: () => {
        showApproveModal.value = false;
        approveNotes.value = '';
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to approve transaction';
      },
      onFinish: () => {
        processing.value = false;
      },
    });
  } catch (err) {
    error.value = 'An unexpected error occurred';
    processing.value = false;
  }
};

const rejectTransaction = async () => {
  if (processing.value) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post(`/admin/transactions/${props.transaction.id}/reject`, {
      notes: rejectNotes.value,
    }, {
      preserveState: false,
      onSuccess: () => {
        showRejectModal.value = false;
        rejectNotes.value = '';
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to reject transaction';
      },
      onFinish: () => {
        processing.value = false;
      },
    });
  } catch (err) {
    error.value = 'An unexpected error occurred';
    processing.value = false;
  }
};

const handleRefunded = () => {
  router.reload();
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
