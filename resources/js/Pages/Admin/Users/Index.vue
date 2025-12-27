<template>
  <AdminLayout title="User Management">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Total Users</p>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats.total.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Active</p>
              <h3 class="text-2xl font-bold text-green-600">{{ stats.active.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Admins</p>
              <h3 class="text-2xl font-bold text-purple-600">{{ stats.admins.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Total Balance</p>
              <h3 class="text-xl font-bold text-emerald-600">${{ stats.total_wallet_balance.toLocaleString() }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Search</label>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Name, email, referral code..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Status</label>
            <select
              v-model="statusFilter"
              @change="handleFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Role</label>
            <select
              v-model="roleFilter"
              @change="handleFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Roles</option>
              <option value="0">Users</option>
              <option value="1">Admins</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTItMTh2Mmg0di0yaC00ek0zMiAxOHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-4 flex-1">
            <div class="flex-shrink-0">
              <div class="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg ring-2 ring-white/30">
                <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">All Users</h3>
              <p class="text-sm sm:text-base text-blue-100 leading-relaxed">Manage users, wallets, and widgets all in one place</p>
            </div>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button
              @click="openCreateModal"
              class="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2 group"
            >
              <svg class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <span class="text-sm sm:text-base">Create User</span>
            </button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b-2 border-blue-200">
            <tr>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">User</span>
                </div>
              </th>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Subscription</span>
                </div>
              </th>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Wallet</span>
                </div>
              </th>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Widget</span>
                </div>
              </th>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Stats</span>
                </div>
              </th>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Status</span>
                </div>
              </th>
              <th class="px-6 py-5 text-left">
                <div class="flex items-center gap-2">
                  <div class="p-1.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg shadow-sm">
                    <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                    </svg>
                  </div>
                  <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in users.data"
              :key="user.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {{ getUserInitials(user.name) }}
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <div class="text-sm font-semibold text-gray-900">{{ user.name }}</div>
                      <span
                        v-if="user.role === 1"
                        class="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-bold"
                      >
                        ADMIN
                      </span>
                    </div>
                    <div class="text-xs text-gray-500">{{ user.email }}</div>
                    <div class="text-xs text-gray-400 font-mono">{{ user.referral_code }}</div>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="user.subscription">
                  <div class="text-sm font-semibold text-gray-900">{{ user.subscription.name }}</div>
                  <div class="text-xs text-gray-500">{{ user.membership_type }}</div>
                  <div class="text-xs text-gray-400">{{ formatDate(user.membership_expires_at) }}</div>
                </div>
                <div v-else class="text-xs text-gray-400">No subscription</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="user.wallet">
                  <div class="text-sm font-bold text-emerald-600">${{ user.wallet.balance }}</div>
                  <div class="text-xs text-gray-500">{{ user.wallet.currency }}</div>
                  <div
                    :class="{
                      'text-green-600': user.wallet.is_active,
                      'text-red-600': !user.wallet.is_active,
                    }"
                    class="text-xs font-semibold"
                  >
                    {{ user.wallet.is_active ? 'Active' : 'Inactive' }}
                  </div>
                </div>
                <div v-else class="text-xs text-gray-400">No wallet</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="user.widget">
                  <div class="text-sm font-semibold text-gray-900">{{ user.widget.name }}</div>
                  <div class="text-xs text-gray-500 font-mono">{{ user.widget.widget_key?.substring(0, 8) }}...</div>
                  <span
                    :class="{
                      'bg-green-100 text-green-800': user.widget.widget_status === 'active',
                      'bg-orange-100 text-orange-800': user.widget.widget_status === 'suspended',
                      'bg-gray-100 text-gray-800': user.widget.widget_status === 'deactivated',
                      'bg-red-100 text-red-800': user.widget.widget_status === 'fraudulent',
                    }"
                    class="px-2 py-0.5 rounded-full text-xs font-bold inline-block mt-1 uppercase"
                  >
                    {{ user.widget.widget_status }}
                  </span>
                </div>
                <div v-else class="text-xs text-gray-400">No widget</div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="space-y-1">
                  <div class="text-xs text-gray-600">
                    <span class="font-semibold">{{ user.transactions_count }}</span> transactions
                  </div>
                  <div class="text-xs text-gray-600">
                    <span class="font-semibold">{{ user.widgets_count }}</span> websites
                  </div>
                  <div class="text-xs text-gray-600">
                    <span class="font-semibold">{{ user.conversations_count }}</span> chats
                  </div>
                  <div class="text-xs text-gray-600">
                    <span class="font-semibold">{{ user.referrals_count }}</span> referrals
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="{
                    'bg-green-100 text-green-800': user.status === 'active',
                    'bg-red-100 text-red-800': user.status === 'inactive',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase inline-flex items-center gap-1.5"
                >
                  <span
                    :class="{
                      'bg-green-500': user.status === 'active',
                      'bg-red-500': user.status === 'inactive',
                    }"
                    class="w-2 h-2 rounded-full"
                  ></span>
                  {{ user.status }}
                </span>
              </td>

              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <Link
                    :href="`/admin/users/${user.id}/conversations`"
                    class="p-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg hover:from-cyan-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg group"
                    title="Manage Conversations"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                  </Link>

                  <button
                    @click="openRoleModal(user)"
                    class="p-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg group"
                    title="Change Role"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </button>

                  <button
                    @click="openStatusModal(user)"
                    :class="user.status === 'active' ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'"
                    class="p-2 bg-gradient-to-r text-white rounded-lg transition-all shadow-md hover:shadow-lg group"
                    :title="user.status === 'active' ? 'Deactivate User' : 'Activate User'"
                  >
                    <svg v-if="user.status === 'active'" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    <svg v-else class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>

                  <button
                    @click="openWalletModal(user, 'credit')"
                    class="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg group"
                    title="Credit Wallet"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>

                  <button
                    @click="openWalletModal(user, 'debit')"
                    class="p-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg group"
                    title="Debit Wallet"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>

                  <button
                    v-if="user.widget"
                    @click="toggleWidget(user)"
                    :disabled="processing"
                    :class="user.widget.widget_status === 'active' ? 'from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700' : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'"
                    class="p-2 bg-gradient-to-r text-white rounded-lg transition-all shadow-md hover:shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed"
                    :title="user.widget.widget_status === 'active' ? 'Deactivate Widget' : 'Activate Widget'"
                  >
                    <svg v-if="user.widget.widget_status === 'active'" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    <svg v-else class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>

                  <button
                    @click="openPlanModal(user)"
                    class="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group"
                    title="Change Plan"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="users.data.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <p class="text-gray-500 text-lg font-medium">No users found</p>
          <p class="text-gray-400 text-sm">Try adjusting your filters</p>
        </div>
      </div>

      <div v-if="users.data.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ users.from }} to {{ users.to }} of {{ users.total }} users
          </div>
          <div class="flex gap-2">
            <Link
              v-for="link in users.links"
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

    <Teleport to="body">
      <div
        v-if="showRoleModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showRoleModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
            <h3 class="text-xl font-bold text-white">Change User Role</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">User:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Email:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Current Role:</span>
                <span class="text-xs text-gray-900 font-bold">{{ selectedUser?.role === 1 ? 'Admin' : 'User' }}</span>
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">New Role</label>
              <select
                v-model="newRole"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="0">User</option>
                <option value="1">Admin</option>
              </select>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showRoleModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="updateRole"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md font-semibold disabled:opacity-50"
            >
              {{ processing ? 'Updating...' : 'Update Role' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showStatusModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showStatusModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div
            :class="selectedUser?.status === 'active' ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'"
            class="p-6 border-b border-gray-100 bg-gradient-to-r"
          >
            <h3 class="text-xl font-bold text-white">{{ selectedUser?.status === 'active' ? 'Deactivate' : 'Activate' }} User</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">User:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Email:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Current Status:</span>
                <span class="text-xs text-gray-900 font-bold">{{ selectedUser?.status }}</span>
              </div>
            </div>

            <div
              :class="selectedUser?.status === 'active' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'"
              class="border-l-4 p-4 rounded-lg"
            >
              <p class="text-sm" :class="selectedUser?.status === 'active' ? 'text-red-900' : 'text-green-900'">
                <strong>Note:</strong> {{ selectedUser?.status === 'active' ? 'Deactivating this user will also deactivate their widget.' : 'Activating this user will also activate their widget.' }}
              </p>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showStatusModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="updateStatus"
              :disabled="processing"
              :class="selectedUser?.status === 'active' ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r text-white rounded-xl transition-all shadow-md font-semibold disabled:opacity-50"
            >
              {{ processing ? 'Processing...' : (selectedUser?.status === 'active' ? 'Deactivate' : 'Activate') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showWalletModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showWalletModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div
            :class="walletAction === 'credit' ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'"
            class="p-6 border-b border-gray-100 bg-gradient-to-r"
          >
            <h3 class="text-xl font-bold text-white">{{ walletAction === 'credit' ? 'Credit' : 'Debit' }} Wallet</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">User:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Current Balance:</span>
                <span class="text-xs text-gray-900 font-bold">${{ selectedUser?.wallet?.balance }}</span>
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Amount ($)</label>
              <input
                v-model="walletAmount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-2 block">Description (Optional)</label>
              <textarea
                v-model="walletDescription"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                placeholder="Add a note about this transaction..."
              ></textarea>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showWalletModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="processWalletAction"
              :disabled="processing || !walletAmount || walletAmount <= 0"
              :class="walletAction === 'credit' ? 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' : 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r text-white rounded-xl transition-all shadow-md font-semibold disabled:opacity-50"
            >
              {{ processing ? 'Processing...' : (walletAction === 'credit' ? 'Credit' : 'Debit') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showPlanModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showPlanModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
            <h3 class="text-xl font-bold text-white">Change User Plan</h3>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-gray-50 rounded-xl p-4 space-y-2">
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">User:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Email:</span>
                <span class="text-xs text-gray-900">{{ selectedUser?.email }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Current Plan:</span>
                <span class="text-xs text-gray-900 font-bold">{{ selectedUser?.subscription?.name || 'No Plan' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Current Price:</span>
                <span class="text-xs text-gray-900 font-bold">${{ selectedUser?.subscription?.price || '0.00' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Membership Expires:</span>
                <span class="text-xs text-gray-900">{{ formatDate(selectedUser?.membership_expires_at) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-xs text-gray-600 font-semibold">Wallet Balance:</span>
                <span class="text-xs font-bold" :class="selectedUser?.wallet?.balance > 0 ? 'text-green-600' : 'text-gray-900'">${{ selectedUser?.wallet?.balance || '0.00' }}</span>
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-3 block">Select New Plan</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="subscription in subscriptions"
                  :key="subscription.id"
                  @click="selectedPlanId = subscription.id"
                  :class="{
                    'border-blue-500 bg-blue-50': selectedPlanId === subscription.id,
                    'border-gray-300 hover:border-gray-400': selectedPlanId !== subscription.id,
                  }"
                  class="border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h4 class="font-bold text-gray-900">{{ subscription.name }}</h4>
                      <p class="text-xs text-gray-500">{{ subscription.duration }}</p>
                    </div>
                    <div
                      v-if="selectedPlanId === subscription.id"
                      class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                  <div class="mb-3">
                    <span
                      :class="{
                        'bg-green-100 text-green-800': subscription.is_free_tier,
                        'bg-purple-100 text-purple-800': !subscription.is_free_tier,
                      }"
                      class="px-2 py-1 rounded-full text-xs font-bold"
                    >
                      ${{ subscription.price }}
                    </span>
                  </div>
                  <div v-if="subscription.features" class="space-y-1">
                    <div
                      v-for="(feature, idx) in subscription.features.slice(0, 3)"
                      :key="idx"
                      class="flex items-start gap-2"
                    >
                      <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span class="text-xs text-gray-600">{{ feature }}</span>
                    </div>
                    <p v-if="subscription.features.length > 3" class="text-xs text-gray-400 pl-6">
                      +{{ subscription.features.length - 3 }} more
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="sendNotification"
                v-model="sendNotification"
                class="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
              />
              <label for="sendNotification" class="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                Send notifications to user (Firebase, Email, Database)
              </label>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p class="text-sm text-blue-900">
                <strong>Note:</strong> Changing the plan will:
              </p>
              <ul class="text-sm text-blue-900 mt-2 space-y-1 ml-4 list-disc">
                <li>Update the user's subscription immediately</li>
                <li>Create a transaction record</li>
                <li>If downgrading from a paid plan, credit the prorated difference to their wallet</li>
                <li>Update membership expiration date</li>
              </ul>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showPlanModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="changePlan"
              :disabled="processing || !selectedPlanId || (selectedPlanId === selectedUser?.subscription_id && !isFreeTierPlan(selectedPlanId))"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold disabled:opacity-50"
            >
              {{ processing ? 'Processing...' : (selectedPlanId === selectedUser?.subscription_id ? 'Resubscribe' : 'Change Plan') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showCreateModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
            <h3 class="text-xl font-bold text-white">Create New User</h3>
          </div>

          <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
                <input
                  v-model="createForm.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                <input
                  v-model="createForm.email"
                  type="email"
                  placeholder="john@example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Password</label>
                <input
                  v-model="createForm.password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">User Role</label>
                <select
                  v-model="createForm.role"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="0">User</option>
                  <option value="1">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-sm font-semibold text-gray-700 mb-3 block">Select Subscription Plan</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="subscription in subscriptions"
                  :key="subscription.id"
                  @click="createForm.subscription_id = subscription.id"
                  :class="{
                    'border-blue-500 bg-blue-50': createForm.subscription_id === subscription.id,
                    'border-gray-300 hover:border-gray-400': createForm.subscription_id !== subscription.id,
                  }"
                  class="border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h4 class="font-bold text-gray-900">{{ subscription.name }}</h4>
                      <p class="text-xs text-gray-500">{{ subscription.duration }}</p>
                    </div>
                    <div
                      v-if="createForm.subscription_id === subscription.id"
                      class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                  <div class="mb-3">
                    <span
                      :class="{
                        'bg-green-100 text-green-800': subscription.is_free_tier,
                        'bg-purple-100 text-purple-800': !subscription.is_free_tier,
                      }"
                      class="px-2 py-1 rounded-full text-xs font-bold"
                    >
                      ${{ subscription.price }}
                    </span>
                  </div>
                  <div v-if="subscription.features" class="space-y-1">
                    <div
                      v-for="(feature, idx) in subscription.features.slice(0, 3)"
                      :key="idx"
                      class="flex items-start gap-2"
                    >
                      <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span class="text-xs text-gray-600">{{ feature }}</span>
                    </div>
                    <p v-if="subscription.features.length > 3" class="text-xs text-gray-400 pl-6">
                      +{{ subscription.features.length - 3 }} more
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <p class="text-sm text-blue-900">
                <strong>Note:</strong> User will be created with active status. Widget will be auto-created by the system observer.
              </p>
            </div>

            <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p class="text-sm text-red-900">{{ error }}</p>
            </div>
          </div>

          <div class="p-6 bg-gray-50 flex gap-3">
            <button
              @click="showCreateModal = false"
              :disabled="processing"
              class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              @click="createUser"
              :disabled="processing || !createForm.name || !createForm.email || !createForm.password"
              class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold disabled:opacity-50"
            >
              {{ processing ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const props = defineProps({
  users: Object,
  stats: Object,
  subscriptions: Array,
  filters: Object,
});

const searchQuery = ref(props.filters?.search || '');
const statusFilter = ref(props.filters?.status || 'all');
const roleFilter = ref(props.filters?.role || 'all');
const showRoleModal = ref(false);
const showStatusModal = ref(false);
const showWalletModal = ref(false);
const showCreateModal = ref(false);
const showPlanModal = ref(false);
const selectedUser = ref(null);
const newRole = ref(0);
const walletAction = ref('credit');
const walletAmount = ref('');
const walletDescription = ref('');
const selectedPlanId = ref(null);
const sendNotification = ref(true);
const createForm = ref({
  name: '',
  email: '',
  password: '',
  role: '0',
  subscription_id: null,
});
const processing = ref(false);
const error = ref('');

let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    router.get('/admin/users', {
      search: searchQuery.value,
      status: statusFilter.value,
      role: roleFilter.value,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  }, 500);
};

const handleFilter = () => {
  router.get('/admin/users', {
    search: searchQuery.value,
    status: statusFilter.value,
    role: roleFilter.value,
  }, {
    preserveState: true,
    preserveScroll: true,
  });
};

const openRoleModal = (user) => {
  selectedUser.value = user;
  newRole.value = user.role;
  error.value = '';
  showRoleModal.value = true;
};

const openStatusModal = (user) => {
  selectedUser.value = user;
  error.value = '';
  showStatusModal.value = true;
};

const openWalletModal = (user, action) => {
  selectedUser.value = user;
  walletAction.value = action;
  walletAmount.value = '';
  walletDescription.value = '';
  error.value = '';
  showWalletModal.value = true;
};

const updateRole = async () => {
  if (processing.value || !selectedUser.value) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post(`/admin/users/${selectedUser.value.id}/role`, {
      role: newRole.value,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showRoleModal.value = false;
        selectedUser.value = null;
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to update user role';
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

const updateStatus = async () => {
  if (processing.value || !selectedUser.value) return;

  processing.value = true;
  error.value = '';

  const newStatus = selectedUser.value.status === 'active' ? 'inactive' : 'active';

  try {
    await router.post(`/admin/users/${selectedUser.value.id}/status`, {
      status: newStatus,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showStatusModal.value = false;
        selectedUser.value = null;
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to update user status';
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

const processWalletAction = async () => {
  if (processing.value || !selectedUser.value || !walletAmount.value || walletAmount.value <= 0) return;

  processing.value = true;
  error.value = '';

  const endpoint = walletAction.value === 'credit' ? 'credit' : 'debit';

  try {
    await router.post(`/admin/users/${selectedUser.value.id}/${endpoint}`, {
      amount: walletAmount.value,
      description: walletDescription.value,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showWalletModal.value = false;
        selectedUser.value = null;
        walletAmount.value = '';
        walletDescription.value = '';
      },
      onError: (errors) => {
        error.value = errors.message || `Failed to ${walletAction.value} wallet`;
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

const toggleWidget = async (user) => {
  if (!user.widget || processing.value) return;

  processing.value = true;

  try {
    await router.post(`/admin/users/${user.id}/toggle-widget`, {}, {
      preserveState: false,
      preserveScroll: false,
      onSuccess: () => {
        // Page will reload with the updated widget status
      },
      onError: (errors) => {
        alert('Failed to toggle widget status. Please try again.');
        console.error('Toggle widget error:', errors);
      },
      onFinish: () => {
        processing.value = false;
      },
    });
  } catch (err) {
    console.error('Failed to toggle widget');
    alert('An error occurred while toggling widget status.');
    processing.value = false;
  }
};

const openPlanModal = (user) => {
  selectedUser.value = user;
  selectedPlanId.value = user.subscription_id;
  sendNotification.value = true;
  error.value = '';
  showPlanModal.value = true;
};

const changePlan = async () => {
  if (processing.value || !selectedUser.value || !selectedPlanId.value) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post(`/admin/users/${selectedUser.value.id}/change-plan`, {
      subscription_id: selectedPlanId.value,
      send_notification: sendNotification.value,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showPlanModal.value = false;
        selectedUser.value = null;
        selectedPlanId.value = null;
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to change user plan';
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

const openCreateModal = () => {
  createForm.value = {
    name: '',
    email: '',
    password: '',
    role: '0',
    subscription_id: props.subscriptions?.find(s => s.is_free_tier)?.id || null,
  };
  error.value = '';
  showCreateModal.value = true;
};

const createUser = async () => {
  if (processing.value || !createForm.value.name || !createForm.value.email || !createForm.value.password) return;

  processing.value = true;
  error.value = '';

  try {
    await router.post('/admin/users', {
      name: createForm.value.name,
      email: createForm.value.email,
      password: createForm.value.password,
      role: createForm.value.role,
      subscription_id: createForm.value.subscription_id,
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        showCreateModal.value = false;
        createForm.value = {
          name: '',
          email: '',
          password: '',
          role: '0',
          subscription_id: null,
        };
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to create user';
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

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const isFreeTierPlan = (planId) => {
  const plan = props.subscriptions.find(s => s.id === planId);
  return plan?.is_free_tier || false;
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
