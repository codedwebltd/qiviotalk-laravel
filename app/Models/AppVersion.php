<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'version_code',
        'version_name',
        'platform',
        'download_url',
        'changelog',
        'is_mandatory',
        'is_active',
        'release_date',
    ];

    protected $casts = [
        'is_mandatory' => 'boolean',
        'is_active' => 'boolean',
        'release_date' => 'datetime',
        'version_code' => 'integer',
    ];

    /**
     * Get the latest active version for a platform
     */
    public static function getLatestVersion($platform = 'android')
    {
        return self::where('platform', $platform)
            ->where('is_active', true)
            ->orderBy('version_code', 'desc')
            ->first();
    }
}
