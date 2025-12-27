<?php

namespace App\Traits;

use GeoIp2\Database\Reader;
use Jenssegers\Agent\Agent;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;

trait LocationTrait
{
    public function extractLocationData(string $ip = null): array
    {
        $ip = $ip ?: $this->getUserIp();
        $agent = new Agent();

        try {
            $reader = new Reader(public_path('location/GeoLite2-City.mmdb'));
            $record = $reader->city($ip);

            return [
                'ip' => $ip,
                'country' => [
                    'name' => $record->country->name,
                    'code' => $record->country->isoCode,
                ],
                'region' => [
                    'name' => $record->mostSpecificSubdivision->name,
                    'code' => $record->mostSpecificSubdivision->isoCode,
                ],
                'city' => [
                    'name' => $record->city->name,
                ],
                'postal_code' => $record->postal->code,
                'coordinates' => [
                    'latitude' => $record->location->latitude,
                    'longitude' => $record->location->longitude,
                ],
                'timezone' => $record->location->timeZone,
                'accuracy_radius' => $record->location->accuracyRadius,
                'device' => [
                    'browser' => $agent->browser(),
                    'browser_version' => $agent->version($agent->browser()),
                    'platform' => $agent->platform(),
                    'platform_version' => $agent->version($agent->platform()),
                    'device_type' => $this->getDeviceType($agent),
                    'user_agent' => $agent->getUserAgent(),
                ],
                'network' => [
                    'isp' => $record->traits->isp ?? null,
                    'organization' => $record->traits->organization ?? null,
                    'autonomous_system_number' => $record->traits->autonomousSystemNumber ?? null,
                    'autonomous_system_organization' => $record->traits->autonomousSystemOrganization ?? null,
                ],
                'security' => [
                    'is_anonymous_proxy' => $record->traits->isAnonymousProxy ?? false,
                    'is_satellite_provider' => $record->traits->isSatelliteProvider ?? false,
                    'is_tor' => $this->isTorNetwork($ip),
                    'is_vpn' => $this->isVpnNetwork($ip),
                ],
                'timestamp' => now()->toISOString(),
                'session_id' => session()->getId(),
                'user_id' => auth()->id(),
            ];

        } catch (\Exception $e) {
            Log::error('Location extraction failed', [
                'ip' => $ip,
                'error' => $e->getMessage()
            ]);

            return $this->getFallbackLocationData($ip, $agent);
        }
    }

    public function getUserIp(): string
    {
        $ipKeys = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];

        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ips = explode(',', $_SERVER[$key]);
                $ip = trim($ips[0]);

                if ($this->isValidIp($ip)) {
                    return $ip;
                }
            }
        }

        return Request::ip() ?? '127.0.0.1';
    }

    private function isValidIp(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }

    private function getDeviceType(Agent $agent): string
    {
        if ($agent->isMobile()) return 'mobile';
        if ($agent->isTablet()) return 'tablet';
        if ($agent->isDesktop()) return 'desktop';
        if ($agent->isRobot()) return 'bot';

        return 'unknown';
    }

    private function isTorNetwork(string $ip): bool
    {
        // Check against known Tor exit nodes (implement your logic)
        $torExitNodes = cache()->remember('tor_exit_nodes', 3600, function () {
            // Fetch from reliable Tor exit node list API
            return [];
        });

        return in_array($ip, $torExitNodes);
    }

    private function isVpnNetwork(string $ip): bool
    {
        // Implement VPN detection logic
        // You can use commercial APIs like IPQualityScore, MaxMind, etc.
        return false;
    }

    private function getFallbackLocationData(string $ip, Agent $agent): array
    {
        return [
            'ip' => $ip,
            'country' => ['name' => 'Unknown', 'code' => null],
            'region' => ['name' => 'Unknown', 'code' => null],
            'city' => ['name' => 'Unknown'],
            'postal_code' => null,
            'coordinates' => ['latitude' => null, 'longitude' => null],
            'timezone' => 'UTC',
            'accuracy_radius' => null,
            'device' => [
                'browser' => $agent->browser(),
                'browser_version' => $agent->version($agent->browser()),
                'platform' => $agent->platform(),
                'platform_version' => $agent->version($agent->platform()),
                'device_type' => $this->getDeviceType($agent),
                'user_agent' => $agent->getUserAgent(),
            ],
            'network' => [
                'isp' => null,
                'organization' => null,
                'autonomous_system_number' => null,
                'autonomous_system_organization' => null,
            ],
            'security' => [
                'is_anonymous_proxy' => false,
                'is_satellite_provider' => false,
                'is_tor' => false,
                'is_vpn' => false,
            ],
            'timestamp' => now()->toISOString(),
            'session_id' => session()->getId(),
            'user_id' => auth()->id(),
            'error' => 'Location data unavailable',
        ];
    }

    public function logUserLocation(string $action = 'general'): void
{
    if (!auth()->check()) return;

    $locationData = $this->extractLocationData();
    $locationData['action'] = $action;

    $user = auth()->user();

    // Fix: Ensure location_history is treated as array
    $locationHistory = $user->location_history;

    // If it's null or not an array, initialize as empty array
    if (!is_array($locationHistory)) {
        $locationHistory = [];
    }

    // Add new entry
    $locationHistory[] = $locationData;

    // Keep only last 50 entries
    if (count($locationHistory) > 50) {
        $locationHistory = array_slice($locationHistory, -50);
    }

    // Update user location history
    //$user->update(['location_history' => $locationHistory]);
}
    public function getLocationSummary(): array
    {
        $locationData = $this->extractLocationData();

        return [
            'country' => $locationData['country']['name'],
            'region' => $locationData['region']['name'],
            'city' => $locationData['city']['name'],
            'timezone' => $locationData['timezone'],
            'coordinates' => $locationData['coordinates'],
        ];
    }

// Add this to your LocationTrait
public function logFailedLoginAttempt(string $email, string $ip, string $userAgent, array $locationData = []): void
{
    $user = \App\Models\User::where('email', $email)->first();
    
    if (!$user) {
        Log::info('Failed login attempt for non-existent user', [
            'email' => $email,
            'ip' => $ip
        ]);
        return;
    }
    
    $history = $user->location_history ?? [];
    
    $history[] = [
        'action' => 'failed_login',
        'ip' => $ip,
        'user_agent' => $userAgent,
        'location' => $locationData ?: $this->extractLocationData($ip),
        'timestamp' => now()->toISOString(),
        'email_attempted' => $email
    ];
    
    // Keep only last 50 entries
    $history = array_slice($history, -50);
    
    $user->update(['location_history' => $history]);
    
    Log::info('Failed login logged to user history', [
        'user_id' => $user->id,
        'email' => $email
    ]);
}
}
