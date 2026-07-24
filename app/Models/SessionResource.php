<?php

namespace App\Models;

use Database\Factories\SessionResourceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionResource extends Model
{
    /** @use HasFactory<SessionResourceFactory> */
    use HasFactory;

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
