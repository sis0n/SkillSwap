<?php

declare(strict_types=1);

namespace Tests\Feature\Profile;

use App\Models\PortfolioLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioLinkTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------
    // List portfolio links
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_list_their_portfolio_links(): void
    {
        $user = User::factory()->create();
        PortfolioLink::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/portfolio-links');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Portfolio links retrieved.',
            ])
            ->assertJsonCount(3, 'data.portfolio_links');
    }

    public function test_unauthenticated_user_cannot_list_portfolio_links(): void
    {
        $response = $this->getJson('/api/v1/me/portfolio-links');

        $response->assertStatus(401);
    }

    public function test_portfolio_links_list_returns_empty_array_when_none_exist(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/portfolio-links');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.portfolio_links');
    }

    // ---------------------------------------------------------------
    // Create portfolio link
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_create_portfolio_link(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'github',
                'url' => 'https://github.com/johndoe',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Portfolio link created.',
                'data' => ['portfolio_link' => [
                    'platform' => 'github',
                    'url' => 'https://github.com/johndoe',
                    'display_order' => 0,
                ]],
            ]);

        $this->assertDatabaseHas('portfolio_links', [
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/johndoe',
        ]);
    }

    public function test_unauthenticated_user_cannot_create_portfolio_link(): void
    {
        $response = $this->postJson('/api/v1/me/portfolio-links', [
            'platform' => 'github',
            'url' => 'https://github.com/johndoe',
        ]);

        $response->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Update portfolio link
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_update_their_portfolio_link(): void
    {
        $user = User::factory()->create();
        $link = PortfolioLink::factory()->create([
            'user_id' => $user->id,
            'platform' => 'github',
            'url' => 'https://github.com/old',
        ]);

        $response = $this->actingAs($user)
            ->putJson("/api/v1/me/portfolio-links/{$link->id}", [
                'platform' => 'linkedin',
                'url' => 'https://linkedin.com/in/johndoe',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['portfolio_link' => [
                    'platform' => 'linkedin',
                    'url' => 'https://linkedin.com/in/johndoe',
                ]],
            ]);
    }

    public function test_user_cannot_update_another_users_portfolio_link(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $link = PortfolioLink::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($other)
            ->putJson("/api/v1/me/portfolio-links/{$link->id}", [
                'platform' => 'github',
                'url' => 'https://github.com/other',
            ]);

        $response->assertStatus(403);
    }

    // ---------------------------------------------------------------
    // Delete portfolio link
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_delete_their_portfolio_link(): void
    {
        $user = User::factory()->create();
        $link = PortfolioLink::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->deleteJson("/api/v1/me/portfolio-links/{$link->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('portfolio_links', ['id' => $link->id]);
    }

    public function test_user_cannot_delete_another_users_portfolio_link(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $link = PortfolioLink::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($other)
            ->deleteJson("/api/v1/me/portfolio-links/{$link->id}");

        $response->assertStatus(403);
        $this->assertDatabaseHas('portfolio_links', ['id' => $link->id]);
    }

    // ---------------------------------------------------------------
    // Platform URL validation
    // ---------------------------------------------------------------

    public function test_valid_github_url_is_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'github',
                'url' => 'https://github.com/johndoe',
            ]);

        $response->assertStatus(201);
    }

    public function test_invalid_github_url_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'github',
                'url' => 'https://example.com/profile',
            ]);

        $response->assertStatus(422);
    }

    public function test_valid_linkedin_url_is_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'linkedin',
                'url' => 'https://linkedin.com/in/johndoe',
            ]);

        $response->assertStatus(201);
    }

    public function test_valid_youtube_url_is_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'youtube',
                'url' => 'https://youtube.com/@johndoe',
            ]);

        $response->assertStatus(201);
    }

    public function test_valid_website_url_is_accepted(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'website',
                'url' => 'https://johndoe.dev',
            ]);

        $response->assertStatus(201);
    }

    public function test_invalid_platform_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'facebook',
                'url' => 'https://facebook.com/johndoe',
            ]);

        $response->assertStatus(422);
    }

    public function test_invalid_url_format_is_rejected(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/portfolio-links', [
                'platform' => 'github',
                'url' => 'not-a-url',
            ]);

        $response->assertStatus(422);
    }

    // ---------------------------------------------------------------
    // Reorder
    // ---------------------------------------------------------------

    public function test_user_can_reorder_portfolio_links(): void
    {
        $user = User::factory()->create();
        $link1 = PortfolioLink::factory()->create(['user_id' => $user->id, 'display_order' => 0]);
        $link2 = PortfolioLink::factory()->create(['user_id' => $user->id, 'display_order' => 1]);
        $link3 = PortfolioLink::factory()->create(['user_id' => $user->id, 'display_order' => 2]);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/portfolio-links/reorder', [
                'ordered_ids' => [$link3->id, $link1->id, $link2->id],
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('portfolio_links', ['id' => $link3->id, 'display_order' => 0]);
        $this->assertDatabaseHas('portfolio_links', ['id' => $link1->id, 'display_order' => 1]);
        $this->assertDatabaseHas('portfolio_links', ['id' => $link2->id, 'display_order' => 2]);
    }

    // ---------------------------------------------------------------
    // Public profile includes portfolio links
    // ---------------------------------------------------------------

    public function test_public_profile_includes_portfolio_links(): void
    {
        $user = User::factory()->create();
        PortfolioLink::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/v1/users/{$user->username}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['user' => [
                    'portfolio_links' => [
                        ['id', 'platform', 'url', 'display_order'],
                    ],
                ]],
            ]);
    }

    // ---------------------------------------------------------------
    // Own profile includes portfolio links
    // ---------------------------------------------------------------

    public function test_own_profile_includes_portfolio_links(): void
    {
        $user = User::factory()->create();
        PortfolioLink::factory()->count(2)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => ['user' => [
                    'portfolio_links' => [
                        ['id', 'platform', 'url', 'display_order'],
                    ],
                ]],
            ]);
    }
}
