<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class QuestionController extends Controller
{
    // Admin: import the full question list for an exam
    public function import(Request $request, Exam $exam): JsonResponse
    {
        $data = $request->validate([
            'questions' => 'required|array|min:1',
            'questions.*.type' => ['required', Rule::in(Question::TYPES)],
            'questions.*.prompt' => 'required|string|max:2000',
            'questions.*.options' => 'nullable|array',
            'questions.*.options.*' => 'string|max:500',
            'questions.*.required' => 'sometimes|boolean',
        ]);

        if ($exam->sessions()->exists()) {
            return response()->json(['message' => 'Students have already started this exam.'], 409);
        }

        foreach ($data['questions'] as $i => $q) {
            if (in_array($q['type'], Question::CHOICE_TYPES) && count($q['options'] ?? []) < 2) {
                throw ValidationException::withMessages([
                    "questions.$i.options" => 'Choice questions need at least 2 options.',
                ]);
            }
        }

        DB::transaction(function () use ($exam, $data) {
            $exam->questions()->delete();

            foreach ($data['questions'] as $i => $q) {
                $exam->questions()->create([
                    'position' => $i + 1,
                    'type' => $q['type'],
                    'prompt' => $q['prompt'],
                    'options' => in_array($q['type'], Question::CHOICE_TYPES) ? $q['options'] : null,
                    'required' => $q['required'] ?? true,
                ]);
            }
        });

        return response()->json($exam->questions()->get(), 201);
    }

    // Admin: view an exam's questions
    public function index(Exam $exam): JsonResponse
    {
        return response()->json($exam->questions()->get());
    }

    // Student: questions for their active session
    public function forSession(ExamSession $examSession): JsonResponse
    {
        if ($examSession->status !== 'in_progress') {
            return response()->json(['message' => 'Session is already submitted.'], 409);
        }

        return response()->json($examSession->exam->questions()->get());
    }
}