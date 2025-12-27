<template>
  <AdminLayout title="Transactions">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <!-- Total Transactions -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Total</p>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats.total.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Completed</p>
              <h3 class="text-2xl font-bold text-green-600">{{ stats.completed.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Revenue -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Revenue</p>
              <h3 class="text-xl font-bold text-emerald-600">${{ stats.total_revenue.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending -->
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Pending</p>
              <h3 class="text-2xl font-bold text-amber-600">{{ stats.pending.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Search -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Search</label>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Reference, user, description..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <!-- Status Filter -->
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Status</label>
            <select
              v-model="statusFilter"
              @change="handleFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <!-- Type Filter -->
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Type</label>
            <select
              v-model="typeFilter"
              @change="handleFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Types</option>
              <option value="subscription">Subscription</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">All Transactions</h3>
            <p class="text-sm text-gray-600">Manage and refund transactions</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reference</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="transaction in transactions.data"
              :key="transaction.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Reference -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-mono font-semibold text-gray-900">{{ transaction.reference }}</div>
                <div class="text-xs text-gray-500 truncate max-w-xs">{{ transaction.description }}</div>
              </td>

              <!-- User -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {{ getUserInitials(transaction.user?.name) }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900">{{ transaction.user?.name || 'Unknown' }}</div>
                    <div class="text-xs text-gray-500">{{ transaction.user?.email }}</div>
                  </div>
                </div>
              </td>

              <!-- Type -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-blue-100 text-blue-800': transaction.type === 'subscription',
                    'bg-green-100 text-green-800': transaction.type === 'deposit',
                    'bg-red-100 text-red-800': transaction.type === 'withdrawal',
                    'bg-purple-100 text-purple-800': transaction.type === 'refund',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ transaction.type }}
                </span>
              </td>

              <!-- Amount -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div
                  :class="{
                    'text-green-600': ['deposit', 'subscription'].includes(transaction.type),
                    'text-red-600': ['withdrawal'].includes(transaction.type),
                    'text-purple-600': transaction.type === 'refund',
                  }"
                  class="text-sm font-bold"
                >
                  {{ ['withdrawal'].includes(transaction.type) ? '-' : '+' }}{{ transaction.currency }} {{ transaction.amount }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-green-100 text-green-800': transaction.status === 'completed',
                    'bg-amber-100 text-amber-800': transaction.status === 'pending',
                    'bg-red-100 text-red-800': transaction.status === 'failed',
                    'bg-gray-100 text-gray-800': transaction.status === 'cancelled',
                    'bg-orange-100 text-orange-800': transaction.status === 'expired',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5"
                >
                  <span
                    :class="{
                      'bg-green-500': transaction.status === 'completed',
                      'bg-amber-500': transaction.status === 'pending',
                      'bg-red-500': transaction.status === 'failed',
                      'bg-gray-500': transaction.status === 'cancelled',
                      'bg-orange-500': transaction.status === 'expired',
                    }"
                    class="w-2 h-2 rounded-full"
                  ></span>
                  {{ transaction.status }}
                </span>
              </td>

              <!-- Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ formatDate(transaction.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <!-- Approve Button (for all pending transactions except refunds) -->
                  <button
                    v-if="transaction.status === 'pending' && transaction.type !== 'refund'"
                    @click="openApproveModal(transaction)"
                    class="p-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg group"
                    title="Approve Transaction"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>

                  <!-- Approve Refund Button (only for pending refunds) -->
                  <button
                    v-if="canApproveRefund(transaction)"
                    @click="openRefundModal(transaction)"
                    class="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg group"
                    title="Approve Refund"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>

                  <!-- Reject Button (for all pending transactions) -->
                  <button
                    v-if="transaction.status === 'pending'"
                    @click="openRejectModal(transaction)"
                    class="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg group"
                    title="Reject Transaction"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>

                  <!-- View Details -->
                  <Link
                    :href="`/admin/transactions/${transaction.id}`"
                    class="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group"
                    title="View Details"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </Link>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="transactions.data.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
          <p class="text-gray-500 text-lg font-medium">No transactions found</p>
          <p class="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="transactions.data.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ transactions.from }} to {{ transactions.to }} of {{ transactions.total }} transactions
          </div>
          <div class="flex gap-2">
            <Link
              v-for="link in transactions.links"
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

    <!-- Refund Modal -->
    <RefundModal
      v-model:show="showRefundModal"
      :transaction="selectedTransaction"
      @refunded="handleRefunded"
    />

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
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Reference:</span>
                <span class="text-xs text-gray-900 font-mono">{{ selectedTransaction?.reference }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Amount:</span>
                <span class="text-xs text-gray-900 font-bold">{{ selectedTransaction?.currency }} {{ selectedTransaction?.amount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">User:</span>
                <span class="text-xs text-gray-900">{{ selectedTransaction?.user?.name }}</span>
              </div>
            </div>

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
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Reference:</span>
                <span class="text-xs text-gray-900 font-mono">{{ selectedTransaction?.reference }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Amount:</span>
                <span class="text-xs text-gray-900 font-bold">{{ selectedTransaction?.currency }} {{ selectedTransaction?.amount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">User:</span>
                <span class="text-xs text-gray-900">{{ selectedTransaction?.user?.name }}</span>
              </div>
            </div>

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
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import RefundModal from '@/Components/RefundModal.vue';

const props = defineProps({
  transactions: Object,
  stats: Object,
  filters: Object,
});

const searchQuery = ref(props.filters?.search || '');
const statusFilter = ref(props.filters?.status || 'all');
const typeFilter = ref(props.filters?.type || 'all');
const showRefundModal = ref(false);
const showApproveModal = ref(false);
const showRejectModal = ref(false);
const selectedTransaction = ref(null);
const approveNotes = ref('');
const rejectNotes = ref('');
const processing = ref(false);
const error = ref('');

let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    router.get('/admin/transactions', {
      search: searchQuery.value,
      status: statusFilter.value,
      type: typeFilter.value,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  }, 500);
};

const handleFilter = () => {
  router.get('/admin/transactions', {
    search: searchQuery.value,
    status: statusFilter.value,
    type: typeFilter.value,
  }, {
    preserveState: true,
    preserveScroll: true,
  });
};

const canApproveRefund = (transaction) => {
  return transaction.type === 'refund' && transaction.status === 'pending';
};

const openRefundModal = (transaction) => {
  selectedTransaction.value = transaction;
  showRefundModal.value = true;
};

const openApproveModal = (transaction) => {
  selectedTransaction.value = transaction;
  error.value = '';
  approveNotes.value = '';
  showApproveModal.value = true;
};

const openRejectModal = (transaction) => {
  selectedTransaction.value = transaction;
  error.value = '';
  rejectNotes.value = '';
  showRejectModal.value = true;
};

const approveTransaction = async () => {
  if (processing.value || !selectedTransaction.value) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post(`/admin/transactions/${selectedTransaction.value.id}/approve`, {
      notes: approveNotes.value,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showApproveModal.value = false;
        approveNotes.value = '';
        selectedTransaction.value = null;
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
  if (processing.value || !selectedTransaction.value) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post(`/admin/transactions/${selectedTransaction.value.id}/reject`, {
      notes: rejectNotes.value,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showRejectModal.value = false;
        rejectNotes.value = '';
        selectedTransaction.value = null;
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
  router.reload({ only: ['transactions', 'stats'] });
};

const formatDate = (date) => {
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
