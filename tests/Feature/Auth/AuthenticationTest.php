<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Models\EmailVerification;
use App\Models\User;
use App\Mail\EmailVerificationCode;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private const FRONTEND_REFERER = 'http://localhost:5173';

    private function statefulJson(string $method, string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->withHeader('Referer', self::FRONTEND_REFERER)->json($method, $uri, $data);
    }

    private function statefulPostJson(string $uri, array $data = []): \Illuminate\Testing\TestResponse
    {
        return $this->statefulJson('POST', $uri, $data);
    }

    // ---------------------------------------------------------------
    // Registration
    // ---------------------------------------------------------------

    public function test_case_1_register_with_new_email(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'middle_name' => null,
            'last_name' => 'Doe',
            'suffix' => null,
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful. Please verify your email.',
                'data' => ['email' => 'john@example.com'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'email_verified_at' => null,
        ]);

        Mail::assertSent(EmailVerificationCode::class, fn ($mail) => $mail->hasTo('john@example.com'));
    }

    public function test_case_2_register_with_existing_verified_email(): void
    {
        User::factory()->create([
            'first_name' => 'Existing',
            'email' => 'john@example.com',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Jane',
            'last_name' => 'Doe',
            'username' => 'janedoe',
            'email' => 'john@example.com',
            'password' => 'password456',
            'password_confirmation' => 'password456',
        ]);

        $response->assertStatus(409)
            ->assertJson([
                'success' => false,
                'message' => 'This email is already registered.',
            ]);

        $this->assertDatabaseCount('users', 1);
    }

    public function test_case_3_register_with_existing_unverified_email_and_valid_code(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'john@example.com',
            'email_verified_at' => null,
        ]);

        $code = EmailVerification::create([
            'user_id' => $user->id,
            'code' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'A verification code has already been sent to this email.',
                'data' => ['email' => 'john@example.com'],
            ]);

        $this->assertDatabaseCount('users', 1);
        $code->refresh();
        $this->assertNull($code->used_at);

        Mail::assertNothingSent();
    }

    public function test_case_4_register_with_existing_unverified_email_and_expired_code(): void
    {
        Mail::fake();

        $user = User::factory()->create([
            'email' => 'john@example.com',
            'email_verified_at' => null,
            'first_name' => 'OldName',
        ]);

        EmailVerification::create([
            'user_id' => $user->id,
            'code' => Hash::make('123456'),
            'expires_at' => now()->subMinutes(5),
        ]);

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful. A new verification code has been sent to your email.',
                'data' => ['email' => 'john@example.com'],
            ]);

        $this->assertDatabaseCount('users', 1);
        $this->assertEquals('John', $user->fresh()->first_name);

        Mail::assertSent(EmailVerificationCode::class, fn ($mail) => $mail->hasTo('john@example.com'));
    }

    public function test_register_fails_with_duplicate_username(): void
    {
        User::factory()->create(['username' => 'johndoe']);

        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(409)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_register_requires_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422);
    }

    public function test_password_is_hashed_in_database(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'username' => 'johndoe',
            'email' => 'john@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $user = User::where('email', 'john@example.com')->first();

        $this->assertNotEquals('password123', $user->password);
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    // ---------------------------------------------------------------
    // Email Verification
    // ---------------------------------------------------------------

    public function test_verify_with_valid_code(): void
    {
        $user = User::factory()->unverified()->create();
        $this->createValidCode($user, '123456');

        $response = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Email verified successfully.',
            ]);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_verify_with_invalid_code(): void
    {
        $user = User::factory()->unverified()->create();
        $this->createValidCode($user, '123456');

        $response = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '000000',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid verification code.',
            ]);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verify_with_expired_code(): void
    {
        $user = User::factory()->unverified()->create();

        EmailVerification::create([
            'user_id' => $user->id,
            'code' => Hash::make('123456'),
            'expires_at' => now()->subMinute(),
        ]);

        $response = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Verification code has expired. Please request a new one.',
            ]);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verify_with_used_code(): void
    {
        $user = User::factory()->unverified()->create();
        $record = $this->createValidCode($user, '123456');
        $record->markAsUsed();

        $response = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'No verification code found. Please request a new one.',
            ]);

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_old_code_invalid_after_new_code_sent(): void
    {
        $user = User::factory()->unverified()->create();

        $firstCode = $this->createValidCode($user, '111111');

        Carbon::setTestNow(now()->addSeconds(61));
        $this->sendCodeToUser($user);
        Carbon::setTestNow();

        $responseOld = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '111111',
        ]);
        $responseOld->assertStatus(422);

        $this->assertNotNull($firstCode->fresh()->used_at);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_verify_after_already_verified_returns_success(): void
    {
        $user = User::factory()->unverified()->create();
        $this->createValidCode($user, '123456');

        $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '123456',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Email already verified.',
            ]);
    }

    // ---------------------------------------------------------------
    // Resend Verification Code
    // ---------------------------------------------------------------

    public function test_resend_before_cooldown_expires(): void
    {
        $user = User::factory()->unverified()->create();
        $this->createValidCode($user, '123456');

        $response = $this->postJson('/api/v1/auth/email/send-code', [
            'email' => $user->email,
        ]);

        $response->assertStatus(429)
            ->assertJson([
                'success' => false,
                'message' => 'Please wait before requesting a new code.',
            ]);
    }

    public function test_resend_after_cooldown_expires(): void
    {
        Mail::fake();

        $user = User::factory()->unverified()->create();
        $this->createValidCode($user, '123456');

        Carbon::setTestNow(now()->addSeconds(61));

        $response = $this->postJson('/api/v1/auth/email/send-code', [
            'email' => $user->email,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Verification code sent.',
            ]);

        Mail::assertSent(EmailVerificationCode::class);
        Carbon::setTestNow();
    }

    public function test_only_newest_code_is_accepted_after_resend(): void
    {
        $user = User::factory()->unverified()->create();
        $this->createValidCode($user, '111111');

        Carbon::setTestNow(now()->addSeconds(61));
        $newCode = $this->sendCodeToUser($user);
        Carbon::setTestNow();

        $responseOld = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => '111111',
        ]);
        $responseOld->assertStatus(422);

        $responseNew = $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => $user->email,
            'code' => $newCode,
        ]);
        $responseNew->assertStatus(200);

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    // ---------------------------------------------------------------
    // Login
    // ---------------------------------------------------------------

    public function test_login_with_verified_account(): void
    {
        User::factory()->create([
            'first_name' => 'John',
            'email' => 'john@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $response = $this->statefulPostJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ]);

        $this->assertAuthenticated();
    }

    public function test_login_fails_with_unverified_account(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => 'password123',
            'email_verified_at' => null,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'message' => 'Please verify your email before logging in.',
            ]);

        $this->assertGuest();
    }

    public function test_login_fails_with_invalid_password(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password.',
            ]);

        $this->assertGuest();
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nonexistent@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid email or password.',
            ]);

        $this->assertGuest();
    }

    public function test_login_after_successful_verification(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $this->createValidCode($user, '123456');

        $this->postJson('/api/v1/auth/email/verify-code', [
            'email' => 'john@example.com',
            'code' => '123456',
        ]);

        $response = $this->statefulPostJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ]);

        $this->assertAuthenticated();
    }

    // ---------------------------------------------------------------
    // Authenticated Routes
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_access_me(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'first_name',
                        'last_name',
                        'username',
                        'email',
                    ],
                ],
            ]);
    }

    public function test_authenticated_user_can_access_me_without_auth_prefix(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'first_name',
                        'last_name',
                        'username',
                        'email',
                    ],
                ],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated',
            ]);
    }

    public function test_unauthenticated_user_cannot_access_logout(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated',
            ]);
    }

    public function test_user_data_does_not_expose_password(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/auth/me');

        $response->assertJsonMissing(['password']);
    }

    public function test_user_resource_does_not_include_hidden_fields(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->getJson('/api/v1/auth/me');

        $response->assertJsonMissing(['password', 'remember_token']);
    }

    // ---------------------------------------------------------------
    // Login Validation
    // ---------------------------------------------------------------

    public function test_login_requires_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_login_requires_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    // ---------------------------------------------------------------
    // Logout
    // ---------------------------------------------------------------

    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create([
            'email' => 'john@example.com',
            'password' => 'password123',
            'email_verified_at' => now(),
        ]);

        $loginResponse = $this->statefulPostJson('/api/v1/auth/login', [
            'email' => 'john@example.com',
            'password' => 'password123',
        ]);
        $loginResponse->assertStatus(200);

        $response = $this->statefulPostJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);
    }

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    private function createValidCode(User $user, string $plainCode): EmailVerification
    {
        return EmailVerification::create([
            'user_id' => $user->id,
            'code' => Hash::make($plainCode),
            'expires_at' => now()->addMinutes(10),
        ]);
    }

    private function sendCodeToUser(User $user): string
    {
        EmailVerification::where('user_id', $user->id)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $code = (string) random_int(100000, 999999);

        EmailVerification::create([
            'user_id' => $user->id,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(10),
        ]);

        return $code;
    }
}
