<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Skill;
use App\Models\SkillCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'category_id' => SkillCategory::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
        ];
    }
}
