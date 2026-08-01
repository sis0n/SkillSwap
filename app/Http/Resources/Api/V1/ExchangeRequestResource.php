<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExchangeRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sender' => new UserResource($this->sender),
            'receiver' => new UserResource($this->receiver),
            'teaching_skill' => $this->teachingSkill ? new UserSkillResource($this->teachingSkill) : null,
            'learning_skill' => $this->learningSkill ? new UserSkillResource($this->learningSkill) : null,
            'message' => $this->message,
            'status' => $this->status,
            'reconfirmation_required_by' => $this->reconfirmation_required_by,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
