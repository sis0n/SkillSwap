<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\SkillCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<SkillCategory>
 */
class SkillCategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->word();

        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'icon' => null,
            'sort_order' => 0,
        ];
    }
}
