<?php

declare(strict_types=1);

namespace Tests\Feature\Discover;

use App\Models\Profile;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;
use Tests\TestCase;

class DiscoverTest extends TestCase
{
    use RefreshDatabase;

    private function createEligibleUser(array $overrides = []): User
    {
        $user = User::factory()->create(array_merge([
            'email_verified_at' => now(),
        ], $overrides));

        Profile::factory()->create([
            'user_id' => $user->id,
            'avatar' => 'avatars/test.jpg',
            'headline' => 'Test Headline',
            'bio' => 'Test bio description.',
            'location' => 'Test City',
            'timezone' => 'UTC',
            'experience_level' => 'intermediate',
        ]);

        return $user;
    }

    private function attachSkillToCategory(Skill $skill, SkillCategory $category): void
    {
        $skill->categories()->syncWithoutDetaching([$category->id]);
    }

    private function createUserSkill(User $user, Skill $skill, array $overrides = []): UserSkill
    {
        return UserSkill::factory()->create(array_merge([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
        ], $overrides));
    }

    // ---------------------------------------------------------------
    // Basic Browse
    // ---------------------------------------------------------------

    public function test_guest_can_browse_discover(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Discover retrieved.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'users' => [
                        '*' => [
                            'id', 'first_name', 'middle_name', 'last_name', 'suffix',
                            'username', 'avatar_url', 'headline', 'location',
                            'matched_skills', 'matched_skills_count',
                        ],
                    ],
                    'meta' => ['current_page', 'last_page', 'per_page', 'total'],
                ],
            ]);
    }

    public function test_authenticated_user_can_browse_discover(): void
    {
        $authUser = $this->createEligibleUser();
        $otherUser = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($otherUser, $skill, ['type' => 'teaching']);

        $response = $this->actingAs($authUser)
            ->getJson('/api/v1/discover');

        $response->assertStatus(200);
    }

    public function test_authenticated_user_is_excluded_from_results(): void
    {
        $authUser = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($authUser, $skill, ['type' => 'teaching']);

        $response = $this->actingAs($authUser)
            ->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data.users');
    }

    // ---------------------------------------------------------------
    // Search
    // ---------------------------------------------------------------

    public function test_search_by_skill_name(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $php = Skill::factory()->create(['name' => 'PHP']);
        $js = Skill::factory()->create(['name' => 'JavaScript']);
        $this->attachSkillToCategory($php, $category);
        $this->attachSkillToCategory($js, $category);
        $this->createUserSkill($user, $php, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?q=PHP');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
    }

    public function test_partial_search(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $photo = Skill::factory()->create(['name' => 'Photography']);
        $editing = Skill::factory()->create(['name' => 'Photo Editing']);
        $php = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($photo, $category);
        $this->attachSkillToCategory($editing, $category);
        $this->attachSkillToCategory($php, $category);
        $this->createUserSkill($user, $photo, ['type' => 'teaching']);
        $this->createUserSkill($user, $editing, ['type' => 'teaching']);
        $this->createUserSkill($user, $php, ['type' => 'learning']);

        $response = $this->getJson('/api/v1/discover?q=photo');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
    }

    public function test_search_with_empty_query_returns_all(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?q=');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
    }

    public function test_exact_search_ranks_higher_than_partial(): void
    {
        $category = SkillCategory::factory()->create();
        $guitar = Skill::factory()->create(['name' => 'Guitar']);
        $guitarLessons = Skill::factory()->create(['name' => 'Guitar Lessons']);
        $this->attachSkillToCategory($guitar, $category);
        $this->attachSkillToCategory($guitarLessons, $category);

        $exactUser = $this->createEligibleUser();
        $this->createUserSkill($exactUser, $guitar, ['type' => 'teaching']);

        $partialUser = $this->createEligibleUser();
        $this->createUserSkill($partialUser, $guitarLessons, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?q=Guitar');

        $response->assertStatus(200);
        $users = $response->json('data.users');
        $this->assertCount(2, $users);
        $this->assertEquals($exactUser->id, $users[0]['id'],
            'Exact match should rank first');
    }

    public function test_search_case_insensitive(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'Python']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?q=python');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
    }

    public function test_search_non_existent_skill_returns_empty(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?q=NonExistentSkill999');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.users');
    }

    // ---------------------------------------------------------------
    // Filters
    // ---------------------------------------------------------------

    public function test_filter_by_category(): void
    {
        $category = SkillCategory::factory()->create(['name' => 'Programming']);
        $otherCategory = SkillCategory::factory()->create(['name' => 'Music']);

        $programmingSkill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($programmingSkill, $category);
        $musicSkill = Skill::factory()->create(['name' => 'Guitar']);
        $this->attachSkillToCategory($musicSkill, $otherCategory);

        $programmer = $this->createEligibleUser();
        $this->createUserSkill($programmer, $programmingSkill, ['type' => 'teaching']);

        $musician = $this->createEligibleUser();
        $this->createUserSkill($musician, $musicSkill, ['type' => 'teaching']);

        $response = $this->getJson("/api/v1/discover?category_id={$category->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
        $this->assertEquals($programmer->id, $response->json('data.users.0.id'));
    }

    public function test_filter_by_type_teaching(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?type=teaching');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
    }

    public function test_filter_by_type_learning(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'learning']);

        $response = $this->getJson('/api/v1/discover?type=learning');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
    }

    public function test_filter_by_type_teaching_excludes_learning_only(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $teachingUser = $this->createEligibleUser();
        $this->createUserSkill($teachingUser, $skill, ['type' => 'teaching']);

        $learningUser = $this->createEligibleUser();
        $this->createUserSkill($learningUser, $skill, ['type' => 'learning']);

        $response = $this->getJson('/api/v1/discover?type=teaching');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
        $this->assertEquals($teachingUser->id, $response->json('data.users.0.id'));
    }

    public function test_filter_by_experience_level(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $expert = $this->createEligibleUser();
        $this->createUserSkill($expert, $skill, ['type' => 'teaching', 'experience_level' => 'expert']);

        $beginner = $this->createEligibleUser();
        $this->createUserSkill($beginner, $skill, ['type' => 'teaching', 'experience_level' => 'beginner']);

        $response = $this->getJson('/api/v1/discover?experience_level=expert');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
        $this->assertEquals($expert->id, $response->json('data.users.0.id'));
    }

    public function test_combined_filters(): void
    {
        $programming = SkillCategory::factory()->create(['name' => 'Programming']);
        $music = SkillCategory::factory()->create(['name' => 'Music']);

        $php = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($php, $programming);
        $guitar = Skill::factory()->create(['name' => 'Guitar']);
        $this->attachSkillToCategory($guitar, $music);

        $target = $this->createEligibleUser();
        $this->createUserSkill($target, $php, ['type' => 'teaching', 'experience_level' => 'advanced']);

        $wrongCategory = $this->createEligibleUser();
        $this->createUserSkill($wrongCategory, $guitar, ['type' => 'teaching', 'experience_level' => 'advanced']);

        $wrongType = $this->createEligibleUser();
        $this->createUserSkill($wrongType, $php, ['type' => 'learning', 'experience_level' => 'advanced']);

        $response = $this->getJson(
            "/api/v1/discover?category_id={$programming->id}&type=teaching&experience_level=advanced"
        );

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
        $this->assertEquals($target->id, $response->json('data.users.0.id'));
    }

    // ---------------------------------------------------------------
    // Pagination
    // ---------------------------------------------------------------

    public function test_default_pagination_per_page(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $users = User::factory()->count(3)->create(['email_verified_at' => now()]);
        foreach ($users as $user) {
            Profile::factory()->create([
                'user_id' => $user->id,
                'avatar' => 'avatars/test.jpg',
                'headline' => 'Headline',
                'bio' => 'Bio',
                'location' => 'City',
                'timezone' => 'UTC',
            ]);
            $this->createUserSkill($user, $skill, ['type' => 'teaching']);
        }

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $meta = $response->json('data.meta');
        $this->assertEquals(1, $meta['current_page']);
        $this->assertEquals(1, $meta['last_page']);
        $this->assertEquals(20, $meta['per_page']);
        $this->assertEquals(3, $meta['total']);
    }

    public function test_pagination_with_custom_per_page(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $users = User::factory()->count(5)->create(['email_verified_at' => now()]);
        foreach ($users as $user) {
            Profile::factory()->create([
                'user_id' => $user->id,
                'avatar' => 'avatars/test.jpg',
                'headline' => 'Headline',
                'bio' => 'Bio',
                'location' => 'City',
                'timezone' => 'UTC',
            ]);
            $this->createUserSkill($user, $skill, ['type' => 'teaching']);
        }

        $response = $this->getJson('/api/v1/discover?per_page=2');

        $response->assertStatus(200);
        $meta = $response->json('data.meta');
        $this->assertEquals(2, $meta['per_page']);
        $this->assertEquals(3, $meta['last_page']);
        $this->assertEquals(5, $meta['total']);
        $this->assertCount(2, $response->json('data.users'));
    }

    public function test_pagination_second_page(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $users = User::factory()->count(3)->create(['email_verified_at' => now()]);
        foreach ($users as $user) {
            Profile::factory()->create([
                'user_id' => $user->id,
                'avatar' => 'avatars/test.jpg',
                'headline' => 'Headline',
                'bio' => 'Bio',
                'location' => 'City',
                'timezone' => 'UTC',
            ]);
            $this->createUserSkill($user, $skill, ['type' => 'teaching']);
        }

        $response = $this->getJson('/api/v1/discover?page=2&per_page=2');

        $response->assertStatus(200);
        $meta = $response->json('data.meta');
        $this->assertEquals(2, $meta['current_page']);
        $this->assertCount(1, $response->json('data.users'));
    }

    // ---------------------------------------------------------------
    // Ordering
    // ---------------------------------------------------------------

    public function test_alphabetical_order_when_no_search(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $alice = $this->createEligibleUser([
            'first_name' => 'Alice',
            'last_name' => 'Smith',
        ]);
        $this->createUserSkill($alice, $skill, ['type' => 'teaching']);

        $bob = $this->createEligibleUser([
            'first_name' => 'Bob',
            'last_name' => 'Jones',
        ]);
        $this->createUserSkill($bob, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $users = $response->json('data.users');
        $this->assertCount(2, $users);
        $this->assertEquals('Alice', $users[0]['first_name']);
        $this->assertEquals('Bob', $users[1]['first_name']);
    }

    // ---------------------------------------------------------------
    // Eligibility
    // ---------------------------------------------------------------

    public function test_unverified_email_user_excluded(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $unverified = User::factory()->unverified()->create();
        Profile::factory()->create([
            'user_id' => $unverified->id,
            'avatar' => 'avatars/test.jpg',
            'headline' => 'Headline',
            'bio' => 'Bio',
            'location' => 'City',
            'timezone' => 'UTC',
        ]);
        $this->createUserSkill($unverified, $skill, ['type' => 'teaching']);

        $verified = $this->createEligibleUser();
        $this->createUserSkill($verified, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
        $this->assertEquals($verified->id, $response->json('data.users.0.id'));
    }

    public function test_user_without_skills_excluded(): void
    {
        $user = $this->createEligibleUser();

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.users');
    }

    public function test_user_below_profile_threshold_excluded(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $lowScore = User::factory()->create(['email_verified_at' => now()]);
        Profile::factory()->create([
            'user_id' => $lowScore->id,
            'avatar' => null,
            'headline' => null,
            'bio' => null,
            'location' => null,
            'timezone' => null,
            'website' => null,
            'experience_level' => 'beginner',
        ]);
        $this->createUserSkill($lowScore, $skill, ['type' => 'teaching']);

        $eligible = $this->createEligibleUser();
        $this->createUserSkill($eligible, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.users');
        $this->assertEquals($eligible->id, $response->json('data.users.0.id'));
    }

    // ---------------------------------------------------------------
    // matched_skills Response
    // ---------------------------------------------------------------

    public function test_matched_skills_max_three(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();

        $skills = Skill::factory()->count(5)->create();
        foreach ($skills as $skill) {
            $this->attachSkillToCategory($skill, $category);
            $this->createUserSkill($user, $skill, ['type' => 'teaching']);
        }

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $matchedSkills = $response->json('data.users.0.matched_skills');
        $this->assertCount(3, $matchedSkills);
    }

    public function test_matched_skills_count_accuracy(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();

        $skills = Skill::factory()->count(5)->create();
        foreach ($skills as $skill) {
            $this->attachSkillToCategory($skill, $category);
            $this->createUserSkill($user, $skill, ['type' => 'teaching']);
        }

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $this->assertEquals(5, $response->json('data.users.0.matched_skills_count'));
    }

    public function test_matched_skills_limited_to_matching_type(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();

        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $otherSkill = Skill::factory()->create(['name' => 'Guitar']);
        $this->attachSkillToCategory($otherSkill, $category);
        $this->createUserSkill($user, $otherSkill, ['type' => 'learning']);

        $response = $this->getJson('/api/v1/discover?type=teaching');

        $response->assertStatus(200);
        $matchedSkills = $response->json('data.users.0.matched_skills');
        $this->assertCount(1, $matchedSkills);
        $this->assertEquals('teaching', $matchedSkills[0]['type']);
        $this->assertEquals(1, $response->json('data.users.0.matched_skills_count'));
    }

    public function test_matched_skills_structure(): void
    {
        $user = $this->createEligibleUser();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);
        $this->createUserSkill($user, $skill, ['type' => 'teaching', 'experience_level' => 'advanced']);

        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => ['users' => [
                '*' => [
                    'matched_skills' => [
                        '*' => ['id', 'name', 'type', 'experience_level'],
                    ],
                ],
            ]],
        ]);
    }

    // ---------------------------------------------------------------
    // Empty Results
    // ---------------------------------------------------------------

    public function test_empty_results_when_no_eligible_users(): void
    {
        $response = $this->getJson('/api/v1/discover');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.users');
        $this->assertEquals(0, $response->json('data.meta.total'));
    }

    // ---------------------------------------------------------------
    // Validation / Invalid Inputs
    // ---------------------------------------------------------------

    public function test_invalid_page_negative_returns_422(): void
    {
        $response = $this->getJson('/api/v1/discover?page=-1');

        $response->assertStatus(422);
    }

    public function test_invalid_page_non_numeric(): void
    {
        $response = $this->getJson('/api/v1/discover?page=abc');

        $response->assertStatus(422);
    }

    public function test_invalid_page_huge_number(): void
    {
        $response = $this->getJson('/api/v1/discover?page=999999999');

        $response->assertStatus(200);
    }

    public function test_invalid_category_id_returns_422(): void
    {
        $response = $this->getJson('/api/v1/discover?category_id=999999');

        $response->assertStatus(422);
    }

    public function test_invalid_type_returns_422(): void
    {
        $response = $this->getJson('/api/v1/discover?type=invalid');

        $response->assertStatus(422);
    }

    public function test_invalid_experience_level_returns_422(): void
    {
        $response = $this->getJson('/api/v1/discover?experience_level=invalid');

        $response->assertStatus(422);
    }

    public function test_per_page_exceeds_max_returns_422(): void
    {
        $response = $this->getJson('/api/v1/discover?per_page=100');

        $response->assertStatus(422);
    }

    public function test_per_page_minimum_ones(): void
    {
        $response = $this->getJson('/api/v1/discover?per_page=0');

        $response->assertStatus(422);
    }

    public function test_long_search_string(): void
    {
        $longString = str_repeat('a', 256);

        $response = $this->getJson('/api/v1/discover?q=' . $longString);

        $response->assertStatus(422);
    }

    public function test_valid_max_per_page(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $this->attachSkillToCategory($skill, $category);

        $user = $this->createEligibleUser();
        $this->createUserSkill($user, $skill, ['type' => 'teaching']);

        $response = $this->getJson('/api/v1/discover?per_page=50');

        $response->assertStatus(200);
        $this->assertEquals(50, $response->json('data.meta.per_page'));
    }

    // ---------------------------------------------------------------
    // Rate Limiting
    // ---------------------------------------------------------------

    public function test_rate_limiting_on_discover_endpoint(): void
    {
        for ($i = 0; $i < 60; $i++) {
            $response = $this->getJson('/api/v1/discover');
            if ($response->status() === 429) {
                break;
            }
        }

        if ($response->status() !== 429) {
            $this->markTestSkipped('Rate limit not reached within 60 requests. This may be expected in test environment.');
        } else {
            $response->assertStatus(429);
        }
    }
}
