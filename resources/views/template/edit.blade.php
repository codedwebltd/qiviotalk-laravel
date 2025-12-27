<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Widget Template Editor') }}
        </h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <!-- Alert Messages -->
            <div id="alert-container" class="mb-4"></div>

            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6">
                    <!-- Header with buttons -->
                    <div class="flex justify-between items-center mb-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-900">Edit Widget Template</h3>
                            <p class="text-sm text-gray-600 mt-1">Modify your widget base template with caution</p>
                        </div>
                        <div class="flex gap-2">
                            @if($backupExists)
                            <button id="restore-btn" class="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 focus:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                Restore Backup
                            </button>
                            @endif
                            <button id="save-btn" class="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150">
                                Save Changes
                            </button>
                        </div>
                    </div>

                    <!-- Warning Notice -->
                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-yellow-700">
                                    <strong>Warning:</strong> This is your base widget template. Changes here will affect all widgets. A backup is automatically created before each save.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Code Editor -->
                    <div class="relative">
                        <textarea
                            id="code-editor"
                            class="w-full h-96 font-mono text-sm p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                            spellcheck="false"
                            style="tab-size: 4;"
                        >{{ $content }}</textarea>
                        <div class="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                            Lines: <span id="line-count">0</span> | Characters: <span id="char-count">0</span>
                        </div>
                    </div>

                    <!-- File Info -->
                    <div class="mt-4 text-sm text-gray-600">
                        <p><strong>File:</strong> resources/js/widget-template.js</p>
                        <p><strong>Backup:</strong> resources/js/backup/widget-template.js</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
        const editor = document.getElementById('code-editor');
        const saveBtn = document.getElementById('save-btn');
        const restoreBtn = document.getElementById('restore-btn');
        const lineCount = document.getElementById('line-count');
        const charCount = document.getElementById('char-count');
        const alertContainer = document.getElementById('alert-container');

        let originalContent = editor.value;
        let saveTimeout = null;

        // Update stats
        function updateStats() {
            const content = editor.value;
            const lines = content.split('\n').length;
            const chars = content.length;
            lineCount.textContent = lines;
            charCount.textContent = chars;
        }

        // Show alert
        function showAlert(message, type = 'success') {
            const alertClass = type === 'success'
                ? 'bg-green-50 border-green-400 text-green-700'
                : 'bg-red-50 border-red-400 text-red-700';

            const alert = document.createElement('div');
            alert.className = `border-l-4 p-4 mb-4 ${alertClass}`;
            alert.innerHTML = `
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm">${message}</p>
                    </div>
                </div>
            `;

            alertContainer.innerHTML = '';
            alertContainer.appendChild(alert);

            setTimeout(() => {
                alert.remove();
            }, 5000);
        }

        // Save button handler with debouncing
        saveBtn.addEventListener('click', async function() {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }

            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="inline-block animate-spin">&#8635;</span> Saving...';

            try {
                const response = await fetch('{{ route('template.update') }}', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({
                        content: editor.value
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showAlert(data.message, 'success');
                    originalContent = editor.value;
                } else {
                    showAlert(data.message || 'Failed to save template', 'error');
                }
            } catch (error) {
                showAlert('Network error: ' + error.message, 'error');
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = 'Save Changes';
            }
        });

        // Restore button handler
        if (restoreBtn) {
            restoreBtn.addEventListener('click', async function() {
                if (!confirm('Are you sure you want to restore from backup? This will overwrite current changes.')) {
                    return;
                }

                restoreBtn.disabled = true;
                restoreBtn.innerHTML = '<span class="inline-block animate-spin">&#8635;</span> Restoring...';

                try {
                    const response = await fetch('{{ route('template.restore') }}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                        }
                    });

                    const data = await response.json();

                    if (data.success) {
                        editor.value = data.content;
                        originalContent = data.content;
                        updateStats();
                        showAlert(data.message, 'success');
                    } else {
                        showAlert(data.message || 'Failed to restore backup', 'error');
                    }
                } catch (error) {
                    showAlert('Network error: ' + error.message, 'error');
                } finally {
                    restoreBtn.disabled = false;
                    restoreBtn.textContent = 'Restore Backup';
                }
            });
        }

        // Update stats on input with debouncing
        editor.addEventListener('input', function() {
            updateStats();
        });

        // Warn before leaving if there are unsaved changes
        window.addEventListener('beforeunload', function(e) {
            if (editor.value !== originalContent) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Tab key support for indentation
        editor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                const value = this.value;

                this.value = value.substring(0, start) + '    ' + value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });

        // Initialize stats
        updateStats();
    </script>
    @endpush
</x-app-layout>
