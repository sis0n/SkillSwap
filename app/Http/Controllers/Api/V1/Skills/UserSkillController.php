<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Skills;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\UserSkill\StoreUserSkillRequest;
use App\Http\Requests\Api\V1\UserSkill\UpdateUserSkillRequest;
use App\Http\Resources\Api\V1\UserSkillResource;
use App\Models\UserSkill;
use App\Services\Skills\UserSkillService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UserSkillController extends BaseController
{
    public function __construct(
        private readonly UserSkillService $userSkillService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        if ($request->has('category_id')) {
            $request->validate([
                'category_id' => ['integer', 'exists:skill_categories,id'],
            ]);
        }

        $skills = $this->userSkillService->getUserSkills(
            $request->user(),
            $request->has('category_id') ? $request->integer('category_id') : null,
        );

        return $this->success(
            data: [
                'user_skills' => UserSkillResource::collection($skills),
            ],
            message: 'User skills retrieved.',
        );
    }

    public function store(StoreUserSkillRequest $request): JsonResponse
    {
        $skill = $this->userSkillService->createUserSkill(
            $request->user(),
            $request->validated(),
        );

        return $this->created(
            data: [
                'user_skill' => new UserSkillResource($skill),
            ],
            message: 'User skill created.',
        );
    }

    public function update(UpdateUserSkillRequest $request, UserSkill $userSkill): JsonResponse
    {
        if ($userSkill->user_id !== $request->user()->id) {
            return $this->forbidden('You do not own this skill.');
        }

        $skill = $this->userSkillService->updateUserSkill(
            $userSkill,
            $request->validated(),
        );

        return $this->success(
            data: [
                'user_skill' => new UserSkillResource($skill),
            ],
            message: 'User skill updated.',
        );
    }

    public function destroy(Request $request, UserSkill $userSkill): JsonResponse
    {
        if ($userSkill->user_id !== $request->user()->id) {
            return $this->forbidden('You do not own this skill.');
        }

        try {
            $this->userSkillService->deleteUserSkill($userSkill);

            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }
}
