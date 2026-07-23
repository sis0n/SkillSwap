<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserSkill extends Model
{
    protected $fillable = [
        'user_id',
        'skill_id',
        'type',
        'title',
        'description',
        'experience_level',
        'years_of_experience',
        'teaching_style',
        'portfolio_url',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class);
    }

    public function teachingExchangeRequests(): HasMany
    {
        return $this->hasMany(ExchangeRequest::class, 'teaching_skill_id');
    }

    public function learningExchangeRequests(): HasMany
    {
        return $this->hasMany(ExchangeRequest::class, 'learning_skill_id');
    }
}
