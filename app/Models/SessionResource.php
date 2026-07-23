<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionResource extends Model
{
    protected $fillable = [
        'learning_session_id',
        'title',
        'url',
        'type',
    ];

    public function learningSession(): BelongsTo
    {
        return $this->belongsTo(LearningSession::class);
    }
}
