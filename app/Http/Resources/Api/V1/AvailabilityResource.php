<?php

declare(strict_types=1);

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AvailabilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return [
            'id' => $this->id,
            'day_of_week' => $this->day_of_week,
            'day_label' => $days[$this->day_of_week] ?? 'Unknown',
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
        ];
    }
}
