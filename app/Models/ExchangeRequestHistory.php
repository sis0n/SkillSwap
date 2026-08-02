<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExchangeRequestHistory extends Model
{
    protected $table = 'exchange_request_history';

    protected $fillable = [
        'exchange_request_id',
        'edited_by',
        'teaching_skill_id',
        'learning_skill_id',
        'message',
        'status',
    ];

    public function exchangeRequest(): BelongsTo
    {
        return $this->belongsTo(ExchangeRequest::class);
    }

    public function editedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    public function teachingSkill(): BelongsTo
    {
        return $this->belongsTo(UserSkill::class, 'teaching_skill_id');
    }

    public function learningSkill(): BelongsTo
    {
        return $this->belongsTo(UserSkill::class, 'learning_skill_id');
    }
}