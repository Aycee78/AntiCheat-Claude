<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSession extends Model
{
    protected $fillable = [
        'exam_id', 'student_name', 'student_number',
                'status', 'submit_reason', 'started_at', 'expires_at', 'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }

        public function answers(): HasMany
    {
        return $this->hasMany(Answer::class);
    }
    
}