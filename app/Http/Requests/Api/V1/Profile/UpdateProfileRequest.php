<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Profile;

use App\Rules\ValidPortfolioUrl;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'headline' => ['nullable', 'string', 'max:100'],
            'bio' => ['nullable', 'string', 'max:500'],
            'location' => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string', 'url', 'max:200'],
            'experience_level' => ['nullable', 'string', 'in:beginner,intermediate,advanced'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'languages' => ['nullable', 'array'],
            'languages.*.code' => ['required_with:languages', 'string', 'exists:languages,code'],
            'languages.*.proficiency' => ['required_with:languages', 'string', 'in:native,fluent,intermediate,beginner'],
            'portfolio_links' => ['nullable', 'array'],
            'portfolio_links.*.platform' => ['required_with:portfolio_links', 'string', 'in:' . implode(',', ValidPortfolioUrl::platforms())],
            'portfolio_links.*.url' => ['required_with:portfolio_links', 'string', 'max:500'],
        ];
    }
}
