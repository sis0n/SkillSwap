<?php

declare(strict_types=1);

namespace Tests\Feature\Profile;

use App\Models\Profile;
use App\Models\User;
use App\Models\UserAvailability;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_REFERER = 'http://localhost:5173';

    private function statefulJson(string $method, string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('Referer', self::FRONTEND_REFERER)->json($method, $uri, $data);
    }

    // ---------------------------------------------------------------
    // Get Current Profile
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_get_their_profile(): void
    {
        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/profile');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile retrieved.',
            ])
            ->assertJsonStructure([
                'data' => ['user' => [
                    'id', 'first_name', 'last_name', 'username', 'email',
                    'profile' => ['bio', 'avatar_url', 'location', 'experience_level'],
                ]],
            ]);
    }

    public function test_get_profile_returns_401_when_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/me/profile');

        $response->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Update Profile
    // ---------------------------------------------------------------

    public function test_update_profile_with_valid_data(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'headline' => 'Full-stack Developer & Mentor',
                'bio' => 'Full-stack developer passionate about teaching.',
                'location' => 'Manila, Philippines',
                'website' => 'https://johndoe.dev',
                'experience_level' => 'intermediate',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Profile updated.',
                'data' => [
                    'profile' => [
                        'headline' => 'Full-stack Developer & Mentor',
                        'bio' => 'Full-stack developer passionate about teaching.',
                        'location' => 'Manila, Philippines',
                        'website' => 'https://johndoe.dev',
                        'experience_level' => 'intermediate',
                    ],
                ],
            ]);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'headline' => 'Full-stack Developer & Mentor',
        ]);
    }

    public function test_update_profile_creates_profile_if_not_exists(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseMissing('profiles', ['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'bio' => 'New bio',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'bio' => 'New bio',
        ]);
    }

    public function test_update_profile_with_invalid_data_returns_422(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'bio' => str_repeat('a', 501),
                'website' => 'not-a-url',
                'experience_level' => 'expert',
            ]);

        $response->assertStatus(422);
    }

    public function test_update_profile_returns_401_when_unauthenticated(): void
    {
        $response = $this->putJson('/api/v1/me/profile', [
            'bio' => 'test',
        ]);

        $response->assertStatus(401);
    }

    public function test_update_profile_with_timezone(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'timezone' => 'Asia/Manila',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'timezone' => 'Asia/Manila',
        ]);
    }

    public function test_get_profile_includes_timezone(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['timezone' => 'America/New_York']);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/profile');

        $response->assertStatus(200)
            ->assertJson([
                'data' => ['user' => [
                    'profile' => ['timezone' => 'America/New_York'],
                ]],
            ]);
    }

    public function test_public_profile_includes_timezone(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['timezone' => 'Europe/London']);

        $response = $this->getJson("/api/v1/users/{$user->username}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => ['user' => [
                    'profile' => ['timezone' => 'Europe/London'],
                ]],
            ]);
    }

    public function test_timezone_is_nullable(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['timezone' => 'Asia/Tokyo']);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'timezone' => null,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'timezone' => null,
        ]);
    }

    public function test_timezone_cannot_exceed_50_characters(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/profile', [
                'timezone' => str_repeat('a', 51),
            ]);

        $response->assertStatus(422);
    }

    // ---------------------------------------------------------------
    // Public Profile
    // ---------------------------------------------------------------

    public function test_get_public_profile_for_existing_user(): void
    {
        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/v1/users/{$user->username}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'User profile retrieved.',
            ])
            ->assertJsonStructure([
                'data' => ['user' => [
                    'id', 'first_name', 'last_name', 'username',
                    'profile' => ['bio', 'avatar_url', 'location', 'experience_level'],
                ]],
            ]);
    }

    public function test_get_public_profile_for_non_existent_user_returns_404(): void
    {
        $response = $this->getJson('/api/v1/users/nonexistent');

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'User not found.',
            ]);
    }

    public function test_public_profile_does_not_expose_email(): void
    {
        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);

        $response = $this->getJson("/api/v1/users/{$user->username}");

        $response->assertJsonMissing(['email', 'email_verified_at', 'role']);
    }

    // ---------------------------------------------------------------
    // Avatar Upload
    // ---------------------------------------------------------------

    public function test_upload_avatar_with_valid_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);

        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/avatar', [
                'avatar' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Avatar uploaded.',
            ])
            ->assertJsonStructure([
                'data' => ['avatar_url'],
            ]);

        Storage::disk('public')->assertExists('avatars/' . $file->hashName());
    }

    public function test_upload_avatar_with_invalid_file_type_returns_422(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/avatar', [
                'avatar' => $file,
            ]);

        $response->assertStatus(422);
    }

    public function test_upload_avatar_with_file_too_large_returns_422(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $file = UploadedFile::fake()->image('large.jpg', 200, 200)->size(3000);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/me/avatar', [
                'avatar' => $file,
            ]);

        $response->assertStatus(422);
    }

    public function test_upload_avatar_returns_401_when_unauthenticated(): void
    {
        $file = UploadedFile::fake()->image('avatar.jpg');

        $response = $this->postJson('/api/v1/me/avatar', [
            'avatar' => $file,
        ]);

        $response->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Avatar Delete
    // ---------------------------------------------------------------

    public function test_delete_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        Profile::factory()->create([
            'user_id' => $user->id,
            'avatar' => 'avatars/test.jpg',
        ]);

        Storage::disk('public')->put('avatars/test.jpg', 'fake-content');

        $response = $this->actingAs($user)
            ->deleteJson('/api/v1/me/avatar');

        $response->assertStatus(204);

        Storage::disk('public')->assertMissing('avatars/test.jpg');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'avatar' => null,
        ]);
    }

    public function test_delete_avatar_when_no_avatar_returns_204(): void
    {
        $user = User::factory()->create();
        Profile::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->deleteJson('/api/v1/me/avatar');

        $response->assertStatus(204);
    }

    public function test_delete_avatar_returns_401_when_unauthenticated(): void
    {
        $response = $this->deleteJson('/api/v1/me/avatar');

        $response->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Get Availability
    // ---------------------------------------------------------------

    public function test_get_availability_returns_slots(): void
    {
        $user = User::factory()->create();
        UserAvailability::factory()->create([
            'user_id' => $user->id,
            'day_of_week' => 1,
            'start_time' => '09:00:00',
            'end_time' => '12:00:00',
        ]);

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me/availability');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Availability retrieved.',
            ])
            ->assertJsonStructure([
                'data' => ['availability' => [
                    '*' => ['id', 'day_of_week', 'day_label', 'start_time', 'end_time'],
                ]],
            ]);
    }

    public function test_get_availability_returns_401_when_unauthenticated(): void
    {
        $response = $this->getJson('/api/v1/me/availability');

        $response->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Update Availability
    // ---------------------------------------------------------------

    public function test_update_availability_with_valid_slots(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/availability', [
                'availability' => [
                    [
                        'day_of_week' => 1,
                        'start_time' => '09:00:00',
                        'end_time' => '12:00:00',
                    ],
                    [
                        'day_of_week' => 3,
                        'start_time' => '14:00:00',
                        'end_time' => '17:00:00',
                    ],
                ],
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Availability updated.',
            ]);

        $this->assertDatabaseCount('user_availability', 2);
    }

    public function test_update_availability_with_invalid_day_of_week_returns_422(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/availability', [
                'availability' => [
                    [
                        'day_of_week' => 7,
                        'start_time' => '09:00:00',
                        'end_time' => '12:00:00',
                    ],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_update_availability_with_start_time_after_end_time_returns_422(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/availability', [
                'availability' => [
                    [
                        'day_of_week' => 1,
                        'start_time' => '12:00:00',
                        'end_time' => '09:00:00',
                    ],
                ],
            ]);

        $response->assertStatus(422);
    }

    public function test_update_availability_returns_401_when_unauthenticated(): void
    {
        $response = $this->putJson('/api/v1/me/availability', [
            'availability' => [],
        ]);

        $response->assertStatus(401);
    }

    public function test_update_availability_replaces_all_existing_slots(): void
    {
        $user = User::factory()->create();

        UserAvailability::factory()->create(['user_id' => $user->id]);
        UserAvailability::factory()->create(['user_id' => $user->id]);

        $this->assertDatabaseCount('user_availability', 2);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/availability', [
                'availability' => [
                    [
                        'day_of_week' => 1,
                        'start_time' => '09:00:00',
                        'end_time' => '12:00:00',
                    ],
                ],
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseCount('user_availability', 1);
    }

    public function test_update_availability_with_empty_array_clears_all_slots(): void
    {
        $user = User::factory()->create();

        UserAvailability::factory()->create(['user_id' => $user->id]);
        UserAvailability::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/availability', [
                'availability' => [],
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseCount('user_availability', 0);
    }

    public function test_update_availability_with_null_clears_all_slots(): void
    {
        $user = User::factory()->create();

        UserAvailability::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)
            ->putJson('/api/v1/me/availability', []);

        $response->assertStatus(200);

        $this->assertDatabaseCount('user_availability', 0);
    }
}
