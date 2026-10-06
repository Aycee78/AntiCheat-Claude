<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('exam_code', 12)->unique();
            $table->string('form_url');
            $table->unsignedInteger('duration_minutes');
            $table->unsignedTinyInteger('max_violations')->default(3);
            $table->string('status', 20)->default('published')->index(); // draft | published
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};