<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->when($this->relationLoaded('role') && $this->role, function () {
                return [
                    'id' => $this->role->id,
                    'name' => $this->role->name,
                    'slug' => $this->role->slug,
                ];
            }),
            'first_name' => $this->first_name,
            'middle_name' => $this->middle_name,
            'last_name' => $this->last_name,
            'suffix' => $this->suffix,
            'username' => $this->username,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'profile' => $this->when($this->relationLoaded('profile') && $this->profile, function () {
                $profile = $this->profile;

                return [
                    'bio' => $profile->bio,
                    'headline' => $profile->headline,
                    'avatar_url' => $profile->avatar_url,
                    'location' => $profile->location,
                    'website' => $profile->website,
                    'experience_level' => $profile->experience_level,
                    'timezone' => $profile->timezone,
                ];
            }),
            'languages' => $this->when($this->relationLoaded('languages'), function () {
                return $this->languages->map(fn ($lang) => [
                    'code' => $lang->code,
                    'name' => $lang->name,
                    'native_name' => $lang->native_name,
                    'proficiency' => $lang->pivot->proficiency,
                ]);
            }),
        ];
    }
}
