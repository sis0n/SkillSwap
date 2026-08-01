<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\ExchangeRequest;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExchangeRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'teaching_skill_id' => ['nullable', 'integer', 'exists:user_skills,id'],
            'learning_skill_id' => ['nullable', 'integer', 'exists:user_skills,id'],
            'message' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('message')) {
            return;
        }

        $message = trim((string) $this->input('message'));

        $this->merge(['message' => $message === '' ? null : $message]);
    }
}
