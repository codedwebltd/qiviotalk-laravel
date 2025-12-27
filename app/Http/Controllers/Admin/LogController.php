<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class LogController extends Controller
{
    public function index()
    {
        $logPath = storage_path('logs/laravel.log');
        $logContent = '';
        $logInfo = [
            'path' => $logPath,
            'exists' => false,
            'totalLines' => 0,
            'fileSize' => '0 KB',
            'lastModified' => 'N/A',
        ];

        if (File::exists($logPath)) {
            $logInfo['exists'] = true;
            $fileSize = File::size($logPath);
            $logInfo['fileSize'] = $this->formatBytes($fileSize);
            $logInfo['lastModified'] = date('Y-m-d H:i:s', File::lastModified($logPath));

            $logContent = File::get($logPath);
            $lines = explode("\n", $logContent);
            $logInfo['totalLines'] = count($lines);

            if ($logInfo['totalLines'] > 1000) {
                $lines = array_slice($lines, -1000);
                $lines = array_reverse($lines);
                $logContent = implode("\n", $lines);
                $logContent = "... (Showing last 1000 lines in reverse order)\n\n" . $logContent;
            } else {
                $lines = array_reverse($lines);
                $logContent = implode("\n", $lines);
            }
        }

        return Inertia::render('Admin/Logs/Index', [
            'logContent' => $logContent,
            'logInfo' => $logInfo,
        ]);
    }

    public function clear()
    {
        $logPath = storage_path('logs/laravel.log');

        if (File::exists($logPath)) {
            File::put($logPath, '');
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logs cleared successfully'
        ]);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
