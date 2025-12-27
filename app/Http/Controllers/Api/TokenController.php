<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TokenController extends Controller
{
    /**
     * Validate token endpoint
     * This simply returns 200 if token is valid, 401 if not
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validateToken(Request $request)
    {
        // The auth middleware already checks token validity
        // If we reach here, token is valid
        return response()->json([
            'status' => 'success',
            'valid' => true
        ]);
    }
}