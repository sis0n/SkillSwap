<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\PortfolioLink;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PortfolioLink> */
class PortfolioLinkFactory extends Factory
{
    protected $model = PortfolioLink::class;

    private const PLATFORMS = [
        'github' => 'https://github.com/%s',
        'gitlab' => 'https://gitlab.com/%s',
        'linkedin' => 'https://linkedin.com/in/%s',
        'behance' => 'https://behance.net/%s',
        'dribbble' => 'https://dribbble.com/%s',
        'codepen' => 'https://codepen.io/%s',
        'youtube' => 'https://youtube.com/@%s',
        'medium' => 'https://medium.com/@%s',
    ];

    public function definition(): array
    {
        $platform = $this->faker->randomElement(array_keys(self::PLATFORMS));

        return [
            'platform' => $platform,
            'url' => sprintf(self::PLATFORMS[$platform], $this->faker->userName()),
            'display_order' => $this->faker->numberBetween(0, 10),
        ];
    }
}
