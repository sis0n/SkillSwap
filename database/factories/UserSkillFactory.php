<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Skill;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserSkill>
 */
class UserSkillFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'skill_id' => Skill::factory(),
            'type' => fake()->randomElement(['teaching', 'learning']),
            'title' => fake()->jobTitle(),
            'description' => fake()->optional()->paragraph(),
            'experience_level' => fake()->randomElement(['beginner', 'intermediate', 'advanced', 'expert']),
            'years_of_experience' => fake()->numberBetween(0, 20),
            'teaching_style' => fake()->optional()->randomElement(['one-on-one', 'group', 'workshop', 'mentorship']),
            'featured' => fake()->boolean(20),
            'portfolio_url' => fake()->optional()->url(),
        ];
    }
}
