<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\Api\V1\LanguageResource;
use App\Models\Language;

class LanguageController extends BaseController
{
    public function index()
    {
        $languages = Language::orderBy('sort_order')->get();

        return $this->success(
            data: [
                'languages' => LanguageResource::collection($languages),
            ],
            message: 'Languages retrieved.',
        );
    }
}
