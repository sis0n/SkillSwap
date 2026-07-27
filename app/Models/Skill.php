<?php

namespace App\Models;

use Database\Factories\SkillFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Skill extends Model
{
    /** @use HasFactory<SkillFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'sort_order',
        'is_system',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(SkillCategory::class, 'skill_category_skill')
            ->orderBy('skill_categories.sort_order')
            ->orderBy('skill_categories.name');
    }

    public function userSkills(): HasMany
    {
        return $this->hasMany(UserSkill::class);
    }

    public function scopeSearch($query, string $term): void
    {
        $query->where('name', 'like', "%{$term}%");
    }
}
