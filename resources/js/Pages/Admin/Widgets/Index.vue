<template>
  <AdminLayout title="Widgets">
    <!-- Stats Cards -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div class="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Overview</h3>
            <p class="text-sm text-gray-600">Widget statistics</p>
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-6 bg-gray-50">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Total</div>
            <div class="text-2xl font-bold text-gray-900">{{ stats.total.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Active</div>
            <div class="text-2xl font-bold text-green-600">{{ stats.active.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Suspended</div>
            <div class="text-2xl font-bold text-orange-600">{{ stats.suspended.toLocaleString() }}</div>
          </div>
          <div class="bg-white rounded-lg p-4 border border-gray-200">
            <div class="text-xs text-gray-600 mb-1">Installed</div>
            <div class="text-2xl font-bold text-purple-600">{{ stats.installed.toLocaleString() }}</div>
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

    <!-- Widgets Table -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="p-4 sm:p-6 border-b border-gray-100">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <h3 class="text-lg font-bold text-gray-900">Widgets</h3>
          <div class="flex gap-2 w-full sm:w-auto">
            <input
              v-model="searchQuery"
              @input="filterWidgets"
              type="search"
              placeholder="Search..."
              class="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>

        <!-- Bulk Actions Bar -->
        <div class="p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
              />
              <span class="text-sm font-semibold text-gray-700">
                {{ selectedWidgets.length > 0 ? `${selectedWidgets.length} selected` : 'Select All' }}
              </span>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <button
                v-if="selectedWidgets.length > 0"
                @click="bulkUpdateWidgets(true)"
                :disabled="updatingAll"
                class="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <svg :class="['w-4 h-4', updatingAll ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ updatingAll ? 'Updating...' : `Update Selected (${selectedWidgets.length}) - Secure` }}
              </button>
              <button
                v-if="selectedWidgets.length > 0"
                @click="bulkUpdateWidgets(false)"
                :disabled="updatingAll"
                class="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <svg :class="['w-4 h-4', updatingAll ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ updatingAll ? 'Updating...' : `Update Selected (${selectedWidgets.length}) - Normal` }}
              </button>
              <button
                @click="updateAllWidgets(true)"
                :disabled="updatingAll"
                class="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <svg :class="['w-4 h-4', updatingAll ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ updatingAll ? 'Updating...' : 'Update All (Secure)' }}
              </button>
              <button
                @click="updateAllWidgets(false)"
                :disabled="updatingAll"
                class="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <svg :class="['w-4 h-4', updatingAll ? 'animate-spin' : '']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                {{ updatingAll ? 'Updating...' : 'Update All (Normal)' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="px-4 sm:px-6 py-3 text-left">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  class="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
              </th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Widget</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Owner</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Conversations</th>
              <th class="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="widget in filteredWidgets"
              :key="widget.id"
              class="hover:bg-gray-50 transition-colors"
              :class="{ 'bg-purple-50': selectedWidgets.includes(widget.id) }"
            >
              <td class="px-4 sm:px-6 py-4">
                <input
                  type="checkbox"
                  :checked="selectedWidgets.includes(widget.id)"
                  @change="toggleWidget(widget.id)"
                  class="w-5 h-5 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                />
              </td>
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {{ (widget.name || 'W').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ widget.name }}</p>
                    <p class="text-xs text-gray-600 truncate">{{ Array.isArray(widget.website) ? widget.website.join(', ') : (widget.website || 'No website') }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 hidden lg:table-cell">
                <div v-if="widget.user">
                  <p class="text-sm font-medium text-gray-900">{{ widget.user.name }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ widget.user.email }}</p>
                </div>
                <span v-else class="text-sm text-gray-500">-</span>
              </td>
              <td class="px-4 sm:px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold w-fit',
                    widget.widget_status === 'active' ? 'bg-green-100 text-green-700' :
                    widget.widget_status === 'suspended' ? 'bg-orange-100 text-orange-700' :
                    widget.widget_status === 'deactivated' ? 'bg-gray-100 text-gray-700' :
                    'bg-red-100 text-red-700'
                  ]">
                    {{ widget.widget_status }}
                  </span>
                  <span v-if="widget.is_installed" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 w-fit">
                    Installed
                  </span>
                </div>
              </td>
              <td class="px-4 sm:px-6 py-4 hidden md:table-cell">
                <div class="text-sm font-medium text-gray-900">{{ widget.conversations_count || 0 }}</div>
                <div class="text-xs text-green-600">{{ widget.open_conversations_count || 0 }} open</div>
              </td>
              <td class="px-4 sm:px-6 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    @click="showDetails(widget)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  <button
                    @click="updateWidget(widget.id, false)"
                    :disabled="updatingWidget === widget.id"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Update"
                  >
                    <svg v-if="updatingWidget !== widget.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <svg v-else class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </button>
                  <button
                    @click="updateWidget(widget.id, true)"
                    :disabled="updatingWidget === widget.id"
                    class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Update (Secure)"
                  >
                    <svg v-if="updatingWidget !== widget.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <svg v-else class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </button>
                  <button
                    v-if="widget.widget_status !== 'deactivated'"
                    @click="markAsInactive(widget.id)"
                    :disabled="updatingStatus === widget.id"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Deactivate"
                  >
                    <svg v-if="updatingStatus !== widget.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                    <svg v-else class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </button>
                  <button
                    v-if="widget.widget_status === 'deactivated'"
                    @click="reactivateWidget(widget.id)"
                    :disabled="updatingStatus === widget.id"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Reactivate"
                  >
                    <svg v-if="updatingStatus !== widget.id" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <svg v-else class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredWidgets.length === 0">
              <td colspan="6" class="px-6 py-12 text-center">
                <div class="flex flex-col items-center gap-2">
                  <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                  </svg>
                  <p class="text-gray-500 font-medium">{{ searchQuery ? 'No matching widgets' : 'No widgets yet' }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="p-4 sm:p-6 border-t border-gray-100 bg-gray-50">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="text-sm text-gray-600">
            Showing <span class="font-semibold text-gray-900">{{ widgets.from || 0 }}</span> to <span class="font-semibold text-gray-900">{{ widgets.to || 0 }}</span> of <span class="font-semibold text-gray-900">{{ widgets.total }}</span>
          </div>
          <div class="flex gap-2">
            <Link
              v-if="widgets.prev_page_url"
              :href="widgets.prev_page_url"
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700"
            >
              Previous
            </Link>
            <Link
              v-if="widgets.next_page_url"
              :href="widgets.next_page_url"
              class="px-3 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700"
            >
              Next
            </Link>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Details Modal -->
    <div v-if="showModal" @click="closeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div @click.stop class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div class="p-4 sm:p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900">Widget Details</h3>
            <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="selectedWidget" class="p-4 sm:p-6 space-y-4 overflow-y-auto">
          <!-- Widget Info -->
          <div>
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">Information</h4>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div class="flex justify-between gap-2">
                <span class="text-gray-600">Name:</span>
                <span class="font-semibold text-gray-900 break-words">{{ selectedWidget.name }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-gray-600">Website:</span>
                <span class="font-semibold text-gray-900 break-all">{{ Array.isArray(selectedWidget.website) ? selectedWidget.website.join(', ') : (selectedWidget.website || 'N/A') }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-gray-600">Status:</span>
                <span :class="[
                  'font-semibold',
                  selectedWidget.widget_status === 'active' ? 'text-green-600' :
                  selectedWidget.widget_status === 'suspended' ? 'text-orange-600' :
                  'text-gray-600'
                ]">{{ selectedWidget.widget_status }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-gray-600">Widget Key:</span>
                <span class="font-mono text-xs text-gray-900 break-all">{{ selectedWidget.widget_key }}</span>
              </div>
            </div>
          </div>

          <!-- Embed Code -->
          <div>
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">Embed Code</h4>
            <div class="relative">
              <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">{{ selectedWidget.embed_code }}</pre>
              <button
                @click="copyToClipboard(selectedWidget.embed_code)"
                class="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
              >
                {{ copied ? 'Copied!' : 'Copy' }}
              </button>
            </div>
          </div>

          <!-- Owner Info -->
          <div v-if="selectedWidget.user">
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">Owner</h4>
            <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div class="flex justify-between gap-2">
                <span class="text-gray-600">Name:</span>
                <span class="font-semibold text-gray-900">{{ selectedWidget.user.name }}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-gray-600">Email:</span>
                <span class="font-semibold text-gray-900 break-all">{{ selectedWidget.user.email }}</span>
              </div>
            </div>
          </div>

          <!-- Stats -->
          <div>
            <h4 class="text-xs font-semibold text-gray-600 uppercase mb-2">Statistics</h4>
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ selectedWidget.conversations_count || 0 }}</div>
                <div class="text-xs text-gray-600 mt-1">Conversations</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-600">{{ selectedWidget.open_conversations_count || 0 }}</div>
                <div class="text-xs text-gray-600 mt-1">Open</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Progress Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showProgressModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          @click.self="() => {}"
        >
          <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
            <div class="p-6 bg-gradient-to-r from-purple-500 to-purple-600">
              <div class="flex items-center gap-3">
                <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <svg class="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Updating Widgets</h3>
                  <p class="text-purple-100 text-sm">Please wait...</p>
                </div>
              </div>
            </div>

            <div class="p-8">
              <!-- Progress Bar -->
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-semibold text-gray-700">Progress</span>
                  <span class="text-2xl font-bold text-purple-600">{{ updateProgress }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                  <div
                    class="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-300 ease-out flex items-center justify-end px-2"
                    :style="{ width: updateProgress + '%' }"
                  >
                    <div v-if="updateProgress > 10" class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <!-- Status Message -->
              <div class="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-3">
                <p class="text-sm text-gray-600 text-center font-medium">
                  {{ updateStatusMessage }}
                </p>
              </div>

              <!-- Processing Details -->
              <div v-if="updateProgress > 0" class="text-center">
                <p class="text-xs text-gray-500">
                  Updated {{ Math.floor((updateProgress / 100) * updateTotal) }} of {{ updateTotal }} widgets
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { Link, router } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';
import axios from 'axios';

const props = defineProps({
  widgets: Object,
  stats: Object,
});

const updatingWidget = ref(null);
const updatingStatus = ref(null);
const updatingAll = ref(false);
const showModal = ref(false);
const selectedWidget = ref(null);
const copied = ref(false);
const searchQuery = ref('');
const selectedWidgets = ref([]);
const showProgressModal = ref(false);
const updateProgress = ref(0);
const updateStatusMessage = ref('');
const updateTotal = ref(0);

// Toast notification
const toast = reactive({
  show: false,
  type: 'success',
  message: '',
});

const showToast = (message, type = 'success') => {
  toast.show = true;
  toast.type = type;
  toast.message = message;

  setTimeout(() => {
    toast.show = false;
  }, 5000);
};

// Computed
const allSelected = computed(() => {
  return filteredWidgets.value.length > 0 && selectedWidgets.value.length === filteredWidgets.value.length;
});

// Filtered widgets based on search
const filteredWidgets = computed(() => {
  if (!searchQuery.value) {
    return props.widgets.data;
  }

  const query = searchQuery.value.toLowerCase();
  return props.widgets.data.filter(widget => {
    const websiteMatch = Array.isArray(widget.website)
      ? widget.website.some(url => url.toLowerCase().includes(query))
      : (widget.website && widget.website.toLowerCase().includes(query));

    return widget.name.toLowerCase().includes(query) ||
           websiteMatch ||
           widget.widget_key.toLowerCase().includes(query) ||
           (widget.user && (widget.user.name.toLowerCase().includes(query) || widget.user.email.toLowerCase().includes(query)));
  });
});

const filterWidgets = () => {
  // Trigger reactivity
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedWidgets.value = [];
  } else {
    selectedWidgets.value = filteredWidgets.value.map(w => w.id);
  }
};

const toggleWidget = (id) => {
  const index = selectedWidgets.value.indexOf(id);
  if (index > -1) {
    selectedWidgets.value.splice(index, 1);
  } else {
    selectedWidgets.value.push(id);
  }
};

const bulkUpdateWidgets = async (obfuscate) => {
  if (selectedWidgets.value.length === 0) return;

  const message = obfuscate
    ? `Update ${selectedWidgets.value.length} selected widgets with secure code?\n\nThis will:\n- Regenerate selected widgets with obfuscation\n- Apply latest template changes\n- Update deployed widget files`
    : `Update ${selectedWidgets.value.length} selected widgets with normal code?\n\nThis will:\n- Regenerate selected widgets without obfuscation\n- Apply latest template changes\n- Update deployed widget files`;

  if (!confirm(message)) {
    return;
  }

  updateTotal.value = selectedWidgets.value.length;
  showProgressModal.value = true;
  updatingAll.value = true;
  updateProgress.value = 0;
  updateStatusMessage.value = 'Preparing to update widgets...';

  // Start progress animation
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    if (currentProgress < 80) {
      currentProgress += 3;
      updateProgress.value = currentProgress;
      const updatedCount = Math.floor((currentProgress / 100) * updateTotal.value);
      if (currentProgress < 30) {
        updateStatusMessage.value = 'Preparing widget templates...';
      } else if (currentProgress < 60) {
        updateStatusMessage.value = `Generating widgets... (${updatedCount}/${updateTotal.value})`;
      } else {
        updateStatusMessage.value = obfuscate
          ? `Obfuscating JavaScript... (${updatedCount}/${updateTotal.value})`
          : `Compiling widgets... (${updatedCount}/${updateTotal.value})`;
      }
    }
  }, 200);

  try {
    await axios.post('/admin/widgets/bulk-update', {
      widget_ids: selectedWidgets.value,
      obfuscate: obfuscate
    });

    clearInterval(progressInterval);
    updateProgress.value = 100;
    updateStatusMessage.value = 'All widgets updated successfully!';

    setTimeout(() => {
      showProgressModal.value = false;
      selectedWidgets.value = [];
      router.reload({ only: ['widgets'] });
    }, 1500);
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Failed to update widgets:', error);
    showToast('Failed to update widgets', 'error');
    showProgressModal.value = false;
  } finally {
    updatingAll.value = false;
  }
};

