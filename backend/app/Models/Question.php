<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    public const TYPES = ['multiple_choice', 'checkboxes', 'short_answer', 'paragraph'];
    public const CHOICE_TYPES = ['multiple_choice', 'checkboxes'];

    protected $fillable = ['exam_id', 'position', 'type', 'prompt', 'options', 'required'];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'required' => 'boolean',
        ];
    }
}