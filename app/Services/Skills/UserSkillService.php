<?php

declare(strict_types=1);

namespace App\Services\Skills;

use App\Models\Skill;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserSkillService
{
    public function getUserSkills(User $user, ?int $categoryId = null): Collection
    {
        $query = $user->userSkills()->with(['skill.categories']);

        if ($categoryId !== null) {
            $query->whereHas('skill.categories', fn ($q) => $q->where('skill_categories.id', $categoryId));
        }

        return $query
            ->orderByDesc('featured')
            ->orderByRaw("CASE WHEN type = 'teaching' THEN 0 ELSE 1 END")
            ->orderBy(
                Skill::select('name')
                    ->whereColumn('id', 'user_skills.skill_id')
                    ->limit(1)
            )
            ->get();
    }

    public function createUserSkill(User $user, array $data): UserSkill
    {
        return DB::transaction(function () use ($user, &$data) {
            if (isset($data['skill_name'])) {
                $categoryIds = $data['category_ids'];
                $skillName = trim(preg_replace('/\s+/', ' ', $data['skill_name']));

                $skill = Skill::whereRaw('LOWER(name) = ?', [mb_strtolower($skillName)])->first();

                if (!$skill) {
                    $slug = Str::slug($skillName);
                    $baseSlug = $slug;
                    $counter = 1;
                    while (Skill::where('slug', $slug)->exists()) {
                        $slug = $baseSlug . '-' . $counter++;
                    }

                    $skill = Skill::create([
                        'name' => $skillName,
                        'slug' => $slug,
                        'sort_order' => 0,
                        'is_system' => false,
                        'created_by' => $user->id,
                    ]);
                }

                $skill->categories()->syncWithoutDetaching($categoryIds);

                $data['skill_id'] = $skill->id;
                unset($data['skill_name'], $data['category_ids']);
            }

            return $user->userSkills()->create($data)->load(['skill.categories']);
        });
    }

    public function updateUserSkill(UserSkill $userSkill, array $data): UserSkill
    {
        return DB::transaction(function () use ($userSkill, $data) {
            $userSkill->update($data);

            return $userSkill->fresh()->load(['skill.categories']);
        });
    }

    public function deleteUserSkill(UserSkill $userSkill): void
    {
        $hasActiveTeachingRequests = $userSkill->teachingExchangeRequests()
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        $hasActiveLearningRequests = $userSkill->learningExchangeRequests()
            ->whereIn('status', ['pending', 'accepted'])
            ->exists();

        if ($hasActiveTeachingRequests || $hasActiveLearningRequests) {
            throw new \RuntimeException('Cannot delete a skill that is part of an active exchange request.');
        }

        $userSkill->delete();
    }
}
