<?php

namespace App\Jobs;

use App\Models\Widget;
use App\Http\Controllers\Api\WidgetController;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BulkUpdateWidgetScripts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public $tries = 3;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     *
     * @var int
     */
    public $maxExceptions = 3;

    /**
     * The number of seconds the job can run before timing out.
     *
     * @var int
     */
    public $timeout = 3600; // 1 hour

    /**
     * Indicate if the job should be marked as failed on timeout.
     *
     * @var bool
     */
    public $failOnTimeout = true;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var int
     */
    public $backoff = [60, 180, 300, 500]; // 1 min, 3 mins, 5 mins, 8 mins

    /**
     * The chunk size for processing widgets
     *
     * @var int
     */
    protected $chunkSize;

    /**
     * Create a new job instance.
     *
     * @param int $chunkSize
     * @return void
     */
    public function __construct(int $chunkSize = 10)
    {
        $this->chunkSize = $chunkSize;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $widgetController = app(WidgetController::class);
        $totalCount = Widget::count();
        
        Log::info('Starting bulk widget scripts update', [
            'total_widgets' => $totalCount,
            'chunk_size' => $this->chunkSize
        ]);
        
        $successCount = 0;
        $errorCount = 0;
        $processedCount = 0;
        
        // Process in chunks to avoid memory issues
        Widget::query()
            ->orderBy('id')
            ->chunk($this->chunkSize, function ($widgets) use ($widgetController, &$successCount, &$errorCount, &$processedCount, $totalCount) {
                foreach ($widgets as $widget) {
                    try {
                        $widgetController->generateWidgetScript($widget);
                        $successCount++;
                        
                        // Log progress every 10% or for every 100 widgets
                        $processedCount++;
                        $percentComplete = round(($processedCount / $totalCount) * 100);
                        if ($percentComplete % 10 === 0 || $processedCount % 100 === 0) {
                            Log::info("Widget update progress: {$percentComplete}% complete", [
                                'processed' => $processedCount,
                                'total' => $totalCount,
                                'success' => $successCount,
                                'errors' => $errorCount
                            ]);
                        }
                    } catch (\Exception $e) {
                        $errorCount++;
                        Log::error('Failed to update widget script', [
                            'widget_id' => $widget->id,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                    }
                }
                
                // Provide a garbage collection opportunity
                if (function_exists('gc_collect_cycles')) {
                    gc_collect_cycles();
                }
            });
            
        Log::info('Bulk widget script update completed', [
            'total_processed' => $processedCount,
            'success_count' => $successCount,
            'error_count' => $errorCount
        ]);
    }
    
    /**
     * The job failed to process.
     *
     * @param \Throwable $exception
     * @return void
     */
    public function failed(\Throwable $exception)
    {
        Log::error('Bulk widget update job failed', [
            'exception' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
