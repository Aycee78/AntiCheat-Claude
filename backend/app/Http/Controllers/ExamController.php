<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    // Admin: list exams
    public function index(): JsonResponse
    {
        return response()->json(Exam::latest()->get());
    }

    // Admin: import/save/publish exam
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'form_url' => 'nullable|url|max:2048',
            'duration_minutes' => 'required|integer|min:1|max:600',
            'max_violations' => 'sometimes|integer|min:1|max:20',
            'status' => 'sometimes|in:draft,published',
        ]);

        return response()->json(Exam::create($data), 201);
    }

    // Student: validate exam code
    public function showByCode(string $code): JsonResponse
    {
        $exam = Exam::where('exam_code', strtoupper($code))
            ->where('status', 'published')
            ->first();

        if (! $exam) {
            return response()->json(['message' => 'Invalid exam code.'], 404);
        }

        return response()->json($exam);
    }
}