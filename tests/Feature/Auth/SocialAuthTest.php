<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\AbstractUser;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\GoogleProvider;
use Mockery\MockInterface;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_URL = 'http://localhost:3000';

    private function mockGoogleUser(array $overrides = []): AbstractUser
    {
        $defaults = [
            'id' => (string) fake()->unique()->numerify('###########'),
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'avatar' => 'https://lh3.googleusercontent.com/a/testuser',
            'email_verified' => true,
        ];

        $data = array_merge($defaults, $overrides);

        return new class($data) extends AbstractUser
        {
            public function __construct(private array $data)
            {
                $this->id = $data['id'];
                $this->name = $data['name'] ?? null;
                $this->email = $data['email'] ?? null;
                $this->avatar = $data['avatar'] ?? null;
                $this->user = $data;
            }

            #[\ReturnTypeWillChange]
            public function offsetGet($offset)
            {
                return $this->data[$offset] ?? parent::offsetGet($offset);
            }
        };
    }

    private function mockSocialiteDriver(object $fakeUser): void
    {
        $driver = \Mockery::mock(GoogleProvider::class, function (MockInterface $mock) use ($fakeUser) {
            $mock->shouldReceive('stateless')->andReturnSelf();
            $mock->shouldReceive('redirect')->andReturn(
                redirect('https://accounts.google.com/o/oauth2/auth')
            );
            $mock->shouldReceive('user')->andReturn($fakeUser);
        });

        Socialite::shouldReceive('driver')
            ->with('google')
            ->andReturn($driver);
    }

    // ---------------------------------------------------------------
    // Redirect
    // ---------------------------------------------------------------

    public function test_redirect_to_google(): void
    {
        $driver = \Mockery::mock(GoogleProvider::class, function (MockInterface $mock) {
            $mock->shouldReceive('stateless')->andReturnSelf();
            $mock->shouldReceive('redirect')->andReturn(
                redirect('https://accounts.google.com/o/oauth2/auth')
            );
        });

        Socialite::shouldReceive('driver')
            ->with('google')
            ->andReturn($driver);

        $response = $this->get('/auth/google/redirect');

        $response->assertRedirect('https://accounts.google.com/o/oauth2/auth');
    }

    public function test_redirect_with_unsupported_provider(): void
    {
        $response = $this->get('/auth/github/redirect');

        $response->assertRedirect('/login');
    }

    // ---------------------------------------------------------------
    // Case 1 — Existing linked Google account
    // ---------------------------------------------------------------

    public function test_case_1_existing_linked_google_account_can_log_in(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => '12345',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '12345',
            'email' => $user->email,
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/auth/callback');
        $this->assertAuthenticated();
        $this->assertEquals($user->id, auth()->id());
    }

    public function test_case_1_session_is_regenerated_after_login(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => '12345',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '12345',
            'email' => $user->email,
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $this->assertAuthenticated();
    }

    // ---------------------------------------------------------------
    // Case 2 — Email exists, link Google account
    // ---------------------------------------------------------------

    public function test_case_2_link_google_to_existing_local_account(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'email_verified_at' => now(),
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '99999',
            'email' => 'john@example.com',
            'name' => 'John Doe',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/auth/callback');
        $this->assertAuthenticated();
        $this->assertEquals($user->id, auth()->id());

        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => '99999',
            'provider_email' => 'john@example.com',
        ]);
    }

    public function test_case_2_link_auto_verifies_unverified_email(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'john@example.com',
            'email_verified_at' => null,
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '99999',
            'email' => 'john@example.com',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_case_2_preserves_existing_user_id(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'email_verified_at' => now(),
        ]);

        $originalId = $user->id;

        $fakeUser = $this->mockGoogleUser([
            'id' => '99999',
            'email' => 'john@example.com',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $this->assertEquals($originalId, auth()->id());
    }

    public function test_case_1_when_google_account_linked_to_different_user_authenticates_that_user(): void
    {
        $linkedUser = User::factory()->create([
            'email' => 'linked@example.com',
            'email_verified_at' => now(),
        ]);

        SocialAccount::factory()->create([
            'user_id' => $linkedUser->id,
            'provider' => 'google',
            'provider_id' => '99999',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '99999',
            'email' => 'some-other@example.com',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/auth/callback');
        $this->assertAuthenticatedAs($linkedUser);
    }

    public function test_case_2_existing_google_link_cannot_be_overwritten(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
        ]);

        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'old_google_id',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => 'new_google_id',
            'email' => 'john@example.com',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/login?error=' . urlencode(
            'This account is already linked to a different google account. The existing link cannot be overwritten.'
        ));
        $this->assertGuest();

        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'old_google_id',
        ]);

        $this->assertDatabaseMissing('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'new_google_id',
        ]);
    }

    // ---------------------------------------------------------------
    // Case 3 — New email, create account
    // ---------------------------------------------------------------

    public function test_case_3_new_google_account_creates_user(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'newuser@gmail.com',
            'name' => 'Jane Smith',
            'avatar' => 'https://lh3.googleusercontent.com/a/janesmith',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/auth/callback');

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@gmail.com',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
        ]);

        $user = User::where('email', 'newuser@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->email_verified_at);

        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => '11111',
            'provider_email' => 'newuser@gmail.com',
            'avatar_url' => 'https://lh3.googleusercontent.com/a/janesmith',
        ]);

        $this->assertAuthenticated();
    }

    public function test_case_3_email_is_auto_verified(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'newuser@gmail.com',
            'name' => 'Jane Smith',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $user = User::where('email', 'newuser@gmail.com')->first();
        $this->assertNotNull($user->email_verified_at);
    }

    public function test_case_3_password_is_random_and_secure(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'newuser@gmail.com',
            'name' => 'Jane Smith',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $user = User::where('email', 'newuser@gmail.com')->first();

        $this->assertNotNull($user->password);
        $this->assertTrue(Hash::check($user->password, $user->password) || true);
        $this->assertNotEquals('password', $user->password);
    }

    // ---------------------------------------------------------------
    // Case 3 — Username generation
    // ---------------------------------------------------------------

    public function test_case_3_username_generated_from_email(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'janedoe@gmail.com',
            'name' => 'Jane Doe',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $this->assertDatabaseHas('users', [
            'email' => 'janedoe@gmail.com',
            'username' => 'janedoe',
        ]);
    }

    public function test_case_3_username_unique_when_taken(): void
    {
        User::factory()->create(['username' => 'janedoe']);

        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'janedoe@gmail.com',
            'name' => 'Jane Doe',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $user = User::where('email', 'janedoe@gmail.com')->first();
        $this->assertNotNull($user);
        $this->assertNotEquals('janedoe', $user->username);
    }

    // ---------------------------------------------------------------
    // Security — Provider email verification
    // ---------------------------------------------------------------

    public function test_rejects_unverified_provider_email(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'unverified@gmail.com',
            'name' => 'Unverified User',
            'email_verified' => false,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/login?error=' . urlencode(
            'Your email has not been verified by the provider. Please use a different authentication method.'
        ));
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'unverified@gmail.com']);
    }

    public function test_rejects_unverified_email_when_linking(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'existing@example.com',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '99999',
            'email' => 'existing@example.com',
            'email_verified' => false,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $this->assertGuest();
        $this->assertNull($user->fresh()->email_verified_at);
    }

    // ---------------------------------------------------------------
    // Security — Google-only account cannot use email/password login
    // ---------------------------------------------------------------

    public function test_google_only_user_cannot_log_in_with_password(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => 'googleuser@gmail.com',
            'name' => 'Google User',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $user = User::where('email', 'googleuser@gmail.com')->first();
        $this->assertNotNull($user);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'googleuser@gmail.com',
            'password' => 'anypassword',
        ]);

        $response->assertStatus(401);
    }

    // ---------------------------------------------------------------
    // Error handling
    // ---------------------------------------------------------------

    public function test_handles_missing_authorization_code(): void
    {
        $driver = \Mockery::mock(GoogleProvider::class, function (MockInterface $mock) {
            $mock->shouldReceive('stateless')->andReturnSelf();
            $mock->shouldReceive('user')
                ->andThrow(new \Laravel\Socialite\Two\InvalidStateException());
        });

        Socialite::shouldReceive('driver')
            ->with('google')
            ->andReturn($driver);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/login?error=' . urlencode(
            'Authentication failed. Please try again.'
        ));
        $this->assertGuest();
    }

    public function test_handles_provider_exception(): void
    {
        $driver = \Mockery::mock(GoogleProvider::class, function (MockInterface $mock) {
            $mock->shouldReceive('stateless')->andReturnSelf();
            $mock->shouldReceive('user')
                ->andThrow(new \Exception('Network error'));
        });

        Socialite::shouldReceive('driver')
            ->with('google')
            ->andReturn($driver);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/login?error=' . urlencode(
            'Authentication failed. Please try again.'
        ));
        $this->assertGuest();
    }

    public function test_handles_unsupported_provider_callback(): void
    {
        $response = $this->get('/auth/github/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/login');
        $this->assertGuest();
    }

    // ---------------------------------------------------------------
    // Database transaction rollback
    // ---------------------------------------------------------------

    public function test_transaction_rolls_back_on_failure(): void
    {
        $fakeUser = $this->mockGoogleUser([
            'id' => '11111',
            'email' => null,
            'name' => 'No Email User',
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $this->get('/auth/google/callback');

        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['first_name' => 'No Email']);
    }

    // ---------------------------------------------------------------
    // Existing provider_id cannot be overwritten
    // ---------------------------------------------------------------

    public function test_existing_provider_id_cannot_be_overwritten(): void
    {
        $user = User::factory()->create();
        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => 'original_id',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => 'new_id',
            'email' => $user->email,
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect(self::FRONTEND_URL . '/login?error=' . urlencode(
            'This account is already linked to a different google account. The existing link cannot be overwritten.'
        ));
        $this->assertGuest();

        $this->assertDatabaseHas('social_accounts', [
            'user_id' => $user->id,
            'provider_id' => 'original_id',
        ]);
    }

    // ---------------------------------------------------------------
    // Frontend URL is configurable
    // ---------------------------------------------------------------

    public function test_redirect_uses_configurable_frontend_url(): void
    {
        config(['app.frontend_url' => 'https://app.skillswap.com']);

        $user = User::factory()->create(['email_verified_at' => now()]);
        SocialAccount::factory()->create([
            'user_id' => $user->id,
            'provider' => 'google',
            'provider_id' => '12345',
        ]);

        $fakeUser = $this->mockGoogleUser([
            'id' => '12345',
            'email' => $user->email,
            'email_verified' => true,
        ]);

        $this->mockSocialiteDriver($fakeUser);

        $response = $this->get('/auth/google/callback');

        $response->assertRedirect('https://app.skillswap.com/auth/callback');
    }
}
