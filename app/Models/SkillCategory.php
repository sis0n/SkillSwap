<?php

namespace App\Models;

use Database\Factories\SkillCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SkillCategory extends Model
{
    /** @use HasFactory<SkillCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'sort_order',
    ];

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'skill_category_skill');
    }

    public function scopeOrdered($query): void
    {
        $query->orderBy('sort_order')->orderBy('name');
    }
}
