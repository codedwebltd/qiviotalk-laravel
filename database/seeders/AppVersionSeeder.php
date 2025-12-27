<?php

namespace Database\Seeders;

use App\Models\AppVersion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AppVersionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seed current version (1.0.0)
        AppVersion::create([
            'version_code' => 1,
            'version_name' => '1.0.0',
            'platform' => 'android',
            'download_url' => 'https://expo.dev/artifacts/eas/pVPTa2oLDdoCLR8S8zScDy.apk',
            'changelog' => "🎉 Initial Release\n\n✨ Features:\n• Real-time chat functionality\n• AI-powered chatbot\n• Subscription management\n• Push notifications\n• Widget integration\n• User profile management\n• Transaction history",
            'is_mandatory' => false,
            'is_active' => true,
            'release_date' => now(),
        ]);

        // Seed version 6.1.1
        AppVersion::create([
            'version_code' => 6,
            'version_name' => '6.1.1',
            'platform' => 'android',
            'download_url' => 'https://expo.dev/artifacts/eas/f6eQTorLcy6EAXw6afCwVk.apk',
            'changelog' => null,
            'is_mandatory' => true,
            'is_active' => true,
            'release_date' => now(),
        ]);

        $this->command->info('✅ App versions seeded successfully!');
    }
}
