<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Exam extends Model
{
    protected $fillable = [
        'title', 'form_url', 'duration_minutes', 'max_violations', 'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Exam $exam) {
            do {
                $code = Str::upper(Str::random(6));
            } while (static::where('exam_code', $code)->exists());

            $exam->exam_code = $code;
        });
    }

        public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class);
    }
    
        public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('position');
    }
    
}