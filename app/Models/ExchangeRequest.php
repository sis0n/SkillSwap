<?php

namespace App\Models;

use Database\Factories\ExchangeRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ExchangeRequest extends Model
{
    /** @use HasFactory<ExchangeRequestFactory> */
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'teaching_skill_id',
        'learning_skill_id',
        'message',
        'status',
        'reconfirmation_required_by',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function teachingSkill(): BelongsTo
    {
        return $this->belongsTo(UserSkill::class, 'teaching_skill_id');
    }

    public function history(): HasMany
    {
        return $this->hasMany(ExchangeRequestHistory::class)->latest('id');
    }

    public function learningSkill(): BelongsTo
    {
        return $this->belongsTo(UserSkill::class, 'learning_skill_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class);
    }

    public function learningSessions(): HasMany
    {
        return $this->hasMany(LearningSession::class);
    }
}
