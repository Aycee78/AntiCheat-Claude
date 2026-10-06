<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Violation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ViolationController extends Controller
{
    // Student side: report a violation
    public function store(Request $request, ExamSession $examSession): JsonResponse
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(array_keys(Violation::TYPES))],
            'details' => 'nullable|string|max:500',
        ]);

        if ($examSession->status !== 'in_progress') {
            return response()->json(['message' => 'Session is already submitted.'], 409);
        }

        $violation = $examSession->violations()->create([
            'type' => $data['type'],
            'severity' => Violation::TYPES[$data['type']],
            'details' => $data['details'] ?? null,
        ]);

        $count = $examSession->violations()->count();
        $max = $examSession->exam->max_violations;

        return response()->json([
            'violation' => $violation,
            'violation_count' => $count,
            'max_violations' => $max,
            'limit_reached' => $count >= $max,
        ], 201);
    }

    // Admin: violations for one student session
    public function index(ExamSession $examSession): JsonResponse
    {
        return response()->json($examSession->violations()->latest()->get());
    }

    // Admin: full violation log for an exam
    public function forExam(Exam $exam): JsonResponse
    {
        $log = Violation::whereHas('session', fn ($q) => $q->where('exam_id', $exam->id))
            ->with('session:id,student_name,student_number')
            ->latest()
            ->get();

        return response()->json($log);
    }
}