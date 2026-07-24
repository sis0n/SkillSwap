<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\User;
use App\Models\UserAvailability;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserAvailability>
 */
class UserAvailabilityFactory extends Factory
{
    public function definition(): array
    {
        return [
            'day_of_week' => fake()->numberBetween(0, 6),
            'start_time' => fake()->time('H:i:s'),
            'end_time' => fake()->time('H:i:s'),
        ];
    }
}
