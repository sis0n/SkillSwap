<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExchangeRequestHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'edited_by' => $this->editedBy ? new UserResource($this->editedBy) : null,
            'teaching_skill' => $this->teachingSkill ? new UserSkillResource($this->teachingSkill) : null,
            'learning_skill' => $this->learningSkill ? new UserSkillResource($this->learningSkill) : null,
            'message' => $this->message,
            'status' => $this->status,
            'created_at' => $this->created_at,
        ];
    }
}