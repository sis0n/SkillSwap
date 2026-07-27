<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\UserSkill;

use App\Models\UserSkill;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:1000'],
            'experience_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,expert'],
            'years_of_experience' => ['nullable', 'integer', 'min:0', 'max:60'],
            'teaching_style' => ['nullable', 'string', 'max:500'],
            'featured' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $featured = $this->input('featured');

            if ($featured === true || $featured === '1' || $featured === 1) {
                $userSkill = $this->route('userSkill');

                $featuredCount = UserSkill::where('user_id', $userSkill->user_id)
                    ->where('featured', true)
                    ->where('id', '!=', $userSkill->id)
                    ->count();

                if ($featuredCount >= 3) {
                    $validator->errors()->add('featured', 'You can only feature up to 3 skills.');
                }
            }
        });
    }

    public function prepareForValidation(): void
    {
        if ($this->has('featured') && $this->input('featured') === 'false') {
            $this->merge(['featured' => false]);
        }
    }
}
