<?php

namespace App\Http\Controllers\Api;

use App\Models\AppVersion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class VersionCheckController extends Controller
{
    /**
     * Check if app update is available
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkVersion(Request $request)
    {
        $validated = $request->validate([
            'version_code' => 'required|integer',
            'version_name' => 'required|string',
            'platform' => 'required|string|in:android,ios',
        ]);

        $currentVersionCode = $validated['version_code'];
        $currentVersionName = $validated['version_name'];
        $platform = $validated['platform'];

        // Get the latest version for the platform
        $latestVersion = AppVersion::getLatestVersion($platform);

        // If no version found in database
        if (!$latestVersion) {
            return response()->json([
                'status' => 'success',
                'update_available' => false,
                'is_mandatory' => false,
                'message' => 'You are using the latest version',
                'current_version' => [
                    'code' => $currentVersionCode,
                    'name' => $currentVersionName,
                ],
            ]);
        }

        // Compare versions
        $updateAvailable = $currentVersionCode < $latestVersion->version_code;

        // Log version check
        Log::info('Version check performed', [
            'platform' => $platform,
            'current_version' => $currentVersionCode,
            'latest_version' => $latestVersion->version_code,
            'update_available' => $updateAvailable,
        ]);

        $response = [
            'status' => 'success',
            'update_available' => $updateAvailable,
            'is_mandatory' => $updateAvailable && $latestVersion->is_mandatory,
            'current_version' => [
                'code' => $currentVersionCode,
                'name' => $currentVersionName,
            ],
        ];

        // If update is available, include latest version details
        if ($updateAvailable) {
            $response['latest_version'] = [
                'code' => $latestVersion->version_code,
                'name' => $latestVersion->version_name,
                'download_url' => $latestVersion->download_url,
                'changelog' => $latestVersion->changelog,
                'release_date' => $latestVersion->release_date?->toDateTimeString(),
            ];
            $response['message'] = $latestVersion->is_mandatory
                ? 'A critical update is required. Please update to continue using the app.'
                : 'A new version is available! Update now to get the latest features and improvements.';
        } else {
            $response['message'] = 'You are using the latest version';
        }

        return response()->json($response);
    }

    /**
     * Get all app versions (for admin panel)
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $platform = $request->input('platform', 'android');

        $versions = AppVersion::where('platform', $platform)
            ->orderBy('version_code', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'versions' => $versions,
        ]);
    }

    /**
     * Create a new app version (for admin panel)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'version_code' => 'required|integer|unique:app_versions,version_code',
            'version_name' => 'required|string',
            'platform' => 'required|string|in:android,ios',
            'download_url' => 'required|url',
            'changelog' => 'nullable|string',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
            'release_date' => 'nullable|date',
        ]);

        $version = AppVersion::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'App version created successfully',
            'version' => $version,
        ], 201);
    }

    /**
     * Update an app version (for admin panel)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $version = AppVersion::findOrFail($id);

        $validated = $request->validate([
            'version_code' => 'sometimes|integer|unique:app_versions,version_code,' . $id,
            'version_name' => 'sometimes|string',
            'platform' => 'sometimes|string|in:android,ios',
            'download_url' => 'sometimes|url',
            'changelog' => 'nullable|string',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
            'release_date' => 'nullable|date',
        ]);

        $version->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'App version updated successfully',
            'version' => $version,
        ]);
    }

    /**
     * Delete an app version (for admin panel)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $version = AppVersion::findOrFail($id);
        $version->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'App version deleted successfully',
        ]);
    }
}
