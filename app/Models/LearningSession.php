<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LearningSession extends Model
{
    protected $fillable = [
        'exchange_request_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'meeting_link',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    public function exchangeRequest(): BelongsTo
    {
        return $this->belongsTo(ExchangeRequest::class);
    }

    public function resources(): HasMany
    {
        return $this->hasMany(SessionResource::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
