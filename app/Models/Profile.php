<?php

namespace App\Models;

use Database\Factories\ProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Profile extends Model
{
    /** @use HasFactory<ProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'headline',
        'avatar',
        'location',
        'website',
        'experience_level',
        'timezone',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->avatar) {
            return null;
        }

        return url(Storage::url($this->avatar));
    }

    public static function completionScoreSql(string $userAlias = 'users', string $profileTable = 'profiles'): string
    {
        return "(
            CASE WHEN {$profileTable}.avatar IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN {$profileTable}.headline IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN {$profileTable}.bio IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN {$profileTable}.experience_level IN ('intermediate', 'advanced') THEN 1 ELSE 0 END +
            CASE WHEN {$profileTable}.location IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN {$profileTable}.timezone IS NOT NULL THEN 1 ELSE 0 END +
            CASE WHEN EXISTS (SELECT 1 FROM user_availability WHERE user_availability.user_id = {$userAlias}.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS (SELECT 1 FROM portfolio_links WHERE portfolio_links.user_id = {$userAlias}.id) THEN 1 ELSE 0 END +
            CASE WHEN EXISTS (SELECT 1 FROM user_languages WHERE user_languages.user_id = {$userAlias}.id) THEN 1 ELSE 0 END
        ) >= 5";
    }
}
