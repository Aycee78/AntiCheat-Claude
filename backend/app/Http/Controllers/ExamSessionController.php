<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExamSessionController extends Controller
{
    // Student: enter details and start (or resume) a session
    public function start(Request $request, string $code): JsonResponse
    {
        $data = $request->validate([
            'student_name' => 'required|string|max:255',
            'student_number' => 'required|string|max:50',
        ]);

        $exam = Exam::where('exam_code', strtoupper($code))
            ->where('status', 'published')
            ->first();

        if (! $exam) {
            return response()->json(['message' => 'Invalid exam code.'], 404);
        }

        $existing = $exam->sessions()
            ->where('student_number', $data['student_number'])
            ->latest()
            ->first();

        if ($existing && $existing->status !== 'in_progress') {
            return response()->json(['message' => 'You have already submitted this exam.'], 409);
        }

        if ($existing) {
            return response()->json($existing->load('exam'));
        }

        $now = now();

        $session = $exam->sessions()->create([
            ...$data,
            'started_at' => $now,
            'expires_at' => $now->copy()->addMinutes($exam->duration_minutes),
        ]);

        return response()->json($session->load('exam'), 201);
    }

    // Student/Admin: view one session
    public function show(ExamSession $examSession): JsonResponse
    {
        return response()->json($examSession->load('exam'));
    }

    // Admin: "View submissions" for an exam
    public function index(Exam $exam): JsonResponse
    {
        return response()->json($exam->sessions()->latest()->get());
    }

        // Student: submit (manual) or auto-submit (time_up / max_violations)
    public function submit(Request $request, ExamSession $examSession): JsonResponse
    {
        $data = $request->validate([
            'reason' => 'sometimes|in:manual,time_up,max_violations',
        ]);
        $reason = $data['reason'] ?? 'manual';

        // Already submitted: return the existing result
        if ($examSession->status !== 'in_progress') {
            return response()->json($examSession->load('exam'));
        }

        if ($reason === 'time_up' && now()->lt($examSession->expires_at)) {
            return response()->json(['message' => 'Time has not run out yet.'], 422);
        }

        if ($reason === 'max_violations'
            && $examSession->violations()->count() < $examSession->exam->max_violations) {
            return response()->json(['message' => 'Violation limit not reached.'], 422);
        }

        $examSession->update([
            'status' => $reason === 'manual' ? 'submitted' : 'auto_submitted',
            'submit_reason' => $reason,
            'submitted_at' => now(),
        ]);

        return response()->json($examSession->fresh()->load('exam'));
    }
    
}