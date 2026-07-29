<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Discover;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Discover\DiscoverSearchRequest;
use App\Http\Resources\Api\V1\DiscoverUserResource;
use App\Services\Discover\DiscoverService;
use Illuminate\Http\JsonResponse;

class DiscoverController extends BaseController
{
    public function __construct(
        private readonly DiscoverService $discoverService,
    ) {}

    public function index(DiscoverSearchRequest $request): JsonResponse
    {
        $authUser = $request->user();

        $users = $this->discoverService->searchUsers(
            $authUser,
            $request->validated(),
        );

        return $this->success(
            data: [
                'users' => DiscoverUserResource::collection($users),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ],
            message: 'Discover retrieved.',
        );
    }
}
