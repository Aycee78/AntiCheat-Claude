<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->string('student_name');
            $table->string('student_number', 50);
            $table->string('status', 20)->default('in_progress')->index(); // in_progress | submitted | auto_submitted
            $table->timestamp('started_at');
            $table->timestamp('expires_at');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['exam_id', 'student_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_sessions');
    }
};