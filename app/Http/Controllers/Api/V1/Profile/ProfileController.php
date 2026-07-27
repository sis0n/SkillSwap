<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Profile;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Profile\AvatarUploadRequest;
use App\Http\Requests\Api\V1\Profile\UpdateAvailabilityRequest;
use App\Http\Requests\Api\V1\Profile\UpdateProfileRequest;
use App\Http\Resources\Api\V1\AvailabilityResource;
use App\Http\Resources\Api\V1\ProfileResource;
use App\Http\Resources\Api\V1\PublicProfileResource;
use App\Models\User;
use App\Services\Profile\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ProfileController extends BaseController
{
    public function __construct(
        private readonly ProfileService $profileService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->profile()->firstOrCreate(
            ['user_id' => $user->id],
        );

        $this->profileService->syncAvatarFromSocial($user);

        $user->load(['profile', 'availability', 'languages', 'portfolioLinks', 'userSkills.skill.categories']);

        return $this->success(
            data: [
                'user' => new ProfileResource($user),
            ],
            message: 'Profile retrieved.',
        );
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        $profile = $this->profileService->updateProfile($user, $request->validated());

        return $this->success(
            data: [
                'profile' => [
                    'bio' => $profile->bio,
                    'headline' => $profile->headline,
                    'avatar_url' => $profile->avatar_url,
                    'location' => $profile->location,
                    'website' => $profile->website,
                    'experience_level' => $profile->experience_level,
                ],
            ],
            message: 'Profile updated.',
        );
    }

    public function uploadAvatar(AvatarUploadRequest $request): JsonResponse
    {
        $user = $request->user();

        $this->profileService->uploadAvatar($user, $request->file('avatar'));

        return $this->success(
            data: [
                'avatar_url' => $user->profile->avatar_url,
            ],
            message: 'Avatar uploaded.',
        );
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        $this->profileService->deleteAvatar($user);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function showPublic(string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->with(['profile', 'availability', 'languages', 'portfolioLinks', 'userSkills.skill.categories'])
            ->first();

        if (!$user) {
            return $this->notFound('User not found.');
        }

        return $this->success(
            data: [
                'user' => new PublicProfileResource($user),
            ],
            message: 'User profile retrieved.',
        );
    }

    public function getAvailability(Request $request): JsonResponse
    {
        $user = $request->user();

        $availability = $this->profileService->getAvailability($user);

        return $this->success(
            data: [
                'availability' => AvailabilityResource::collection($availability),
            ],
            message: 'Availability retrieved.',
        );
    }

    public function updateAvailability(UpdateAvailabilityRequest $request): JsonResponse
    {
        $user = $request->user();

        $availability = $this->profileService->updateAvailability(
            $user,
            $request->validated('availability'),
        );

        return $this->success(
            data: [
                'availability' => AvailabilityResource::collection($availability),
            ],
            message: 'Availability updated.',
        );
    }
}
