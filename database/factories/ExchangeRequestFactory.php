<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\ExchangeRequest;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ExchangeRequest>
 */
class ExchangeRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'sender_id' => User::factory(),
            'receiver_id' => User::factory(),
            'teaching_skill_id' => UserSkill::factory(),
            'learning_skill_id' => UserSkill::factory(),
            'message' => fake()->optional()->sentence(),
            'status' => fake()->randomElement(['pending', 'accepted', 'declined', 'cancelled', 'completed']),
        ];
    }
}
