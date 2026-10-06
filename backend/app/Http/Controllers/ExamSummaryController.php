<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Violation;
use Illuminate\Http\JsonResponse;

class ExamSummaryController extends Controller
{
    public function __invoke(Exam $exam): JsonResponse
    {
        $students = $exam->sessions()
            ->withCount([
                'violations',
                'violations as high_violations_count' => fn ($q) => $q->where('severity', 'high'),
                'answers',
            ])
            ->orderBy('started_at')
            ->get()
            ->map(fn ($s) => [
                'session_id' => $s->id,
                'student_name' => $s->student_name,
                'student_number' => $s->student_number,
                'status' => $s->status,
                'submit_reason' => $s->submit_reason,
                'started_at' => $s->started_at,
                'submitted_at' => $s->submitted_at,
                'violation_count' => $s->violations_count,
                'high_violation_count' => $s->high_violations_count,
                'answered_count' => $s->answers_count,
            ])
            ->values();

        $violations = Violation::whereHas('session', fn ($q) => $q->where('exam_id', $exam->id));

        return response()->json([
            'exam' => $exam->only(['id', 'title', 'exam_code', 'status', 'duration_minutes', 'max_violations']),
            'totals' => [
                'sessions' => $students->count(),
                'in_progress' => $students->where('status', 'in_progress')->count(),
                'submitted' => $students->where('status', 'submitted')->count(),
                'auto_submitted' => $students->where('status', 'auto_submitted')->count(),
                'questions' => $exam->questions()->count(),
                'violations' => $students->sum('violation_count'),
            ],
            'violations_by_type' => (object) (clone $violations)
                ->selectRaw('type, count(*) as total')->groupBy('type')->pluck('total', 'type')->all(),
            'violations_by_severity' => (object) (clone $violations)
                ->selectRaw('severity, count(*) as total')->groupBy('severity')->pluck('total', 'severity')->all(),
            'students' => $students,
        ]);
    }
}