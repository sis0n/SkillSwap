<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Skills;

use App\Http\Controllers\Api\V1\BaseController;
use App\Models\Skill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkillController extends BaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = Skill::with('categories');

        if ($search = $request->input('search')) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . mb_strtolower($search) . '%']);
        }

        if ($request->has('category_id') && $categoryId = $request->integer('category_id')) {
            $query->whereHas('categories', fn ($q) => $q->where('skill_categories.id', $categoryId));
        }

        $skills = $query->orderBy('sort_order')->orderBy('name')->get();

        return $this->success(
            data: [
                'skills' => $skills,
            ],
            message: 'Skills retrieved.',
        );
    }
}
