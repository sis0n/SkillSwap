<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\PortfolioLinkFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioLink extends Model
{
    /** @use HasFactory<PortfolioLinkFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'url',
        'display_order',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
