<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Profile;

use App\Rules\ValidPortfolioUrl;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'platform' => ['required', 'string', 'max:30', 'in:' . implode(',', ValidPortfolioUrl::platforms())],
            'url' => ['required', 'string', 'max:500', new ValidPortfolioUrl($this->platform ?? '')],
            'display_order' => ['nullable', 'integer', 'min:0', 'max:32767'],
        ];
    }
}
