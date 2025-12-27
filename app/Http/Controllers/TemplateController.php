<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class TemplateController extends Controller
{
    protected $templatePath;
    protected $backupPath;
    protected $originalBackupPath;

    public function __construct()
    {
        $this->templatePath = resource_path('js/widget-template.js');
        $this->backupPath = resource_path('js/backup/widget-template.js');
        $this->originalBackupPath = resource_path('js/backup/widget-template-original.js');
    }

    public function edit()
    {
        try {
            if (!File::exists($this->templatePath)) {
                return back()->with('error', 'Template file not found!');
            }

            $content = File::get($this->templatePath);
            $backupExists = File::exists($this->backupPath);
            $originalBackupExists = File::exists($this->originalBackupPath);

            return inertia('Template/Edit', [
                'content' => $content,
                'backupExists' => $backupExists,
                'originalBackupExists' => $originalBackupExists,
            ]);
        } catch (\Exception $e) {
            return back()->with('error', 'Error loading template: ' . $e->getMessage());
        }
    }

    public function update(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'content' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $content = $request->input('content');

            // Basic JavaScript validation
            if (!$this->validateJavaScript($content)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid JavaScript syntax detected. Please check your code.'
                ], 422);
            }

            // Only overwrite the single backup file (no multiple backups)
            if (File::exists($this->templatePath)) {
                File::copy($this->templatePath, $this->backupPath);
            }

            // Update the template
            File::put($this->templatePath, $content);

            return response()->json([
                'success' => true,
                'message' => 'Template updated successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating template: ' . $e->getMessage()
            ], 500);
        }
    }

    public function restore()
    {
        try {
            if (!File::exists($this->backupPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Backup file not found!'
                ], 404);
            }

            $backupContent = File::get($this->backupPath);
            File::put($this->templatePath, $backupContent);

            return response()->json([
                'success' => true,
                'message' => 'Template restored from backup successfully!',
                'content' => $backupContent
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring template: ' . $e->getMessage()
            ], 500);
        }
    }

    public function restoreOriginal()
    {
        try {
            if (!File::exists($this->originalBackupPath)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Original backup file not found!'
                ], 404);
            }

            $originalContent = File::get($this->originalBackupPath);
            File::put($this->templatePath, $originalContent);

            return response()->json([
                'success' => true,
                'message' => 'Template restored from original backup successfully!',
                'content' => $originalContent
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error restoring original template: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Basic JavaScript syntax validation
     */
    private function validateJavaScript($code)
    {
        // Check for balanced braces
        $openBraces = substr_count($code, '{');
        $closeBraces = substr_count($code, '}');

        if ($openBraces !== $closeBraces) {
            return false;
        }

        // Check for balanced parentheses
        $openParens = substr_count($code, '(');
        $closeParens = substr_count($code, ')');

        if ($openParens !== $closeParens) {
            return false;
        }

        // Check for balanced brackets
        $openBrackets = substr_count($code, '[');
        $closeBrackets = substr_count($code, ']');

        if ($openBrackets !== $closeBrackets) {
            return false;
        }

        return true;
    }
}
