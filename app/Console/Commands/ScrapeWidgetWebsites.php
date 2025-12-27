<?php

namespace App\Console\Commands;

use App\Models\Widget;
use App\Services\WebsiteContextService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ScrapeWidgetWebsites extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'widgets:scrape-websites {--force : Force scrape all websites} {--widget= : Scrape specific widget ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Scrape widget websites to update AI context (runs weekly via cron)';

    protected $websiteContextService;

    public function __construct(WebsiteContextService $websiteContextService)
    {
        parent::__construct();
        $this->websiteContextService = $websiteContextService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting website scraping...');

        $query = Widget::whereNotNull('website');

        // Specific widget
        if ($this->option('widget')) {
            $query->where('id', $this->option('widget'));
        }

        // Force scrape all or just those due for update
        if (!$this->option('force')) {
            $query->where(function ($q) {
                $q->whereDoesntHave('websiteContext')
                    ->orWhereHas('websiteContext', function ($subQuery) {
                        $subQuery->where('next_scrape_at', '<=', now())
                            ->orWhere('scrape_status', 'failed');
                    });
            });
        }

        $widgets = $query->get();

        if ($widgets->isEmpty()) {
            $this->info('No websites need scraping at this time.');
            return 0;
        }

        $this->info("Found {$widgets->count()} widget(s) to scrape.");

        $bar = $this->output->createProgressBar($widgets->count());
        $bar->start();

        $successCount = 0;
        $failureCount = 0;

        foreach ($widgets as $widget) {
            try {
                $this->line("\nScraping widget #{$widget->id}: {$widget->website}");

                $result = $this->websiteContextService->scrapeWebsite($widget);

                if ($result && $result->scrape_status === 'success') {
                    $successCount++;
                    $this->line("  ✓ Success");
                } else {
                    $failureCount++;
                    $this->line("  ✗ Failed");
                }

            } catch (\Exception $e) {
                $failureCount++;
                $this->error("  ✗ Error: " . $e->getMessage());
                Log::error("Scrape command failed for widget {$widget->id}: " . $e->getMessage());
            }

            $bar->advance();
        }

        $bar->finish();

        $this->newLine(2);
        $this->info("Scraping complete!");
        $this->info("Successful: {$successCount}");
        $this->info("Failed: {$failureCount}");

        return 0;
    }
}
