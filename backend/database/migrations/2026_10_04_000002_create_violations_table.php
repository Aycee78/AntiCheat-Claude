<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('violations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_session_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30)->index();     // tab_switch | window_blur | app_detected | other
            $table->string('severity', 10);          // low | medium | high
            $table->string('details', 500)->nullable(); // e.g. "WINWORD.EXE", "Notes"
            $table->timestamps();

            $table->index(['exam_session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('violations');
    }
};