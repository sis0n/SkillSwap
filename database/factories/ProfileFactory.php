<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'bio' => fake()->paragraph(),
            'avatar' => null,
            'location' => fake()->city(),
            'experience_level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
        ];
    }
}
