<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Skill;
use App\Models\SkillCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SkillCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Programming',
                'icon' => 'code',
                'skills' => ['PHP', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Ruby', 'Go', 'Rust', 'Kotlin', 'Swift', 'HTML', 'CSS', 'SQL', 'Laravel', 'React', 'Vue.js', 'Node.js', 'Django', 'Spring Boot'],
            ],
            [
                'name' => 'Design',
                'icon' => 'palette',
                'skills' => ['Graphic Design', 'UI Design', 'UX Design', 'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Sketch', 'Canva', 'Typography'],
            ],
            [
                'name' => 'Music',
                'icon' => 'music',
                'skills' => ['Guitar', 'Piano', 'Drums', 'Violin', 'Singing', 'Music Theory', 'Music Production', 'DJ', 'Songwriting', 'Bass Guitar'],
            ],
            [
                'name' => 'Languages',
                'icon' => 'globe',
                'skills' => ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Mandarin', 'Italian', 'Portuguese', 'Russian', 'Arabic', 'Tagalog'],
            ],
            [
                'name' => 'Photography',
                'icon' => 'camera',
                'skills' => ['Portrait Photography', 'Landscape Photography', 'Street Photography', 'Photo Editing', 'Lightroom', 'Composition', 'Flash Photography'],
            ],
            [
                'name' => 'Business',
                'icon' => 'briefcase',
                'skills' => ['Entrepreneurship', 'Project Management', 'Business Strategy', 'Finance', 'Accounting', 'Marketing Strategy', 'Sales', 'Leadership'],
            ],
            [
                'name' => 'Marketing',
                'icon' => 'trending-up',
                'skills' => ['Social Media Marketing', 'SEO', 'Content Marketing', 'Email Marketing', 'Digital Advertising', 'Branding', 'Analytics', 'Copywriting'],
            ],
            [
                'name' => 'Writing',
                'icon' => 'edit',
                'skills' => ['Creative Writing', 'Technical Writing', 'Blogging', 'Journalism', 'Poetry', 'Screenwriting', 'Essay Writing', 'Grant Writing'],
            ],
            [
                'name' => 'Video Editing',
                'icon' => 'video',
                'skills' => ['Adobe Premiere Pro', 'Final Cut Pro', 'DaVinci Resolve', 'After Effects', 'Motion Graphics', 'Color Grading', 'Video Production'],
            ],
            [
                'name' => 'Cooking',
                'icon' => 'coffee',
                'skills' => ['Baking', 'Pastry', 'Grilling', 'Vegetarian Cooking', 'Vegan Cooking', 'Italian Cuisine', 'Asian Cuisine', 'Meal Prep', 'Wine Pairing'],
            ],
            [
                'name' => 'Other',
                'icon' => 'more-horizontal',
                'skills' => ['Public Speaking', 'Yoga', 'Meditation', 'Fitness Training', 'Chess', 'Gardening', 'Martial Arts', 'Dancing', 'Drawing', 'Painting'],
            ],
        ];

        $allCategories = [];

        foreach ($categories as $index => $categoryData) {
            $skills = $categoryData['skills'];
            unset($categoryData['skills']);

            $categoryData['slug'] = Str::slug($categoryData['name']);
            $categoryData['sort_order'] = $index;

            $category = SkillCategory::create($categoryData);
            $allCategories[] = $category;

            foreach ($skills as $skillIndex => $skillName) {
                $skill = Skill::firstOrCreate(
                    ['name' => $skillName],
                    [
                        'slug' => Str::slug($skillName),
                        'sort_order' => $skillIndex,
                        'is_system' => true,
                    ],
                );

                $skill->categories()->syncWithoutDetaching([$category->id]);
            }
        }

        if (count($allCategories) >= 2) {
            $crossCategorySkills = Skill::whereIn('name', ['SQL', 'Python', 'JavaScript', 'Figma', 'SEO', 'Copywriting'])->get();
            $extraCategoryIds = $allCategories->slice(1)->pluck('id')->toArray();
            foreach ($crossCategorySkills as $skill) {
                $skill->categories()->syncWithoutDetaching($extraCategoryIds);
            }
        }
    }
}
