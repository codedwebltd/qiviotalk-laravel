<template>
  <AdminLayout title="Global Settings">
    <div class="max-w-7xl mx-auto">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">Global Settings</h1>
        <p class="text-gray-600 mt-2">Manage your application's global configuration</p>
      </div>

      <form @submit.prevent="updateSettings">
        <!-- System Settings -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-slate-500 to-slate-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">System Settings</h2>
                <p class="text-slate-100 text-sm">Configure system-wide settings</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="form.cron_job_enabled"
                  type="checkbox"
                  class="w-5 h-5 text-slate-600 bg-white border-gray-300 rounded focus:ring-slate-500 focus:ring-2"
                />
                <div>
                  <span class="text-sm font-semibold text-gray-700">Enable Scheduled Tasks (Cron Jobs)</span>
                  <p class="text-xs text-gray-500 mt-0.5">Enables automatic daily tasks like subscription renewals and widget cleanup</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Cryptomus Payment Settings -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Cryptomus Payment Settings</h2>
                <p class="text-blue-100 text-sm">Configure payment gateway credentials</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Merchant ID</label>
                <input
                  v-model="form.cryptomus_merchant_id"
                  type="text"
                  placeholder="Enter Cryptomus Merchant ID"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">API Key</label>
                <input
                  v-model="form.cryptomus_api_key"
                  type="text"
                  placeholder="Enter Cryptomus API Key"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Support Settings -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Support Settings</h2>
                <p class="text-purple-100 text-sm">Configure support contact information</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Support Email</label>
                <input
                  v-model="form.support_email"
                  type="email"
                  placeholder="support@example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Support Phone</label>
                <input
                  v-model="form.support_phone"
                  type="text"
                  placeholder="+1 234 567 8900"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- AI Configuration -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-emerald-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">AI Configuration</h2>
                <p class="text-emerald-100 text-sm">Configure AI and Groq settings</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="mb-4">
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  v-model="form.ai_enabled"
                  type="checkbox"
                  class="w-5 h-5 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                />
                <span class="text-sm font-semibold text-gray-700">Enable AI Features</span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Groq API Key</label>
                <input
                  v-model="form.groq_api_key"
                  type="text"
                  placeholder="Enter Groq API Key"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Groq Model</label>
                <select
                  v-model="form.groq_model"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant</option>
                  <option value="llama-3.1-70b-versatile">Llama 3.1 70B Versatile</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Max Tokens</label>
                <input
                  v-model.number="form.groq_max_tokens"
                  type="number"
                  min="100"
                  max="5000"
                  placeholder="500"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Temperature (0-2)</label>
                <input
                  v-model.number="form.groq_temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  placeholder="0.7"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Max AI Responses Per Conversation</label>
                <input
                  v-model.number="form.ai_max_responses_per_conversation"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="6"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <p class="text-xs text-gray-500 mt-1">AI stops after this many responses and waits for human agent</p>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Agent Wait Time (minutes)</label>
                <input
                  v-model.number="form.ai_agent_wait_minutes"
                  type="number"
                  min="1"
                  max="1440"
                  placeholder="30"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
                <p class="text-xs text-gray-500 mt-1">AI resumes if agent doesn't respond within this time</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Mail Settings -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Mail Settings</h2>
                <p class="text-orange-100 text-sm">Configure SMTP mail settings</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Mail Mailer</label>
                <input
                  v-model="form.mail_mailer"
                  type="text"
                  placeholder="smtp"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Mail Host</label>
                <input
                  v-model="form.mail_host"
                  type="text"
                  placeholder="smtp.example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Mail Port</label>
                <input
                  v-model.number="form.mail_port"
                  type="number"
                  placeholder="587"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Mail Encryption</label>
                <select
                  v-model="form.mail_encryption"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="">None</option>
                </select>
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Mail Username</label>
                <input
                  v-model="form.mail_username"
                  type="text"
                  placeholder="username@example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Mail Password</label>
                <input
                  v-model="form.mail_password"
                  type="password"
                  placeholder="Enter mail password"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">From Address</label>
                <input
                  v-model="form.mail_from_address"
                  type="email"
                  placeholder="noreply@example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">From Name</label>
                <input
                  v-model="form.mail_from_name"
                  type="text"
                  placeholder="Your App Name"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Website Information -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-indigo-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Website Information</h2>
                <p class="text-indigo-100 text-sm">Configure application details</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Application Name</label>
                <input
                  v-model="form.app_name"
                  type="text"
                  placeholder="Your App Name"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Application URL</label>
                <input
                  v-model="form.app_url"
                  type="url"
                  placeholder="https://example.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div class="md:col-span-2">
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Application Description</label>
                <textarea
                  v-model="form.app_description"
                  rows="3"
                  placeholder="Describe your application..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Firebase Settings -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-red-500 to-red-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Firebase Settings</h2>
                <p class="text-red-100 text-sm">Configure Firebase credentials</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">API Key</label>
                <input
                  v-model="form.firebase_api_key"
                  type="text"
                  placeholder="Firebase API Key"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Auth Domain</label>
                <input
                  v-model="form.firebase_auth_domain"
                  type="text"
                  placeholder="your-app.firebaseapp.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Project ID</label>
                <input
                  v-model="form.firebase_project_id"
                  type="text"
                  placeholder="your-project-id"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Storage Bucket</label>
                <input
                  v-model="form.firebase_storage_bucket"
                  type="text"
                  placeholder="your-app.appspot.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Messaging Sender ID</label>
                <input
                  v-model="form.firebase_messaging_sender_id"
                  type="text"
                  placeholder="123456789"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">App ID</label>
                <input
                  v-model="form.firebase_app_id"
                  type="text"
                  placeholder="1:123456789:web:abc123"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Measurement ID</label>
                <input
                  v-model="form.firebase_measurement_id"
                  type="text"
                  placeholder="G-ABC123DEF"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Database URL</label>
                <input
                  v-model="form.firebase_database_url"
                  type="url"
                  placeholder="https://your-app.firebaseio.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
              </div>

              <div class="md:col-span-2">
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Firebase Credentials Path (Service Account JSON)</label>
                <input
                  v-model="form.firebase_credentials_path"
                  type="text"
                  placeholder="/home/user/public_html/storage/app/firebase/credentials.json"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm font-mono"
                />
                <p class="text-xs text-gray-500 mt-1">⚠️ System uses ONLY this path for Firebase Admin SDK. Other fields above are optional (for frontend config).</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Backblaze B2 Storage Settings -->
        <div class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 mb-6">
          <div class="p-6 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-cyan-600">
            <div class="flex items-center gap-3">
              <div class="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/>
                </svg>
              </div>
              <div>
                <h2 class="text-lg font-bold text-white">Backblaze B2 Storage Settings</h2>
                <p class="text-cyan-100 text-sm">Configure file storage credentials</p>
              </div>
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Key ID</label>
                <input
                  v-model="form.b2_key_id"
                  type="text"
                  placeholder="Enter B2 Key ID"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Application Key</label>
                <input
                  v-model="form.b2_application_key"
                  type="text"
                  placeholder="Enter B2 Application Key"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Bucket Name</label>
                <input
                  v-model="form.b2_bucket_name"
                  type="text"
                  placeholder="your-bucket-name"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label class="text-sm font-semibold text-gray-700 mb-2 block">Bucket ID</label>
                <input
                  v-model="form.b2_bucket_id"
                  type="text"
                  placeholder="Enter Bucket ID"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm font-mono"
                />
              </div>

              <div class="md:col-span-2">
                <label class="text-sm font-semibold text-gray-700 mb-2 block">API URL</label>
                <input
                  v-model="form.b2_api_url"
                  type="url"
                  placeholder="https://api.backblazeb2.com"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="processing"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ processing ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Toast Notification -->
    <Transition name="slide-fade">
      <div v-if="showToast" :class="[
        'fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3',
        toastType === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      ]">
        <svg v-if="toastType === 'success'" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        <span class="font-semibold">{{ toastMessage }}</span>
      </div>
    </Transition>
  </AdminLayout>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>

