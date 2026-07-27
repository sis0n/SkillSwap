<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSkillResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $categories = $this->skill->categories->map(fn ($cat) => [
            'id' => $cat->id,
            'name' => $cat->name,
            'slug' => $cat->slug,
        ]);

        return [
            'id' => $this->id,
            'skill_id' => $this->skill_id,
            'skill' => [
                'id' => $this->skill->id,
                'name' => $this->skill->name,
                'slug' => $this->skill->slug,
                'sort_order' => $this->skill->sort_order,
                'categories' => $categories,
            ],
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'experience_level' => $this->experience_level,
            'years_of_experience' => $this->years_of_experience,
            'teaching_style' => $this->teaching_style,
            'featured' => $this->featured,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
