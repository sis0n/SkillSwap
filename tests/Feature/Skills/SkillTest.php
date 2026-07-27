<?php

declare(strict_types=1);

namespace Tests\Feature\Skills;

use App\Models\ExchangeRequest;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\User;
use App\Models\UserSkill;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SkillTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------
    // Skill Categories
    // ---------------------------------------------------------------

    public function test_guest_can_list_skill_categories(): void
    {
        SkillCategory::factory()->create(['name' => 'Design', 'sort_order' => 0]);
        SkillCategory::factory()->create(['name' => 'Programming', 'sort_order' => 1]);

        $response = $this->getJson('/api/v1/skill-categories');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Skill categories retrieved.',
            ])
            ->assertJsonCount(2, 'data.skill_categories');
    }

    public function test_authenticated_user_can_list_skill_categories(): void
    {
        $user = User::factory()->create();
        SkillCategory::factory()->count(3)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/skill-categories');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.skill_categories');
    }

    // ---------------------------------------------------------------
    // Skills (reference data)
    // ---------------------------------------------------------------

    public function test_guest_can_list_skills(): void
    {
        $category = SkillCategory::factory()->create();
        Skill::factory()->count(3)->create()->each(fn ($s) => $s->categories()->attach($category->id));

        $response = $this->getJson('/api/v1/skills');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Skills retrieved.',
            ])
            ->assertJsonCount(3, 'data.skills');
    }

    public function test_filter_skills_by_category_id(): void
    {
        $catA = SkillCategory::factory()->create();
        $catB = SkillCategory::factory()->create();
        Skill::factory()->count(2)->create()->each(fn ($s) => $s->categories()->attach($catA->id));
        Skill::factory()->count(3)->create()->each(fn ($s) => $s->categories()->attach($catB->id));

        $response = $this->getJson("/api/v1/skills?category_id={$catA->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.skills');
    }

    public function test_search_skills_by_name(): void
    {
        $category = SkillCategory::factory()->create();
        $s1 = Skill::factory()->create(['name' => 'Photography']); $s1->categories()->attach($category->id);
        $s2 = Skill::factory()->create(['name' => 'Photo Editing']); $s2->categories()->attach($category->id);
        $s3 = Skill::factory()->create(['name' => 'PHP']); $s3->categories()->attach($category->id);

        $response = $this->getJson('/api/v1/skills?search=photo');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.skills');
    }

    // ---------------------------------------------------------------
    // Create User Skill
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_create_user_skill(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'teaching',
                'title' => 'PHP Development',
                'description' => 'I can teach PHP from basics to advanced.',
                'experience_level' => 'advanced',
                'years_of_experience' => 5,
                'teaching_style' => 'hands-on',
                'featured' => false,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User skill created.',
                'data' => ['user_skill' => [
                    'type' => 'teaching',
                    'title' => 'PHP Development',
                    'featured' => false,
                ]],
            ]);

        $this->assertDatabaseHas('user_skills', [
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);
    }

    public function test_authenticated_user_can_create_custom_skill(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'Figma',
                'category_ids' => [$category->id],
                'type' => 'teaching',
                'title' => 'Figma Design',
                'description' => 'UI/UX design using Figma.',
                'experience_level' => 'intermediate',
                'years_of_experience' => 3,
                'featured' => false,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User skill created.',
            ]);

        $this->assertDatabaseHas('skills', ['name' => 'Figma']);
        $this->assertDatabaseHas('user_skills', [
            'user_id' => $user->id,
            'type' => 'teaching',
        ]);
    }

    public function test_custom_skill_with_existing_name_reuses_skill(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $existing = Skill::factory()->create(['name' => 'Tailwind CSS']);
        $existing->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'Tailwind CSS',
                'category_ids' => [$category->id],
                'type' => 'learning',
                'title' => 'Learning Tailwind',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(201);
        $skillsCount = Skill::where('name', 'Tailwind CSS')->count();
        $this->assertEquals(1, $skillsCount, 'Should not create duplicate skill record');
    }

    public function test_duplicate_skill_same_type_rejected(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'teaching',
                'title' => 'Duplicate PHP',
                'experience_level' => 'intermediate',
            ]);

        $response->assertStatus(422);
    }

    public function test_same_skill_different_type_allowed(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
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
    }

    public function test_invalid_type_rejected(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $skill->id,
                'type' => 'invalid',
                'title' => 'Test',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(422);
    }

    public function test_skill_limit_max_30_enforced(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $skills = Skill::factory()->count(30)->create();
        $skills->each(fn ($s) => $s->categories()->attach($category->id));

        foreach ($skills as $skill) {
            UserSkill::factory()->create([
                'user_id' => $user->id,
                'skill_id' => $skill->id,
                'type' => 'teaching',
            ]);
        }

        $extraSkill = Skill::factory()->create();
        $extraSkill->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $extraSkill->id,
                'type' => 'teaching',
                'title' => 'Extra Skill',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(422);
    }

    public function test_featured_limit_max_3_enforced(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $skills = Skill::factory()->count(3)->create();
        $skills->each(fn ($s) => $s->categories()->attach($category->id));

        foreach ($skills as $skill) {
            UserSkill::factory()->create([
                'user_id' => $user->id,
                'skill_id' => $skill->id,
                'type' => 'teaching',
                'featured' => true,
            ]);
        }

        $extraSkill = Skill::factory()->create();
        $extraSkill->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_id' => $extraSkill->id,
                'type' => 'teaching',
                'title' => 'Another Skill',
                'experience_level' => 'beginner',
                'featured' => true,
            ]);

        $response->assertStatus(422);
    }

    // ---------------------------------------------------------------
    // List User Skills
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_list_their_skills(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create(['name' => 'PHP']);
        $skill->categories()->attach($category->id);

        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
            'title' => 'PHP',
            'featured' => true,
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/skills');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.user_skills');
    }

    public function test_list_skills_category_filter(): void
    {
        $user = User::factory()->create();
        $catA = SkillCategory::factory()->create();
        $catB = SkillCategory::factory()->create();
        $skillA = Skill::factory()->create(['name' => 'PHP']);
        $skillA->categories()->attach($catA->id);
        $skillB = Skill::factory()->create(['name' => 'Guitar']);
        $skillB->categories()->attach($catB->id);

        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skillA->id,
            'type' => 'teaching',
            'title' => 'PHP',
        ]);
        UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skillB->id,
            'type' => 'teaching',
            'title' => 'Guitar',
        ]);

        $response = $this->actingAs($user)
            ->getJson("/api/v1/me/skills?category_id={$catA->id}");

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data.user_skills');
    }

    public function test_list_skills_invalid_category_id(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/skills?category_id=999');

        $response->assertStatus(422);
    }

    // ---------------------------------------------------------------
    // Update User Skill
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_update_their_skill(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'title' => 'Original Title',
            'featured' => true,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['user_skill' => [
                    'title' => 'Updated Title',
                    'featured' => true,
                ]],
            ]);
    }

    public function test_update_preserves_featured_when_not_sent(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'title' => 'Original',
            'featured' => true,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'description' => 'Just updating description.',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_skills', [
            'id' => $userSkill->id,
            'featured' => true,
            'description' => 'Just updating description.',
        ]);
    }

    public function test_update_featured_only(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'featured' => false,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'featured' => true,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_skills', [
            'id' => $userSkill->id,
            'featured' => true,
        ]);
    }

    public function test_update_removes_featured(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'featured' => true,
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'featured' => false,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_skills', [
            'id' => $userSkill->id,
            'featured' => false,
        ]);
    }

    public function test_cannot_update_another_users_skill(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $owner->id,
            'skill_id' => $skill->id,
        ]);

        $response = $this->actingAs($other)
            ->putJson("/api/v1/me/skills/{$userSkill->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertStatus(403);
    }

    // ---------------------------------------------------------------
    // Delete User Skill
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_delete_their_skill(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/me/skills/{$userSkill->id}");

        $response->assertStatus(204);

        $this->assertDatabaseMissing('user_skills', ['id' => $userSkill->id]);
    }

    public function test_cannot_delete_another_users_skill(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $userSkill = UserSkill::factory()->create([
            'user_id' => $owner->id,
            'skill_id' => $skill->id,
        ]);

        $response = $this->actingAs($other)
            ->deleteJson("/api/v1/me/skills/{$userSkill->id}");

        $response->assertStatus(403);
    }

    public function test_cannot_delete_skill_with_pending_exchange_request(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $otherSkill = Skill::factory()->create();
        $otherSkill->categories()->attach($category->id);

        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);
        $otherUserSkill = UserSkill::factory()->create([
            'user_id' => $otherUser->id,
            'skill_id' => $otherSkill->id,
            'type' => 'learning',
        ]);

        ExchangeRequest::factory()->create([
            'sender_id' => $user->id,
            'receiver_id' => $otherUser->id,
            'teaching_skill_id' => $userSkill->id,
            'learning_skill_id' => $otherUserSkill->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/me/skills/{$userSkill->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete a skill that is part of an active exchange request.',
            ]);

        $this->assertDatabaseHas('user_skills', ['id' => $userSkill->id]);
    }

    public function test_cannot_delete_skill_with_accepted_exchange_request(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $otherSkill = Skill::factory()->create();
        $otherSkill->categories()->attach($category->id);

        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);
        $otherUserSkill = UserSkill::factory()->create([
            'user_id' => $otherUser->id,
            'skill_id' => $otherSkill->id,
            'type' => 'learning',
        ]);

        ExchangeRequest::factory()->create([
            'sender_id' => $user->id,
            'receiver_id' => $otherUser->id,
            'teaching_skill_id' => $userSkill->id,
            'learning_skill_id' => $otherUserSkill->id,
            'status' => 'accepted',
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/me/skills/{$userSkill->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete a skill that is part of an active exchange request.',
            ]);
    }

    public function test_can_delete_skill_with_completed_exchange_request(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $otherSkill = Skill::factory()->create();
        $otherSkill->categories()->attach($category->id);

        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);
        $otherUserSkill = UserSkill::factory()->create([
            'user_id' => $otherUser->id,
            'skill_id' => $otherSkill->id,
            'type' => 'learning',
        ]);

        ExchangeRequest::factory()->create([
            'sender_id' => $user->id,
            'receiver_id' => $otherUser->id,
            'teaching_skill_id' => $userSkill->id,
            'learning_skill_id' => $otherUserSkill->id,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/me/skills/{$userSkill->id}");

        $response->assertStatus(204);
    }

    public function test_can_delete_skill_with_cancelled_exchange_request(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);
        $otherSkill = Skill::factory()->create();
        $otherSkill->categories()->attach($category->id);

        $userSkill = UserSkill::factory()->create([
            'user_id' => $user->id,
            'skill_id' => $skill->id,
            'type' => 'teaching',
        ]);
        $otherUserSkill = UserSkill::factory()->create([
            'user_id' => $otherUser->id,
            'skill_id' => $otherSkill->id,
            'type' => 'learning',
        ]);

        ExchangeRequest::factory()->create([
            'sender_id' => $user->id,
            'receiver_id' => $otherUser->id,
            'teaching_skill_id' => $userSkill->id,
            'learning_skill_id' => $otherUserSkill->id,
            'status' => 'cancelled',
        ]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/me/skills/{$userSkill->id}");

        $response->assertStatus(204);
    }

    // ---------------------------------------------------------------
    // Many-to-Many Category Verification (Phase 5.2)
    // ---------------------------------------------------------------

    public function test_duplicate_category_ids_in_payload_rejected(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'TestSkill',
                'category_ids' => [$category->id, $category->id],
                'type' => 'teaching',
                'title' => 'Test',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(422);
    }

    public function test_custom_skill_multi_category_attach(): void
    {
        $user = User::factory()->create();
        $catA = SkillCategory::factory()->create();
        $catB = SkillCategory::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'MultiCategorySkill',
                'category_ids' => [$catA->id, $catB->id],
                'type' => 'teaching',
                'title' => 'Multi Category',
                'experience_level' => 'intermediate',
            ]);

        $response->assertStatus(201);

        $skill = Skill::where('name', 'MultiCategorySkill')->first();
        $this->assertNotNull($skill);
        $this->assertEquals(2, $skill->categories()->count());
        $this->assertTrue($skill->categories->contains($catA->id));
        $this->assertTrue($skill->categories->contains($catB->id));
    }

    public function test_idempotent_reattach_does_not_error(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => $skill->name,
                'category_ids' => [$category->id],
                'type' => 'learning',
                'title' => 'Reattach Test',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(201);
        $this->assertEquals(1, $skill->categories()->count(),
            'Should not duplicate pivot row on re-attach');
    }

    public function test_skill_response_includes_categories_array(): void
    {
        $user = User::factory()->create();
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/skills');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => ['user_skills' => [
                '*' => [
                    'skill' => ['categories' => [
                        '*' => ['id', 'name', 'slug'],
                    ]],
                ],
            ]],
        ]);
    }

    public function test_skills_endpoint_includes_categories(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();
        $skill->categories()->attach($category->id);

        $response = $this->getJson('/api/v1/skills');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => ['skills' => [
                '*' => ['categories' => [
                    '*' => ['id', 'name', 'slug'],
                ]],
            ]],
        ]);
    }

    public function test_category_ids_required_when_creating_custom_skill(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'NoCategory',
                'type' => 'teaching',
                'title' => 'No Category',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(422);
    }

    public function test_category_ids_must_be_valid_category(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/skills', [
                'skill_name' => 'InvalidCat',
                'category_ids' => [99999],
                'type' => 'teaching',
                'title' => 'Invalid Category',
                'experience_level' => 'beginner',
            ]);

        $response->assertStatus(422);
    }

    public function test_pivot_unique_constraint_at_db_level(): void
    {
        $category = SkillCategory::factory()->create();
        $skill = Skill::factory()->create();

        $skill->categories()->attach($category->id);

        $this->expectException(\Illuminate\Database\QueryException::class);
        $skill->categories()->attach($category->id);
    }
}
