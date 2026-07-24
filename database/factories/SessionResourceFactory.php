<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\LearningSession;
use App\Models\SessionResource;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SessionResource>
 */
class SessionResourceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'learning_session_id' => LearningSession::factory(),
            'title' => fake()->words(3, true),
            'url' => fake()->url(),
            'type' => fake()->randomElement(['link', 'pdf', 'github', 'youtube', 'figma', 'other']),
        ];
    }
}
