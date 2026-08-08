<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Conversation;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Conversation\StoreMessageRequest;
use App\Http\Resources\Api\V1\ConversationResource;
use App\Http\Resources\Api\V1\MessageResource;
use App\Models\Conversation;
use App\Models\User;
use App\Services\Conversation\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends BaseController
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $conversations = $this->conversationService->list(
            $request->user(),
            $request->all(),
        );

        return $this->success(
            data: [
                'conversations' => ConversationResource::collection($conversations),
            ],
            message: 'Conversations retrieved.',
            extra: [
                'meta' => [
                    'current_page' => $conversations->currentPage(),
                    'last_page' => $conversations->lastPage(),
                    'per_page' => $conversations->perPage(),
                    'total' => $conversations->total(),
                ],
            ],
        );
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if (! $this->isParticipant($request->user(), $conversation)) {
            return $this->forbidden('You are not part of this conversation.');
        }

        $conversation = $this->conversationService->show(
            $request->user(),
            $conversation,
        );

        return $this->success(
            data: [
                'conversation' => new ConversationResource($conversation),
            ],
            message: 'Conversation retrieved.',
        );
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        if (! $this->isParticipant($request->user(), $conversation)) {
            return $this->forbidden('You are not part of this conversation.');
        }

        $messages = $this->conversationService->messages(
            $request->user(),
            $conversation,
            $request->all(),
        );

        return $this->success(
            data: [
                'messages' => MessageResource::collection($messages),
            ],
            message: 'Messages retrieved.',
            extra: [
                'meta' => [
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage(),
                    'per_page' => $messages->perPage(),
                    'total' => $messages->total(),
                ],
            ],
        );
    }

    public function store(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        if (! $this->isParticipant($request->user(), $conversation)) {
            return $this->forbidden('You are not part of this conversation.');
        }

        $message = $this->conversationService->send(
            $request->user(),
            $conversation,
            $request->validated()['body'],
        );

        return $this->created(
            data: [
                'message' => new MessageResource($message),
            ],
            message: 'Message sent.',
        );
    }

    private function isParticipant(User $user, Conversation $conversation): bool
    {
        $exchangeRequest = $conversation->exchangeRequest;

        return $user->id === $exchangeRequest->sender_id
            || $user->id === $exchangeRequest->receiver_id;
    }
}
