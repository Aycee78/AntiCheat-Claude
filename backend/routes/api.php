<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\ExamSessionController;
use App\Http\Controllers\ViolationController;
use App\Http\Controllers\AnswerController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ExamSummaryController;

// All routes here are automatically prefixed with /api

// Health check - the React home page calls this to show "Backend online"
Route::get('/ping', fn () => response()->json([
    'app' => 'AntiCheat API',
    'status' => 'ok',
    'time' => now()->toIso8601String(),
]));

Route::get('/exams', [ExamController::class, 'index']);
Route::post('/exams', [ExamController::class, 'store']);
Route::get('/exams/code/{code}', [ExamController::class, 'showByCode']);

Route::post('/exams/code/{code}/sessions', [ExamSessionController::class, 'start']);
Route::get('/sessions/{examSession}', [ExamSessionController::class, 'show']);
Route::get('/exams/{exam}/sessions', [ExamSessionController::class, 'index']);

Route::post('/sessions/{examSession}/violations', [ViolationController::class, 'store']);
Route::get('/sessions/{examSession}/violations', [ViolationController::class, 'index']);
Route::get('/exams/{exam}/violations', [ViolationController::class, 'forExam']);

Route::post('/sessions/{examSession}/submit', [ExamSessionController::class, 'submit']);

Route::get('/exams/{exam}/questions', [QuestionController::class, 'index']);
Route::post('/exams/{exam}/questions', [QuestionController::class, 'import']);
Route::get('/sessions/{examSession}/questions', [QuestionController::class, 'forSession']);
Route::put('/sessions/{examSession}/answers', [AnswerController::class, 'save']);
Route::get('/sessions/{examSession}/answers', [AnswerController::class, 'index']);
Route::get('/exams/{exam}/summary', ExamSummaryController::class);