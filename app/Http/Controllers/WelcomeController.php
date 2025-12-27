<?php

namespace App\Http\Controllers;

use App\Models\AppVersion;
use Inertia\Inertia;
use Illuminate\Http\Request;

class WelcomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome', [
            'appName' => config('app.name', 'QIVIOTALK'),
        ]);
    }

    public function download()
    {
        $androidVersion = AppVersion::getLatestVersion('android');
        $iosVersion = AppVersion::getLatestVersion('ios');

        return Inertia::render('Download', [
            'appName' => config('app.name', 'QIVIOTALK'),
            'androidVersion' => $androidVersion ? [
                'version_name' => $androidVersion->version_name,
                'version_code' => $androidVersion->version_code,
                'download_url' => $androidVersion->download_url,
                'changelog' => $androidVersion->changelog,
                'release_date' => $androidVersion->release_date?->format('M d, Y'),
            ] : null,
            'iosVersion' => $iosVersion ? [
                'version_name' => $iosVersion->version_name,
                'version_code' => $iosVersion->version_code,
                'download_url' => $iosVersion->download_url,
                'changelog' => $iosVersion->changelog,
                'release_date' => $iosVersion->release_date?->format('M d, Y'),
            ] : null,
        ]);
    }
}