const updateWidget = async (widgetId, obfuscate) => {
  if (updatingWidget.value) return;

  const message = obfuscate
    ? 'Update widget with secure code?\n\nThis will:\n- Regenerate widget with obfuscation\n- Apply latest template changes\n- Update deployed widget file'
    : 'Update widget with normal code?\n\nThis will:\n- Regenerate widget without obfuscation\n- Apply latest template changes\n- Update deployed widget file';

  if (!confirm(message)) {
    return;
  }

  updatingWidget.value = widgetId;

  router.post(`/admin/widgets/${widgetId}/update`, {
    obfuscate: obfuscate
  }, {
    onSuccess: () => {
      updatingWidget.value = null;
      showToast('Widget updated successfully!', 'success');
    },
    onError: () => {
      updatingWidget.value = null;
      showToast('Failed to update widget', 'error');
    }
  });
};

const markAsInactive = async (widgetId) => {
  if (updatingStatus.value) return;

  if (!confirm('Deactivate this widget?\n\nThis will:\n- Stop the widget from working\n- Make it invisible on the website\n- Can be reactivated later')) {
    return;
  }

  updatingStatus.value = widgetId;

  router.post(`/admin/widgets/${widgetId}/status`, {
    status: 'deactivated'
  }, {
    onSuccess: () => {
      updatingStatus.value = null;
      showToast('Widget deactivated successfully!', 'success');
    },
    onError: () => {
      updatingStatus.value = null;
      showToast('Failed to deactivate widget', 'error');
    }
  });
};

