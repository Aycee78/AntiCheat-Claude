<?php

namespace Database\Seeders;

use App\Models\Exam;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $exam = Exam::firstOrCreate(
            ['title' => 'Demo Exam'],
            ['duration_minutes' => 30, 'max_violations' => 3, 'status' => 'published'],
        );

        if ($exam->questions()->doesntExist()) {
            $exam->questions()->createMany([
                ['position' => 1, 'type' => 'multiple_choice', 'prompt' => 'What is 2 + 2?', 'options' => ['3', '4', '5']],
                ['position' => 2, 'type' => 'checkboxes', 'prompt' => 'Select the prime numbers.', 'options' => ['2', '4', '5', '9']],
                ['position' => 3, 'type' => 'short_answer', 'prompt' => 'What is the capital of France?'],
                ['position' => 4, 'type' => 'paragraph', 'prompt' => 'Explain what a database index does.'],
            ]);
        }
    }
}
