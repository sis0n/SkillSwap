<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscoverUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var User $this */
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,
            'username' => $this->username,
            'avatar_url' => $this->profile?->avatar_url,
            'headline' => $this->profile?->headline,
            'location' => $this->profile?->location,
            'matched_skills' => $this->formatMatchedSkills(),
            'matched_skills_count' => $this->matched_skills_count ?? 0,
        ];
    }

    private function formatMatchedSkills(): array
    {
        $skills = $this->matched_skills_collection ?? collect();

        return $skills->map(fn ($us) => [
            'id' => $us->skill_id,
            'name' => $us->skill->name,
            'type' => $us->type,
            'experience_level' => $us->experience_level,
        ])->values()->toArray();
    }
}
