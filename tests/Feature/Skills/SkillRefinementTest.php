<?php

declare(strict_types=1);

namespace Tests\Feature\Skills;

use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillRefinementTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------
    // Skill Name Normalization
    // ---------------------------------------------------------------

    public function test_skill_name_trimmed_on_custom_creation(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => '  SvelteKit  ',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'SvelteKit Mastery',
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('skills', ['name' => 'SvelteKit']);
    }

    public function test_skill_name_collapses_multiple_spaces(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'Adobe     Photoshop',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'Photoshop Expert',
                'experience_level' => 'advanced',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('skills', ['name' => 'Adobe Photoshop']);
    }

    public function test_case_insensitive_lookup_reuses_existing_skill(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        Skill::factory()->create(['name' => 'Tailwind CSS'])->categories()->attach($category->id);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'TAILWIND css',
                'category_ids' => [$category->id],
                'type' => 'learning',
                'title' => 'Learning Tailwind',
                'experience_level' => 'beginner',
            ])
            ->assertStatus(201);

        $this->assertEquals(1, Skill::where('name', 'Tailwind CSS')->count(),
            'Should not create duplicate for case-insensitive match');
    }

    public function test_case_insensitive_lookup_reuses_on_uppercase_input(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        Skill::factory()->create(['name' => 'Figma'])->categories()->attach($category->id);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'FIGMA',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'Figma Design',
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(201);

        $this->assertEquals(1, Skill::where('name', 'Figma')->count());
    }

    public function test_skill_search_is_case_insensitive(): void
    {
        $category = SkillCategory::factory()->create();
        Skill::factory()->create(['name' => 'Laravel'])->categories()->attach($category->id);

        $response = $this->getJson('/api/v1/skills?search=laravel');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.skills');
    }

    // ---------------------------------------------------------------
    // Duplicate Prevention (Name Normalization)
    // ---------------------------------------------------------------

    public function test_whitespace_normalized_duplicate_rejected(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'Photoshop']);
        $skill->categories()->attach($category->id);

        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => '  Photoshop  ',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'Photoshop Again',
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(422);
    }

    public function test_case_insensitive_duplicate_rejected(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'React']);
        $skill->categories()->attach($category->id);

        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'REACT',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'React Again',
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(422);
    }

    // ---------------------------------------------------------------
    // Custom Skill Metadata
    // ---------------------------------------------------------------

    public function test_custom_skill_sets_is_system_false(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'SvelteKit',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'SvelteKit Dev',
                'experience_level' => 'advanced',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('skills', [
            'name' => 'SvelteKit',
            'is_system' => false,
        ]);
    }

    public function test_custom_skill_sets_created_by(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'SvelteKit',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'SvelteKit Dev',
                'experience_level' => 'advanced',
            ])
            ->assertStatus(201);

        $this->assertDatabaseHas('skills', [
            'name' => 'SvelteKit',
            'created_by' => $user->id,
        ]);
    }

    // ---------------------------------------------------------------
    // Title Validation
    // ---------------------------------------------------------------

    public function test_title_is_optional_on_create(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'teaching',
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(201);
    }

    public function test_title_can_be_null(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'learning',
                'title' => null,
                'experience_level' => 'beginner',
            ])
            ->assertStatus(201);
    }

    public function test_title_max_100_characters(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'teaching',
                'title' => str_repeat('a', 101),
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(422);
    }

    public function test_update_title_max_100_characters(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
        ]);

        $this->actingAs($user)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'title' => str_repeat('a', 101),
            ])
            ->assertStatus(422);
    }

    public function test_update_title_can_be_null(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'title' => 'Original Title',
        ]);

        $this->actingAs($user)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'title' => null,
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('user_skills', [
            'id' => $userSkill->id,
            'title' => null,
        ]);
    }

    // ---------------------------------------------------------------
    // Slug Cleanup
    // ---------------------------------------------------------------

    public function test_custom_skill_slug_has_no_random_suffix(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'SvelteKit',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'SvelteKit Dev',
                'experience_level' => 'advanced',
            ])
            ->assertStatus(201);

        $skill = Skill::where('name', 'SvelteKit')->first();
        $this->assertNotNull($skill);
        $this->assertEquals('sveltekit', $skill->slug);
    }

    // ---------------------------------------------------------------
    // Existing Skill Reuse
    // ---------------------------------------------------------------

    public function test_existing_skill_ignores_category_id(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $skill->categories()->attach($category->id);

        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'learning',
                'title' => 'Learn PHP',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('user_skills', [
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'learning',
        ]);
    }

    // ---------------------------------------------------------------
    // No Duplicate Skills Created
    // ---------------------------------------------------------------

    public function test_no_duplicate_skill_records_for_same_normalized_name(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'Go',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'Go Lang',
                'experience_level' => 'intermediate',
            ])
            ->assertStatus(201);

        $anotherUser = User::factory()->create();

        $this->actingAs($anotherUser)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'GO',
                'category_ids' => [$category->id],
                'type' => 'learning',
                'title' => 'Learn Go',
                'experience_level' => 'beginner',
            ])
            ->assertStatus(201);

        $this->assertEquals(1, Skill::whereRaw('LOWER(name) = ?', ['go'])->count(),
            'Different users creating the same skill name should share one record');
    }
}
