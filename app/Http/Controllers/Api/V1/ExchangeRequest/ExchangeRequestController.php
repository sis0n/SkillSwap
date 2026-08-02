<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\ExchangeRequest;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\ExchangeRequest\StoreExchangeRequestRequest;
use App\Http\Requests\Api\V1\ExchangeRequest\UpdateExchangeRequestRequest;
use App\Http\Resources\Api\V1\ExchangeRequestResource;
use App\Models\ExchangeRequest;
use App\Services\Exchange\ExchangeRequestException;
use App\Services\Exchange\ExchangeRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ExchangeRequestController extends BaseController
{
    public function __construct(
        private readonly ExchangeRequestService $exchangeRequestService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $exchangeRequests = $this->exchangeRequestService->list(
            $request->user(),
            $request->all(),
        );

        return $this->success(
            data: [
                'exchange_requests' => ExchangeRequestResource::collection($exchangeRequests),
            ],
            message: 'Exchange requests retrieved.',
            extra: [
                'meta' => [
                    'current_page' => $exchangeRequests->currentPage(),
                    'last_page' => $exchangeRequests->lastPage(),
                    'per_page' => $exchangeRequests->perPage(),
                    'total' => $exchangeRequests->total(),
                ],
            ],
        );
    }

    public function store(StoreExchangeRequestRequest $request): JsonResponse
    {
        try {
            $exchangeRequest = $this->exchangeRequestService->create(
                $request->user(),
                $request->validated(),
            );
        } catch (ExchangeRequestException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->created(
            data: [
                'exchange_request' => new ExchangeRequestResource($exchangeRequest),
            ],
            message: 'Exchange request sent.',
        );
    }

    public function show(Request $request, ExchangeRequest $exchangeRequest): JsonResponse
    {
        if (! $this->isParty($request->user()->id, $exchangeRequest)) {
            return $this->forbidden('You are not part of this exchange request.');
        }

        $exchangeRequest->load([
            'sender.profile',
            'receiver.profile',
            'teachingSkill.skill.categories',
            'learningSkill.skill.categories',
            'history.editedBy.profile',
        ]);

        return $this->success(
            data: [
                'exchange_request' => new ExchangeRequestResource($exchangeRequest),
            ],
            message: 'Exchange request retrieved.',
        );
    }

    public function update(UpdateExchangeRequestRequest $request, ExchangeRequest $exchangeRequest): JsonResponse
    {
        if (! $this->isParty($request->user()->id, $exchangeRequest)) {
            return $this->forbidden('You are not part of this exchange request.');
        }

        try {
            $exchangeRequest = $this->exchangeRequestService->update(
                $request->user(),
                $exchangeRequest,
                $request->validated(),
            );
        } catch (ExchangeRequestException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->success(
            data: [
                'exchange_request' => new ExchangeRequestResource($exchangeRequest),
            ],
            message: 'Exchange request updated.',
        );
    }

    public function accept(Request $request, ExchangeRequest $exchangeRequest): JsonResponse
    {
        if (! $this->isParty($request->user()->id, $exchangeRequest)) {
            return $this->forbidden('You are not part of this exchange request.');
        }

        if (! $this->isPendingDecider($request->user()->id, $exchangeRequest)) {
            return $this->forbidden(
                sprintf('Only the %s can accept this request.', $this->pendingDecider($exchangeRequest)),
            );
        }

        try {
            $exchangeRequest = $this->exchangeRequestService->accept($exchangeRequest);
        } catch (ExchangeRequestException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->success(
            data: [
                'exchange_request' => new ExchangeRequestResource($exchangeRequest),
            ],
            message: 'Exchange request accepted.',
        );
    }

    public function decline(Request $request, ExchangeRequest $exchangeRequest): JsonResponse
    {
        if (! $this->isParty($request->user()->id, $exchangeRequest)) {
            return $this->forbidden('You are not part of this exchange request.');
        }

        if (! $this->isPendingDecider($request->user()->id, $exchangeRequest)) {
            return $this->forbidden(
                sprintf('Only the %s can decline this request.', $this->pendingDecider($exchangeRequest)),
            );
        }

        try {
            $exchangeRequest = $this->exchangeRequestService->decline($exchangeRequest);
        } catch (ExchangeRequestException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->success(
            data: [
                'exchange_request' => new ExchangeRequestResource($exchangeRequest),
            ],
            message: 'Exchange request declined.',
        );
    }

    public function cancel(Request $request, ExchangeRequest $exchangeRequest): JsonResponse
    {
        if (! $this->isParty($request->user()->id, $exchangeRequest)) {
            return $this->forbidden('You are not part of this exchange request.');
        }

        if ($request->user()->id !== $exchangeRequest->sender_id) {
            return $this->forbidden('Only the sender can cancel this request.');
        }

        try {
            $exchangeRequest = $this->exchangeRequestService->cancel($exchangeRequest);
        } catch (ExchangeRequestException $e) {
            return $this->error($e->getMessage(), Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $this->success(
            data: [
                'exchange_request' => new ExchangeRequestResource($exchangeRequest),
            ],
            message: 'Exchange request cancelled.',
        );
    }

    private function isParty(int $userId, ExchangeRequest $exchangeRequest): bool
    {
        return $userId === $exchangeRequest->sender_id || $userId === $exchangeRequest->receiver_id;
    }

    private function pendingDecider(ExchangeRequest $exchangeRequest): string
    {
        return $exchangeRequest->reconfirmation_required_by ?? 'receiver';
    }

    private function isPendingDecider(int $userId, ExchangeRequest $exchangeRequest): bool
    {
        return $this->pendingDecider($exchangeRequest) === 'sender'
            ? $userId === $exchangeRequest->sender_id
            : $userId === $exchangeRequest->receiver_id;
    }
}
