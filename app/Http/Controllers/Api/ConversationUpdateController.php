<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Widget;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ConversationUpdateController extends Controller
{
    /**
     * Update visitor information in a conversation
     */
    public function updateVisitorInfo(Request $request)
    {
        Log::info('Received visitor update request', [
            'widget_key' => $request->widget_key,
            'conversation_id' => $request->conversation_id,
            'has_email' => !empty($request->visitor_email),
            'has_phone' => !empty($request->visitor_phone)
        ]);

        $validator = Validator::make($request->all(), [
            'widget_key' => 'required|string|exists:widgets,widget_key',
            'conversation_id' => 'required|integer|exists:conversations,id',
            'visitor_email' => 'nullable|email|max:255',
            'visitor_name' => 'nullable|string|max:255',
            'visitor_phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed for visitor update', [
                'errors' => $validator->errors()->toArray()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $widget = Widget::where('widget_key', $request->widget_key)->first();
        $conversation = Conversation::find($request->conversation_id);

        // Check if conversation is related to the widget
        if ($conversation->widget_id !== $widget->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Conversation not found for this widget'
            ], 404);
        }

        $updateData = [];

        if ($request->has('visitor_email')) {
            $updateData['visitor_email'] = $request->visitor_email;
        }

        if ($request->has('visitor_name')) {
            $updateData['visitor_name'] = $request->visitor_name;
        }

        // Store phone in meta_data
        if ($request->has('visitor_phone')) {
            $metaData = $conversation->meta_data ?? [];
            $metaData['visitor_phone'] = $request->visitor_phone;
            $updateData['meta_data'] = $metaData;
        }

        if (!empty($updateData)) {
            $conversation->update($updateData);
            Log::info('Updated visitor information', ['conversation_id' => $conversation->id, 'data' => $updateData]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Visitor information updated successfully'
        ]);
    }
}