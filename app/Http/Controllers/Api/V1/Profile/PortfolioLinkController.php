<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Profile;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Profile\StorePortfolioLinkRequest;
use App\Http\Requests\Api\V1\Profile\UpdatePortfolioLinkRequest;
use App\Http\Resources\Api\V1\PortfolioLinkResource;
use App\Models\PortfolioLink;
use App\Services\Profile\PortfolioLinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PortfolioLinkController extends BaseController
{
    public function __construct(
        private readonly PortfolioLinkService $portfolioLinkService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $links = $this->portfolioLinkService->getLinks($request->user());

        return $this->success(
            data: [
                'portfolio_links' => PortfolioLinkResource::collection($links),
            ],
            message: 'Portfolio links retrieved.',
        );
    }

    public function store(StorePortfolioLinkRequest $request): JsonResponse
    {
        $link = $this->portfolioLinkService->createLink(
            $request->user(),
            $request->validated(),
        );

        return $this->created(
            data: [
                'portfolio_link' => new PortfolioLinkResource($link),
            ],
            message: 'Portfolio link created.',
        );
    }

    public function update(UpdatePortfolioLinkRequest $request, PortfolioLink $portfolioLink): JsonResponse
    {
        if ($portfolioLink->user_id !== $request->user()->id) {
            return $this->forbidden('You do not own this portfolio link.');
        }

        $link = $this->portfolioLinkService->updateLink(
            $portfolioLink,
            $request->validated(),
        );

        return $this->success(
            data: [
                'portfolio_link' => new PortfolioLinkResource($link),
            ],
            message: 'Portfolio link updated.',
        );
    }

    public function destroy(Request $request, PortfolioLink $portfolioLink): JsonResponse
    {
        if ($portfolioLink->user_id !== $request->user()->id) {
            return $this->forbidden('You do not own this portfolio link.');
        }

        $this->portfolioLinkService->deleteLink($portfolioLink);

        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer', 'exists:portfolio_links,id'],
        ]);

        $links = $this->portfolioLinkService->reorderLinks(
            $request->user(),
            $request->input('ordered_ids'),
        );

        return $this->success(
            data: [
                'portfolio_links' => PortfolioLinkResource::collection($links),
            ],
            message: 'Portfolio links reordered.',
        );
    }
}
