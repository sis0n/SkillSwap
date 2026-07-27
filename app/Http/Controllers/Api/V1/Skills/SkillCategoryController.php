<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Skills;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\SkillCategory;
use Illuminate\Http\JsonResponse;

class SkillCategoryController extends BaseController
{
    public function index(): JsonResponse
    {
        $categories = SkillCategory::ordered()->get();

        return $this->success(
            data: [
                'skill_categories' => $categories,
            ],
            message: 'Skill categories retrieved.',
        );
    }
}
