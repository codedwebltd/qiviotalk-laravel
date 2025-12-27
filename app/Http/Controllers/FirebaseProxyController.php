<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirebaseProxyController extends Controller
{
    /**
     * Firebase project configuration
     */
    protected $config = [
        'projectId' => 'livechat-tidu',
        'apiKey' => 'AIzaSyADZjk57dZ82lopzyCZf1pW0-a14BrIHOU'
    ];

    /**
     * Test Firebase connection
     */
    public function testFirebase()
    {
        try {
            // Create test document
            $testData = [
                'timestamp' => now()->toIso8601String(),
                'message' => 'Server test connection',
                'test' => true
            ];

            // Get Firestore base URL
           $url = "https://firestore.googleapis.com/v1/projects/{$this->config['projectId']}/databases/livechat-tidu-database/documents/test/server-test";

            // Convert data to Firestore format
            $fields = [];
            foreach ($testData as $key => $value) {
                if (is_bool($value)) {
                    $fields[$key] = ['booleanValue' => $value];
                } else if (is_string($value)) {
                    $fields[$key] = ['stringValue' => $value];
                }
            }

            // Make API request
            $response = Http::patch($url, ['fields' => $fields]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Firebase connection successful',
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Firebase connection failed',
                'error' => $response->body()
            ]);
        } catch (\Exception $e) {
            Log::error('Firebase test error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Firebase connection failed',
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Create a proxy API for browser to use instead of direct Firebase
     */
    public function proxyRequest(Request $request)
    {
        try {
            // Get parameters
            $collection = $request->input('collection');
            $document = $request->input('document');
            $data = $request->input('data');

            if (!$collection || !$document) {
                return response()->json([
                    'error' => 'Collection and document ID required'
                ], 400);
            }

            // Create Firestore URL
            $url = "https://firestore.googleapis.com/v1/projects/{$this->config['projectId']}/databases/livechat-tidu-database/documents/{$collection}/{$document}";

            if ($request->isMethod('get')) {
                // Read document
                $response = Http::get($url);
            } else {
                // Convert data to Firestore format
                $fields = [];
                foreach ($data as $key => $value) {
                    if (is_bool($value)) {
                        $fields[$key] = ['booleanValue' => $value];
                    } else if (is_string($value)) {
                        $fields[$key] = ['stringValue' => $value];
                    } else if (is_numeric($value)) {
                        if (is_int($value)) {
                            $fields[$key] = ['integerValue' => $value];
                        } else {
                            $fields[$key] = ['doubleValue' => $value];
                        }
                    } else if (is_array($value)) {
                        $fields[$key] = ['mapValue' => ['fields' => $this->formatFirestoreData($value)]];
                    } else if (is_null($value)) {
                        $fields[$key] = ['nullValue' => null];
                    }
                }

                // Write document
                $response = Http::patch($url, ['fields' => $fields]);
            }

            // Return response
            return response()->json($response->json());
            
        } catch (\Exception $e) {
            Log::error('Firebase proxy error: ' . $e->getMessage());
            
            return response()->json([
                'error' => 'Firebase proxy error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper to format data for Firestore
     */
    private function formatFirestoreData($data)
    {
        $fields = [];
        
        foreach ($data as $key => $value) {
            if (is_bool($value)) {
                $fields[$key] = ['booleanValue' => $value];
            } else if (is_string($value)) {
                $fields[$key] = ['stringValue' => $value];
            } else if (is_numeric($value)) {
                if (is_int($value)) {
                    $fields[$key] = ['integerValue' => $value];
                } else {
                    $fields[$key] = ['doubleValue' => $value];
                }
            } else if (is_array($value)) {
                $fields[$key] = ['mapValue' => ['fields' => $this->formatFirestoreData($value)]];
            } else if (is_null($value)) {
                $fields[$key] = ['nullValue' => null];
            }
        }
        
        return $fields;
    }
}