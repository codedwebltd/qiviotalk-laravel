<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppVersion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\FileUploadService;

class AppVersionController extends Controller
{
    protected $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    /**
     * Display a listing of app versions
     */
    public function index(Request $request)
    {
        $query = AppVersion::query()->orderBy('version_code', 'desc');

        // Filter by platform if specified
        if ($request->has('platform') && $request->platform !== 'all') {
            $query->where('platform', $request->platform);
        }

        // Filter by status if specified
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }

        $versions = $query->paginate(15);

        $stats = [
            'total' => AppVersion::count(),
            'android' => AppVersion::where('platform', 'android')->count(),
            'ios' => AppVersion::where('platform', 'ios')->count(),
            'active' => AppVersion::where('is_active', true)->count(),
            'mandatory' => AppVersion::where('is_mandatory', true)->count(),
        ];

        return Inertia::render('Admin/AppVersions/Index', [
            'versions' => $versions,
            'stats' => $stats,
            'filters' => $request->only(['platform', 'status']),
        ]);
    }

    /**
     * Store a newly created app version
     */
    public function store(Request $request)
    {
        $request->validate([
            'version_code' => 'required|integer|min:1',
            'version_name' => 'required|string|max:255',
            'platform' => 'required|in:android,ios',
            'download_url' => 'required|url',
            'changelog' => 'nullable|string',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
            'release_date' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            // If creating a new active version, deactivate all other versions for this platform
            // and remove mandatory flag from them
            if ($request->is_active ?? true) {
                AppVersion::where('platform', $request->platform)
                    ->where('is_active', true)
                    ->update([
                        'is_active' => false,
                        'is_mandatory' => false
                    ]);

                Log::info('Deactivated previous versions for platform: ' . $request->platform);
            }

            // Process changelog to add bullet points automatically
            $changelog = $this->processChangelog($request->changelog);

            $appVersion = AppVersion::create([
                'version_code' => $request->version_code,
                'version_name' => $request->version_name,
                'platform' => $request->platform,
                'download_url' => $request->download_url,
                'changelog' => $changelog,
                'is_mandatory' => $request->is_mandatory ?? false,
                'is_active' => $request->is_active ?? true,
                'release_date' => $request->release_date ?? now(),
            ]);

            DB::commit();

            return back()->with('success', 'App version created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create app version: ' . $e->getMessage());
            return back()->with('error', 'Failed to create app version: ' . $e->getMessage());
        }
    }

    /**
     * Update the specified app version
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'version_code' => 'required|integer|min:1',
            'version_name' => 'required|string|max:255',
            'platform' => 'required|in:android,ios',
            'download_url' => 'required|url',
            'changelog' => 'nullable|string',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
            'release_date' => 'nullable|date',
        ]);

        try {
            DB::beginTransaction();

            $appVersion = AppVersion::findOrFail($id);

            // Process changelog to add bullet points automatically
            $changelog = $this->processChangelog($request->changelog);

            $appVersion->update([
                'version_code' => $request->version_code,
                'version_name' => $request->version_name,
                'platform' => $request->platform,
                'download_url' => $request->download_url,
                'changelog' => $changelog,
                'is_mandatory' => $request->is_mandatory ?? $appVersion->is_mandatory,
                'is_active' => $request->is_active ?? $appVersion->is_active,
                'release_date' => $request->release_date ?? $appVersion->release_date,
            ]);

            DB::commit();

            return back()->with('success', 'App version updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update app version: ' . $e->getMessage());
            return back()->with('error', 'Failed to update app version: ' . $e->getMessage());
        }
    }

    /**
     * Toggle the active status of app version
     */
    public function toggleActive($id)
    {
        try {
            $appVersion = AppVersion::findOrFail($id);
            $appVersion->is_active = !$appVersion->is_active;
            $appVersion->save();

            return back()->with('success', 'App version status updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update status: ' . $e->getMessage());
        }
    }

    /**
     * Toggle the mandatory status of app version
     */
    public function toggleMandatory($id)
    {
        try {
            $appVersion = AppVersion::findOrFail($id);
            $appVersion->is_mandatory = !$appVersion->is_mandatory;
            $appVersion->save();

            return back()->with('success', 'App version mandatory status updated successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to update mandatory status: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified app version
     */
    public function destroy($id)
    {
        try {
            $appVersion = AppVersion::findOrFail($id);

            // Delete file from Backblaze if exists
            if ($appVersion->download_url) {
                $bucketName = 'westernkits';
                if (str_contains($appVersion->download_url, "file/{$bucketName}/")) {
                    $filePath = explode("file/{$bucketName}/", $appVersion->download_url)[1];
                    $this->fileUploadService->deleteFile($filePath);
                    Log::info('Deleted app version file from Backblaze', ['path' => $filePath]);
                }
            }

            $appVersion->delete();

            return back()->with('success', 'App version deleted successfully');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete app version: ' . $e->getMessage());
        }
    }

    /**
     * Upload APK/IPA file only and return the Backblaze URL
     */
    public function uploadFile(Request $request)
    {
        Log::info('Upload file request received', [
            'has_file' => $request->hasFile('apk_file'),
            'platform' => $request->platform,
            'version_code' => $request->version_code
        ]);

        try {
            $request->validate([
                'apk_file' => 'required|file|max:512000', // 500MB max, removed mimes check
                'platform' => 'required|in:android,ios',
                'version_code' => 'required|integer',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Validation error: ' . implode(', ', array_map(fn($err) => implode(', ', $err), $e->errors()))
            ], 422);
        }

        try {
            $file = $request->file('apk_file');

            Log::info('File details', [
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size' => $file->getSize(),
                'extension' => $file->getClientOriginalExtension()
            ]);

            $directory = 'livechat/app-versions/' . $request->platform;

            $result = $this->fileUploadService->uploadFile($file, $directory, $request->version_code);

            if (!$result['success']) {
                Log::error('Upload service returned failure');
                return response()->json([
                    'success' => false,
                    'message' => 'File upload failed'
                ], 500);
            }

            Log::info('File uploaded successfully', [
                'url' => $result['url']
            ]);

            return response()->json([
                'success' => true,
                'url' => $result['url'],
                'message' => 'File uploaded successfully to Backblaze'
            ]);
        } catch (\Exception $e) {
            Log::error('File upload exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'File upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process changelog to add bullet points automatically
     * Converts each line into a bullet point
     */
    private function processChangelog($changelog)
    {
        if (empty($changelog)) {
            return null;
        }

        // Ensure UTF-8 encoding
        $changelog = mb_convert_encoding($changelog, 'UTF-8', 'UTF-8');

        // Split by new lines
        $lines = preg_split('/\r\n|\r|\n/', trim($changelog));

        // Filter out empty lines and add bullet points
        $bulletPoints = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (!empty($line)) {
                // Remove existing bullet points or dashes if any
                $line = preg_replace('/^[\-\*•]\s*/u', '', $line);
                // Use simple dash instead of bullet character
                $bulletPoints[] = '- ' . $line;
            }
        }

        return implode("\n", $bulletPoints);
    }
}
