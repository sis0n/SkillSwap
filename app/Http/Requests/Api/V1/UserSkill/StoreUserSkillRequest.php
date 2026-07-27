<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\UserSkill;

use App\Models\UserSkill;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'skill_id' => ['required_without:skill_name', 'integer', 'exists:skills,id'],
            'skill_name' => ['required_without:skill_id', 'string', 'max:255'],
            'category_ids' => ['required_with:skill_name', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'distinct', 'exists:skill_categories,id'],
            'type' => ['required', 'string', 'in:teaching,learning'],
            'title' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'experience_level' => ['required', 'string', 'in:beginner,intermediate,advanced,expert'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'teaching_style' => ['nullable', 'string', 'max:500'],
            'featured' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $user = $this->user();

            $skillId = $this->input('skill_id');

            if (!$skillId && $this->input('skill_name')) {
                $normalizedName = trim(preg_replace('/\s+/', ' ', $this->input('skill_name')));
                $existing = \App\Models\Skill::whereRaw('LOWER(name) = ?', [mb_strtolower($normalizedName)])->first();
                if ($existing) {
                    $skillId = $existing->id;
                }
            }

            if ($skillId) {
                $exists = UserSkill::where('user_id', $user->id)
                    ->where('skill_id', $skillId)
                    ->where('type', $this->input('type'))
                    ->exists();

                if ($exists) {
                    $validator->errors()->add('skill_id', 'You have already added this skill for ' . $this->input('type') . '.');
                }
            }

            $count = UserSkill::where('user_id', $user->id)->count();
            if ($count >= 30) {
                $validator->errors()->add('skill_id', 'You can only have up to 30 skills.');
            }

            if ($this->input('featured')) {
                $featuredCount = UserSkill::where('user_id', $user->id)->where('featured', true)->count();
                if ($featuredCount >= 3) {
                    $validator->errors()->add('featured', 'You can only feature up to 3 skills.');
                }
            }
        });
    }
}
