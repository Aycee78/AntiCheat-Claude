<?php

use Illuminate\Support\Facades\Route;

// The backend is API-only. The real home page is the React app (frontend/).
Route::get('/', fn () => response()->json([
    'app' => 'AntiCheat API',
    'message' => 'Backend is running. Open the React app at http://localhost:5180',
    'health_check' => url('/api/ping'),
]));