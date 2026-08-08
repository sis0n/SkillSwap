<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $exchangeRequest = $this->exchangeRequest;

        return [
            'id' => $this->id,
            'exchange_request_id' => $this->exchange_request_id,
            'other_user' => $exchangeRequest->sender_id === $user->id
                ? new UserResource($exchangeRequest->receiver)
                : new UserResource($exchangeRequest->sender),
            'last_message' => $this->relationLoaded('lastMessage') && $this->lastMessage
                ? new MessageResource($this->lastMessage)
                : null,
            'unread_count' => (int) ($this->unread_count ?? 0),
            'updated_at' => $this->updated_at,
        ];
    }
}
