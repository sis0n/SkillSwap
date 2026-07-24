<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    const ADMIN = 'admin';
    const USER = 'user';

    protected $fillable = [
        'name',
        'slug',
    ];

    public static function findBySlug(string $slug): self
    {
        return static::where('slug', $slug)->firstOrFail();
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
