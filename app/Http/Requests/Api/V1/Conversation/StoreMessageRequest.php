<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Conversation;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:2000'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $body = trim((string) $this->input('body'));

        $this->merge(['body' => $body]);
    }
}
