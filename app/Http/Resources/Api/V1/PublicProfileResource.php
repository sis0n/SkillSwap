<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->profile;

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,
            'username' => $this->username,
            'created_at' => $this->created_at,
            'profile' => $profile ? [
                'bio' => $profile->bio,
                'headline' => $profile->headline,
                'avatar_url' => $profile->avatar_url,
                'location' => $profile->location,
                'website' => $profile->website,
                'experience_level' => $profile->experience_level,
                'timezone' => $profile->timezone,
            ] : null,
            'languages' => $this->when($this->relationLoaded('languages'), function () {
                return $this->languages->map(fn ($lang) => [
                    'code' => $lang->code,
                    'name' => $lang->name,
                    'native_name' => $lang->native_name,
                    'proficiency' => $lang->pivot->proficiency,
                ]);
            }),
            'availability' => AvailabilityResource::collection(
                $this->whenLoaded('availability')
            ),
            'portfolio_links' => PortfolioLinkResource::collection(
                $this->whenLoaded('portfolioLinks')
            ),
            'user_skills' => $this->when($this->relationLoaded('userSkills'), function () {
                $skills = $this->userSkills->sort(function ($a, $b) {
                    if ($a->featured !== $b->featured) {
                        return $b->featured <=> $a->featured;
                    }
                    if ($a->type !== $b->type) {
                        return $a->type === 'teaching' ? -1 : 1;
                    }
                    return strcasecmp($a->skill->name ?? '', $b->skill->name ?? '');
                });

                return [
                    'teaching' => UserSkillResource::collection(
                        $skills->where('type', 'teaching')->values()
                    ),
                    'learning' => UserSkillResource::collection(
                        $skills->where('type', 'learning')->values()
                    ),
                ];
            }),
        ];
    }
}
