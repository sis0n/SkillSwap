<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidPortfolioUrl implements ValidationRule
{
    private const PLATFORMS = [
        'github' => '/^(https?:\/\/)?(www\.)?github\.com\/.+/i',
        'gitlab' => '/^(https?:\/\/)?(www\.)?gitlab\.com\/.+/i',
        'linkedin' => '/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/.+/i',
        'behance' => '/^(https?:\/\/)?(www\.)?behance\.net\/.+/i',
        'dribbble' => '/^(https?:\/\/)?(www\.)?dribbble\.com\/.+/i',
        'figma' => '/^(https?:\/\/)?(www\.)?figma\.com\/.+/i',
        'codepen' => '/^(https?:\/\/)?(www\.)?codepen\.io\/.+/i',
        'youtube' => '/^(https?:\/\/)?(www\.)?(youtube\.com\/|youtu\.be\/).+/i',
        'medium' => '/^(https?:\/\/)?(www\.)?medium\.com\/.+/i',
        'devto' => '/^(https?:\/\/)?(www\.)?dev\.to\/.+/i',
        'website' => '/^https?:\/\/.+/i',
    ];

    public function __construct(
        private readonly string $platform,
    ) {}

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            $fail('The :attribute must be a string.');
            return;
        }

        if (!isset(self::PLATFORMS[$this->platform])) {
            $fail("The platform '{$this->platform}' is not supported.");
            return;
        }

        if (!preg_match(self::PLATFORMS[$this->platform], $value)) {
            $fail("The :attribute must be a valid {$this->platform} URL.");
        }
    }

    public static function platforms(): array
    {
        return array_keys(self::PLATFORMS);
    }
}
