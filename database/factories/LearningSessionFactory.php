<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExchangeRequest;
use App\Models\LearningSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LearningSession>
 */
class LearningSessionFactory extends Factory
{
    public function definition(): array
    {
        $startTime = fake()->dateTimeBetween('now', '+1 month');
        $endTime = (clone $startTime)->modify('+1 hour');

        return [
            'exchange_request_id' => ExchangeRequest::factory(),
            'title' => fake()->sentence(3),
            'description' => fake()->optional()->paragraph(),
            'start_time' => $startTime,
            'end_time' => $endTime,
            'meeting_link' => fake()->optional()->url(),
            'status' => fake()->randomElement(['scheduled', 'completed', 'cancelled']),
        ];
    }
}