const reactivateWidget = async (widgetId) => {
  if (updatingStatus.value) return;

  if (!confirm('Reactivate this widget?\n\nThis will:\n- Make the widget live again\n- Start working on the website\n- Resume accepting conversations')) {
    return;
  }

  updatingStatus.value = widgetId;

  router.post(`/admin/widgets/${widgetId}/status`, {
    status: 'active'
  }, {
    onSuccess: () => {
      updatingStatus.value = null;
      showToast('Widget reactivated successfully!', 'success');
    },
    onError: () => {
      updatingStatus.value = null;
      showToast('Failed to reactivate widget', 'error');
    }
  });
};

const updateAllWidgets = async (obfuscate) => {
  if (updatingAll.value) return;

  const message = obfuscate
    ? 'Update ALL widgets with secure code?\n\nThis will:\n- Regenerate ALL widgets with obfuscation\n- Apply latest template to all\n- Update all deployed widget files\n\n⚠️ This affects ALL widgets!'
    : 'Update ALL widgets with normal code?\n\nThis will:\n- Regenerate ALL widgets without obfuscation\n- Apply latest template to all\n- Update all deployed widget files\n\n⚠️ This affects ALL widgets!';

  if (!confirm(message)) {
    return;
  }

  updateTotal.value = props.widgets.total;
  showProgressModal.value = true;
  updatingAll.value = true;
  updateProgress.value = 0;
  updateStatusMessage.value = 'Preparing to update all widgets...';

  // Start progress animation
  let currentProgress = 0;
  const progressInterval = setInterval(() => {
    if (currentProgress < 80) {
      currentProgress += 2;
      updateProgress.value = currentProgress;
      const updatedCount = Math.floor((currentProgress / 100) * updateTotal.value);
      if (currentProgress < 30) {
        updateStatusMessage.value = 'Preparing widget templates...';
      } else if (currentProgress < 60) {
        updateStatusMessage.value = `Generating widgets... (${updatedCount}/${updateTotal.value})`;
      } else {
        updateStatusMessage.value = obfuscate
          ? `Obfuscating JavaScript... (${updatedCount}/${updateTotal.value})`
          : `Compiling widgets... (${updatedCount}/${updateTotal.value})`;
      }
    }
  }, 300);

  try {
    await axios.post('/admin/widgets/update-all', {
      obfuscate: obfuscate
    });

    clearInterval(progressInterval);
    updateProgress.value = 100;
    updateStatusMessage.value = 'All widgets updated successfully!';

    setTimeout(() => {
      showProgressModal.value = false;
      router.reload({ only: ['widgets'] });
    }, 1500);
  } catch (error) {
    clearInterval(progressInterval);
    console.error('Failed to update widgets:', error);
    showToast('Failed to update widgets', 'error');
    showProgressModal.value = false;
  } finally {
    updatingAll.value = false;
  }
};

const showDetails = (widget) => {
  selectedWidget.value = widget;
  showModal.value = true;
  copied.value = false;
};

const closeModal = () => {
  showModal.value = false;
  selectedWidget.value = null;
  copied.value = false;
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
