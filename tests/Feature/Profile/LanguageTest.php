<?php

declare(strict_types=1);

namespace Tests\Feature\Profile;

use App\Models\Language;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LanguageTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_REFERER = 'http://localhost:5173';

    private function statefulJson(string $method, string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('Referer', self::FRONTEND_REFERER)->json($method, $uri, $data);
    }

    public function test_language_list_returns_all_languages(): void
    {
        Language::factory()->create(['code' => 'en', 'name' => 'English']);
        Language::factory()->create(['code' => 'es', 'name' => 'Spanish']);
        Language::factory()->create(['code' => 'fr', 'name' => 'French']);

        $response = $this->getJson('/api/v1/languages');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Languages retrieved.',
            ])
            ->assertJsonStructure([
                'data' => ['languages' => [
                    '*' => ['id', 'code', 'name', 'native_name'],
                ]],
            ]);

        $this->assertCount(3, $response->json('data.languages'));
    }

    public function test_language_list_is_public(): void
    {
        Language::factory()->create(['code' => 'en', 'name' => 'English']);

        $response = $this->getJson('/api/v1/languages');

        $response->assertStatus(200);
    }

    public function test_language_list_returns_empty_when_no_languages(): void
    {
        $response = $this->getJson('/api/v1/languages');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => ['languages' => []],
            ]);
    }

    public function test_update_profile_with_valid_languages(): void
    {
        $user = User::factory()->create();
        $english = Language::factory()->create(['code' => 'en', 'name' => 'English']);
        $spanish = Language::factory()->create(['code' => 'es', 'name' => 'Spanish']);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'languages' => [
                    ['code' => 'en', 'proficiency' => 'native'],
                    ['code' => 'es', 'proficiency' => 'intermediate'],
                ],
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('user_languages', [
            'user_id' => $user->id,
            'language_id' => $english->id,
            'proficiency' => 'native',
        ]);

        $this->assertDatabaseHas('user_languages', [
            'user_id' => $user->id,
            'language_id' => $spanish->id,
            'proficiency' => 'intermediate',
        ]);
    }

    public function test_update_profile_with_invalid_language_code_returns_422(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'languages' => [
                    ['code' => 'xx', 'proficiency' => 'native'],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_update_profile_with_invalid_proficiency_returns_422(): void
    {
        $user = User::factory()->create();
        Language::factory()->create(['code' => 'en', 'name' => 'English']);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'languages' => [
                    ['code' => 'en', 'proficiency' => 'super-expert'],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_update_profile_replaces_languages(): void
    {
        $user = User::factory()->create();
        $english = Language::factory()->create(['code' => 'en', 'name' => 'English']);
        $spanish = Language::factory()->create(['code' => 'es', 'name' => 'Spanish']);
        $french = Language::factory()->create(['code' => 'fr', 'name' => 'French']);

        $user->languages()->attach($english->id, ['proficiency' => 'native']);

        $this->assertDatabaseCount('user_languages', 1);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'languages' => [
                    ['code' => 'es', 'proficiency' => 'fluent'],
                    ['code' => 'fr', 'proficiency' => 'beginner'],
                ],
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseCount('user_languages', 2);
        $this->assertDatabaseMissing('user_languages', [
            'user_id' => $user->id,
            'language_id' => $english->id,
        ]);
    }

    public function test_get_profile_includes_languages(): void
    {
        $user = User::factory()->create();
        $english = Language::factory()->create(['code' => 'en', 'name' => 'English']);
        $user->languages()->attach($english->id, ['proficiency' => 'native']);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/profile');

        $response->assertStatus(200)
            ->assertJson([
                'data' => ['user' => [
                    'languages' => [
                        ['code' => 'en', 'name' => 'English', 'proficiency' => 'native'],
                    ],
                ]],
            ]);
    }

    public function test_public_profile_includes_languages(): void
    {
        $user = User::factory()->create();
        $english = Language::factory()->create(['code' => 'en', 'name' => 'English']);
        $user->languages()->attach($english->id, ['proficiency' => 'native']);

        $response = $this->getJson("/api/v1/users/{$user->username}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => ['user' => [
                    'languages' => [
                        ['code' => 'en', 'name' => 'English', 'proficiency' => 'native'],
                    ],
                ]],
            ]);
    }

    public function test_update_languages_does_not_affect_other_profile_fields(): void
    {
        $user = User::factory()->create();
        $english = Language::factory()->create(['code' => 'en', 'name' => 'English']);

        $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'headline' => 'Developer',
                'languages' => [
                    ['code' => 'en', 'proficiency' => 'native'],
                ],
            ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'headline' => 'Developer',
        ]);

        $this->assertDatabaseHas('user_languages', [
            'user_id' => $user->id,
            'language_id' => $english->id,
            'proficiency' => 'native',
        ]);
    }

    public function test_languages_endpoint_is_read_only(): void
    {
        $response = $this->postJson('/api/v1/languages', [
            'code' => 'xx',
            'name' => 'Test',
        ]);

        $response->assertStatus(405);

        $response = $this->putJson('/api/v1/languages/some-code', [
            'name' => 'Changed',
        ]);

        $response->assertStatus(404);

        $response = $this->deleteJson('/api/v1/languages/some-code');

        $response->assertStatus(404);
    }
}
