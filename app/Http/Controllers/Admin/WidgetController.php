<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Widget;
use App\Models\Conversation;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class WidgetController extends Controller
{
    public function index()
    {
        $widgets = Widget::with(['user:id,name,email'])
            ->withCount([
                'conversations',
                'openConversations',
                'closedConversations',
                'unreadConversations'
            ])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $stats = [
            'total' => Widget::count(),
            'active' => Widget::where('widget_status', 'active')->count(),
            'suspended' => Widget::where('widget_status', 'suspended')->count(),
            'installed' => Widget::where('is_installed', true)->count(),
        ];

        return Inertia::render('Admin/Widgets/Index', [
            'widgets' => $widgets,
            'stats' => $stats,
        ]);
    }

    public function updateWidget(Request $request, $id)
    {
        $request->validate([
            'obfuscate' => 'boolean'
        ]);

        $widget = Widget::findOrFail($id);
        $obfuscate = $request->input('obfuscate', false);

        try {
            // Call artisan command to regenerate widget
            $exitCode = Artisan::call('widgets:update-scripts', [
                'widget_key' => $widget->widget_key,
                '--obfuscate' => $obfuscate,
            ]);

            if ($exitCode === 0) {
                Log::info('Widget updated via admin panel', [
                    'widget_id' => $id,
                    'widget_key' => $widget->widget_key,
                    'obfuscated' => $obfuscate
                ]);

                return back()->with('success', 'Widget updated successfully' . ($obfuscate ? ' (obfuscated)' : ''));
            } else {
                return back()->with('error', 'Failed to update widget');
            }
        } catch (\Exception $e) {
            Log::error('Widget update failed via admin panel', [
                'widget_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->with('error', 'Failed to update widget: ' . $e->getMessage());
        }
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:active,suspended,deactivated,fraudulent'
        ]);

        $widget = Widget::findOrFail($id);
        $widget->widget_status = $request->input('status');
        $widget->save();

        Log::info('Widget status updated via admin panel', [
            'widget_id' => $id,
            'widget_key' => $widget->widget_key,
            'new_status' => $request->input('status')
        ]);

        return back()->with('success', 'Widget status updated to ' . $request->input('status'));
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'widget_ids' => 'required|array',
            'widget_ids.*' => 'required|integer|exists:widgets,id',
            'obfuscate' => 'boolean'
        ]);

        $widgetIds = $request->input('widget_ids');
        $obfuscate = $request->input('obfuscate', false);

        try {
            $widgets = Widget::whereIn('id', $widgetIds)->get();
            $successCount = 0;
            $failCount = 0;

            foreach ($widgets as $widget) {
                try {
                    $exitCode = Artisan::call('widgets:update-scripts', [
                        'widget_key' => $widget->widget_key,
                        '--obfuscate' => $obfuscate,
                    ]);

                    if ($exitCode === 0) {
                        $successCount++;
                        Log::info('Widget updated in bulk operation', [
                            'widget_id' => $widget->id,
                            'widget_key' => $widget->widget_key,
                            'obfuscated' => $obfuscate
                        ]);
                    } else {
                        $failCount++;
                    }
                } catch (\Exception $e) {
                    $failCount++;
                    Log::error('Widget bulk update failed', [
                        'widget_id' => $widget->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if ($successCount > 0) {
                return response()->json([
                    'status' => 'success',
                    'message' => "{$successCount} widget(s) updated successfully" . ($failCount > 0 ? ", {$failCount} failed" : ''),
                    'success_count' => $successCount,
                    'fail_count' => $failCount
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'All widget updates failed'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Bulk widget update failed', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update widgets: ' . $e->getMessage()
            ], 500);
        }
    }

    public function updateAll(Request $request)
    {
        $request->validate([
            'obfuscate' => 'boolean'
        ]);

        $obfuscate = $request->input('obfuscate', false);

        try {
            $widgets = Widget::all();
            $successCount = 0;
            $failCount = 0;

            foreach ($widgets as $widget) {
                try {
                    $exitCode = Artisan::call('widgets:update-scripts', [
                        'widget_key' => $widget->widget_key,
                        '--obfuscate' => $obfuscate,
                    ]);

                    if ($exitCode === 0) {
                        $successCount++;
                        Log::info('Widget updated in update-all operation', [
                            'widget_id' => $widget->id,
                            'widget_key' => $widget->widget_key,
                            'obfuscated' => $obfuscate
                        ]);
                    } else {
                        $failCount++;
                    }
                } catch (\Exception $e) {
                    $failCount++;
                    Log::error('Widget update-all failed for widget', [
                        'widget_id' => $widget->id,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            if ($successCount > 0) {
                return response()->json([
                    'status' => 'success',
                    'message' => "{$successCount} widget(s) updated successfully" . ($failCount > 0 ? ", {$failCount} failed" : ''),
                    'success_count' => $successCount,
                    'fail_count' => $failCount
                ]);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'All widget updates failed'
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Update all widgets failed', [
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update all widgets: ' . $e->getMessage()
            ], 500);
        }
    }
}
