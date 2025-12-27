<template>
  <AdminLayout title="App Version Management">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Total</p>
              <h3 class="text-2xl font-bold text-gray-900">{{ stats.total }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Active</p>
              <h3 class="text-2xl font-bold text-green-600">{{ stats.active }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Android</p>
              <h3 class="text-2xl font-bold text-emerald-600">{{ stats.android }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">iOS</p>
              <h3 class="text-2xl font-bold text-gray-600">{{ stats.ios }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div class="p-5">
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-600 font-medium">Mandatory</p>
              <h3 class="text-2xl font-bold text-red-600">{{ stats.mandatory }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 mb-2 block">Platform</label>
            <select
              v-model="platformFilter"
              @change="handleFilter"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Platforms</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
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
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTItMTh2Mmg0di0yaC00ek0zMiAxOHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        <div class="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-4 flex-1">
            <div class="flex-shrink-0">
              <div class="p-3 sm:p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg ring-2 ring-white/30">
                <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">App Versions</h3>
              <p class="text-sm sm:text-base text-blue-100 leading-relaxed">Manage mobile app versions and updates</p>
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
              <span class="text-sm sm:text-base">Upload Version</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b-2 border-blue-200">
            <tr>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Version</span>
              </th>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Platform</span>
              </th>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Download</span>
              </th>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Changelog</span>
              </th>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Release Date</span>
              </th>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Status</span>
              </th>
              <th class="px-6 py-5 text-left">
                <span class="text-xs font-bold text-gray-800 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="version in versions.data"
              :key="version.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="text-sm font-bold text-gray-900">v{{ version.version_name }}</div>
                <div class="text-xs text-gray-500">Code: {{ version.version_code }}</div>
              </td>

              <td class="px-6 py-4">
                <span
                  :class="{
                    'bg-emerald-100 text-emerald-800': version.platform === 'android',
                    'bg-gray-100 text-gray-800': version.platform === 'ios',
                  }"
                  class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                >
                  {{ version.platform }}
                </span>
              </td>

              <td class="px-6 py-4">
                <a
                  v-if="version.download_url"
                  :href="version.download_url"
                  target="_blank"
                  class="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download
                </a>
                <span v-else class="text-xs text-gray-400">No file</span>
              </td>

              <td class="px-6 py-4">
                <div class="text-xs text-gray-700 max-w-xs">
                  <div v-if="version.changelog" class="whitespace-pre-line line-clamp-3">{{ version.changelog }}</div>
                  <span v-else class="text-gray-400">No changelog</span>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="text-xs text-gray-600">{{ formatDate(version.release_date) }}</div>
              </td>

              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': version.is_active,
                      'bg-gray-100 text-gray-800': !version.is_active,
                    }"
                    class="px-2 py-0.5 rounded-full text-xs font-bold inline-block"
                  >
                    {{ version.is_active ? 'Active' : 'Inactive' }}
                  </span>
                  <span
                    v-if="version.is_mandatory"
                    class="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-bold inline-block"
                  >
                    Mandatory
                  </span>
                </div>
              </td>

              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="openEditModal(version)"
                    class="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg group"
                    title="Edit"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>

                  <button
                    @click="toggleActive(version)"
                    :disabled="processing"
                    :class="version.is_active ? 'from-gray-500 to-gray-600' : 'from-green-500 to-green-600'"
                    class="p-2 bg-gradient-to-r text-white rounded-lg transition-all shadow-md hover:shadow-lg group disabled:opacity-50"
                    :title="version.is_active ? 'Deactivate' : 'Activate'"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>

                  <button
                    @click="toggleMandatory(version)"
                    :disabled="processing"
                    :class="version.is_mandatory ? 'from-orange-500 to-orange-600' : 'from-red-500 to-red-600'"
                    class="p-2 bg-gradient-to-r text-white rounded-lg transition-all shadow-md hover:shadow-lg group disabled:opacity-50"
                    :title="version.is_mandatory ? 'Remove Mandatory' : 'Make Mandatory'"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                  </button>

                  <button
                    @click="deleteVersion(version)"
                    :disabled="processing"
                    class="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg group disabled:opacity-50"
                    title="Delete"
                  >
                    <svg class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="versions.data.length === 0" class="text-center py-16">
          <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <p class="text-gray-500 text-lg font-medium">No app versions found</p>
          <p class="text-gray-400 text-sm">Upload your first version to get started</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="versions.data.length > 0" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            Showing {{ versions.from }} to {{ versions.to }} of {{ versions.total }} versions
          </div>
          <div class="flex gap-2">
            <Link
              v-for="link in versions.links"
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

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showModal = false"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
            <h3 class="text-xl font-bold text-white">{{ editingVersion ? 'Edit' : 'Upload' }} App Version</h3>
          </div>

          <form @submit.prevent="submitForm" enctype="multipart/form-data">
            <div class="p-6 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Version Code *</label>
                  <input
                    v-model="form.version_code"
                    type="number"
                    min="1"
                    required
                    placeholder="1"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p class="text-xs text-gray-500 mt-1">Integer version (e.g., 1, 2, 3)</p>
                </div>

                <div>
                  <label class="text-sm font-semibold text-gray-700 mb-2 block">Version Name *</label>
                  <input
                    v-model="form.version_name"
                    type="text"
                    required
                    placeholder="1.0.0"
                    class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <p class="text-xs text-gray-500 mt-1">Display version (e.g., 1.0.0)</p>
                </div>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Platform *</label>
                <select
                  v-model="form.platform"
                  required
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Upload APK/IPA File</label>
                <input
                  ref="fileInput"
                  type="file"
                  accept=".apk,.ipa"
                  @change="handleFileChange"
                  :disabled="uploading || !form.version_code || !form.platform"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p class="text-xs text-gray-500 mt-1">
                  <span v-if="!form.version_code || !form.platform" class="text-orange-600 font-semibold">⚠️ Fill Version Code and Platform first</span>
                  <span v-else>Max 500MB - Uploads instantly to Backblaze</span>
                </p>

                <!-- Upload Progress Bar -->
                <div v-if="uploading" class="mt-3">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-semibold text-blue-600">Uploading to Backblaze...</span>
                    <span class="text-xs font-semibold text-blue-600">{{ uploadProgress }}%</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      class="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
                      :style="{ width: uploadProgress + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- Success Message -->
                <div v-if="form.download_url && !uploading" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div class="flex items-start gap-2">
                    <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div class="flex-1">
                      <p class="text-xs font-semibold text-green-800">File uploaded successfully!</p>
                      <p class="text-xs text-green-600 mt-0.5 break-all">{{ form.download_url }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Download URL</label>
                <input
                  v-model="form.download_url"
                  type="url"
                  placeholder="https://example.com/app.apk (or upload file above)"
                  :readonly="uploading"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p class="text-xs text-gray-500 mt-1">Auto-filled after file upload, or enter manually</p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Changelog</label>
                <textarea
                  v-model="form.changelog"
                  rows="6"
                  placeholder="Enter each change on a new line, bullet points will be added automatically&#10;&#10;Fixed login issues&#10;Added dark mode&#10;Improved performance"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">Each line will automatically become a bullet point</p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Release Date</label>
                <input
                  v-model="form.release_date"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div class="flex items-center gap-6">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span class="text-sm font-semibold text-gray-700">Active</span>
                </label>

                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="form.is_mandatory"
                    type="checkbox"
                    class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span class="text-sm font-semibold text-gray-700">Mandatory Update</span>
                </label>
              </div>

              <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p class="text-sm text-red-900">{{ error }}</p>
              </div>
            </div>

            <div class="p-6 bg-gray-50 flex gap-3">
              <button
                type="button"
                @click="showModal = false"
                :disabled="processing || uploading"
                class="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="processing || uploading"
                class="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md font-semibold disabled:opacity-50"
              >
                <span v-if="uploading">Uploading to Backblaze...</span>
                <span v-else-if="processing">Saving...</span>
                <span v-else>{{ editingVersion ? 'Update Version' : 'Save Version' }}</span>
              </button>
            </div>
          </form>
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
  versions: Object,
  stats: Object,
  filters: Object,
});

const platformFilter = ref(props.filters?.platform || 'all');
const statusFilter = ref(props.filters?.status || 'all');
const showModal = ref(false);
const editingVersion = ref(null);
const processing = ref(false);
const uploading = ref(false);
const uploadProgress = ref(0);
const error = ref('');
const fileInput = ref(null);

const form = ref({
  version_code: '',
  version_name: '',
  platform: 'android',
  apk_file: null,
  download_url: '',
  changelog: '',
  is_mandatory: false,
  is_active: true,
  release_date: '',
});

const handleFilter = () => {
  router.get('/admin/app-versions', {
    platform: platformFilter.value,
    status: statusFilter.value,
  }, {
    preserveState: true,
    preserveScroll: true,
  });
};

const openCreateModal = () => {
  editingVersion.value = null;
  form.value = {
    version_code: '',
    version_name: '',
    platform: 'android',
    apk_file: null,
    download_url: '',
    changelog: '',
    is_mandatory: false,
    is_active: true,
    release_date: '',
  };
  error.value = '';
  showModal.value = true;
};

const openEditModal = (version) => {
  editingVersion.value = version;
  form.value = {
    version_code: version.version_code,
    version_name: version.version_name,
    platform: version.platform,
    apk_file: null,
    download_url: version.download_url,
    changelog: version.changelog,
    is_mandatory: version.is_mandatory,
    is_active: version.is_active,
    release_date: version.release_date ? version.release_date.split('T')[0] : '',
  };
  error.value = '';
  showModal.value = true;
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate platform and version_code are filled
  if (!form.value.platform) {
    error.value = 'Please select a platform first';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    return;
  }

  if (!form.value.version_code) {
    error.value = 'Please enter version code first';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;
  error.value = '';

  try {
    const formData = new FormData();
    formData.append('apk_file', file);
    formData.append('platform', form.value.platform);
    formData.append('version_code', form.value.version_code);

    console.log('Starting upload...', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      platform: form.value.platform,
      versionCode: form.value.version_code
    });

    // Upload to Backblaze using AJAX
    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfToken = csrfTokenMeta ? csrfTokenMeta.getAttribute('content') : '';

    if (!csrfToken) {
      throw new Error('CSRF token not found. Please refresh the page and try again.');
    }

    console.log('CSRF token found:', csrfToken.substring(0, 10) + '...');

    // Use XMLHttpRequest for progress tracking
    await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          uploadProgress.value = Math.round((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              form.value.download_url = data.url;
              uploadProgress.value = 100;
              setTimeout(() => {
                uploading.value = false;
                uploadProgress.value = 0;
              }, 1000);
              resolve(data);
            } else {
              reject(new Error(data.message || 'Upload failed'));
            }
          } catch (e) {
            reject(new Error('Invalid server response'));
          }
        } else if (xhr.status === 419) {
          reject(new Error('Session expired (CSRF token mismatch). Please refresh the page and try again.'));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.open('POST', '/admin/app-versions/upload-file');
      xhr.setRequestHeader('X-CSRF-TOKEN', csrfToken);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(formData);
    });
  } catch (err) {
    console.error('Upload error:', err);

    // Provide user-friendly error messages
    let errorMessage = err.message;
    if (err.message.includes('CSRF') || err.message.includes('419')) {
      errorMessage = 'Session expired. Please refresh the page (F5 or Ctrl+R) and try uploading again.';
    } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection and try again.';
    }

    error.value = errorMessage || 'File upload failed. Please check browser console for details.';
    uploading.value = false;
    uploadProgress.value = 0;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const submitForm = async () => {
  if (processing.value || uploading.value) return;

  processing.value = true;
  error.value = '';

  // Validate required fields
  if (!form.value.download_url) {
    error.value = 'Please upload an APK file or enter a download URL';
    processing.value = false;
    return;
  }

  const formData = new FormData();
  formData.append('version_code', form.value.version_code);
  formData.append('version_name', form.value.version_name);
  formData.append('platform', form.value.platform);
  // Don't send apk_file since it's already uploaded to Backblaze
  // Just send the download_url which is already filled
  formData.append('download_url', form.value.download_url);
  if (form.value.changelog) {
    formData.append('changelog', form.value.changelog);
  }
  formData.append('is_mandatory', form.value.is_mandatory ? '1' : '0');
  formData.append('is_active', form.value.is_active ? '1' : '0');
  if (form.value.release_date) {
    formData.append('release_date', form.value.release_date);
  }

  if (editingVersion.value) {
    formData.append('_method', 'PUT');
  }

  const url = editingVersion.value
    ? `/admin/app-versions/${editingVersion.value.id}`
    : '/admin/app-versions';

  try {
    await router.post(url, formData, {
      preserveState: false,
      preserveScroll: false,
      onSuccess: () => {
        showModal.value = false;
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      },
      onError: (errors) => {
        error.value = errors.message || 'Failed to save version';
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

const toggleActive = async (version) => {
  const action = version.is_active ? 'deactivate' : 'activate';
  const message = version.is_active
    ? `Deactivate version ${version.version_name}?\n\nThis version will no longer be available for download. Users won't see this update.`
    : `Activate version ${version.version_name}?\n\nThis version will be available for download. Users will be able to update to this version.`;

  if (!confirm(message)) {
    return;
  }

  if (processing.value) return;

  processing.value = true;

  try {
    await router.post(`/admin/app-versions/${version.id}/toggle-active`, {}, {
      preserveState: false,
      onFinish: () => {
        processing.value = false;
      },
    });
  } catch (err) {
    processing.value = false;
  }
};

const toggleMandatory = async (version) => {
  const message = version.is_mandatory
    ? `Remove mandatory update for version ${version.version_name}?\n\nUsers will be able to skip this update and continue using older versions.`
    : `Make version ${version.version_name} a MANDATORY update?\n\n⚠️ WARNING: Users will be FORCED to update to this version before they can use the app. They cannot skip or dismiss this update.`;

  if (!confirm(message)) {
    return;
  }

  if (processing.value) return;

  processing.value = true;

  try {
    await router.post(`/admin/app-versions/${version.id}/toggle-mandatory`, {}, {
      preserveState: false,
      onFinish: () => {
        processing.value = false;
      },
    });
  } catch (err) {
    processing.value = false;
  }
};

const deleteVersion = async (version) => {
  const message = `Delete version ${version.version_name}?\n\n⚠️ WARNING: This action CANNOT be undone!\n\nThe version will be permanently removed from the database. Users will no longer see this version in the update list.`;

  if (!confirm(message)) {
    return;
  }

  if (processing.value) return;

  processing.value = true;

  try {
    await router.delete(`/admin/app-versions/${version.id}`, {
      preserveState: false,
      onFinish: () => {
        processing.value = false;
      },
    });
  } catch (err) {
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

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
