<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Discover;

use Illuminate\Foundation\Http\FormRequest;

class DiscoverSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:255'],
            'category_id' => ['nullable', 'integer', 'exists:skill_categories,id'],
            'type' => ['nullable', 'string', 'in:teaching,learning'],
            'experience_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced,expert'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
