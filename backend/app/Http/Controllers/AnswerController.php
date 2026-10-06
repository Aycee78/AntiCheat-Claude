<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\ExamSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AnswerController extends Controller
{
    // Student: autosave (upsert) answers
    public function save(Request $request, ExamSession $examSession): JsonResponse
    {
        $data = $request->validate([
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|integer',
            'answers.*.value' => 'nullable',
        ]);

        if ($examSession->status !== 'in_progress') {
            return response()->json(['message' => 'Session is already submitted.'], 409);
        }

        if (now()->gt($examSession->expires_at->copy()->addSeconds(30))) {
            return response()->json(['message' => 'Time is up.'], 409);
        }

        $validIds = $examSession->exam->questions()->pluck('id')->all();

        foreach ($data['answers'] as $i => $a) {
            if (! in_array($a['question_id'], $validIds)) {
                throw ValidationException::withMessages([
                    "answers.$i.question_id" => 'Question does not belong to this exam.',
                ]);
            }
        }

        foreach ($data['answers'] as $a) {
            Answer::updateOrCreate(
                ['exam_session_id' => $examSession->id, 'question_id' => $a['question_id']],
                ['value' => $a['value'] ?? null],
            );
        }

        return response()->json(['saved' => count($data['answers']), 'saved_at' => now()->toIso8601String()]);
    }

    // Student (resume) / Admin: view saved answers
    public function index(ExamSession $examSession): JsonResponse
    {
        return response()->json($examSession->answers()->get());
    }
}