<script setup>
import { ref, watch } from 'vue';
import { router, usePage } from '@inertiajs/vue3';
import AdminLayout from '@/Layouts/AdminLayout.vue';

const page = usePage();

const props = defineProps({
  settings: Object,
});

const form = ref({
  // System
  cron_job_enabled: props.settings?.cron_job_enabled ?? false,

  // Cryptomus
  cryptomus_merchant_id: props.settings?.cryptomus_merchant_id || '',
  cryptomus_api_key: props.settings?.cryptomus_api_key || '',

  // Support
  support_email: props.settings?.support_email || '',
  support_phone: props.settings?.support_phone || '',

  // AI
  ai_enabled: props.settings?.ai_enabled ?? true,
  groq_api_key: props.settings?.groq_api_key || '',
  groq_model: props.settings?.groq_model || 'llama-3.1-8b-instant',
  groq_max_tokens: props.settings?.groq_max_tokens || 500,
  groq_temperature: props.settings?.groq_temperature || 0.7,
  ai_max_responses_per_conversation: props.settings?.ai_max_responses_per_conversation || 6,
  ai_agent_wait_minutes: props.settings?.ai_agent_wait_minutes || 30,

  // Mail
  mail_mailer: props.settings?.mail_mailer || 'smtp',
  mail_host: props.settings?.mail_host || '',
  mail_port: props.settings?.mail_port || 587,
  mail_username: props.settings?.mail_username || '',
  mail_password: props.settings?.mail_password || '',
  mail_encryption: props.settings?.mail_encryption || 'tls',
  mail_from_address: props.settings?.mail_from_address || '',
  mail_from_name: props.settings?.mail_from_name || '',

  // Website
  app_name: props.settings?.app_name || '',
  app_url: props.settings?.app_url || '',
  app_description: props.settings?.app_description || '',

  // Firebase
  firebase_api_key: props.settings?.firebase_api_key || '',
  firebase_auth_domain: props.settings?.firebase_auth_domain || '',
  firebase_project_id: props.settings?.firebase_project_id || '',
  firebase_storage_bucket: props.settings?.firebase_storage_bucket || '',
  firebase_messaging_sender_id: props.settings?.firebase_messaging_sender_id || '',
  firebase_app_id: props.settings?.firebase_app_id || '',
  firebase_measurement_id: props.settings?.firebase_measurement_id || '',
  firebase_database_url: props.settings?.firebase_database_url || '',
  firebase_credentials_path: props.settings?.firebase_credentials_path || '',

  // Backblaze B2
  b2_key_id: props.settings?.b2_key_id || '',
  b2_application_key: props.settings?.b2_application_key || '',
  b2_bucket_name: props.settings?.b2_bucket_name || '',
  b2_bucket_id: props.settings?.b2_bucket_id || '',
  b2_api_url: props.settings?.b2_api_url || 'https://api.backblazeb2.com',
});

const processing = ref(false);

const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('success');

const updateSettings = () => {
  if (processing.value) return;

  processing.value = true;

  router.post('/admin/settings', form.value, {
    preserveState: false,
    onSuccess: () => {
      toastType.value = 'success';
      toastMessage.value = 'Settings saved successfully!';
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, 3000);
    },
    onError: () => {
      toastType.value = 'error';
      toastMessage.value = 'Failed to save settings. Please check your inputs.';
      showToast.value = true;
      setTimeout(() => { showToast.value = false; }, 3000);
    },
    onFinish: () => {
      processing.value = false;
    },
  });
};

// Watch for flash messages from backend
watch(() => page.props.flash, (flash) => {
  if (flash?.success) {
    toastType.value = 'success';
    toastMessage.value = flash.success;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 3000);
  }
  if (flash?.error) {
    toastType.value = 'error';
    toastMessage.value = flash.error;
    showToast.value = true;
    setTimeout(() => { showToast.value = false; }, 3000);
  }
}, { deep: true, immediate: true });
</script>
