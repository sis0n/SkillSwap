<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\VerifyCodeRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Mail\EmailVerificationCode;
use App\Models\EmailVerification;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends BaseController
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $email = $request->email;
        $existingUser = User::where('email', $email)->first();

        if ($existingUser && $existingUser->hasVerifiedEmail()) {
            return $this->error(
                message: 'This email is already registered.',
                code: Response::HTTP_CONFLICT,
                errors: ['email' => ['This email is already registered.']],
            );
        }

        if ($existingUser) {
            $usernameTaken = User::where('username', $request->username)
                ->where('id', '!=', $existingUser->id)
                ->exists();
        } else {
            $usernameTaken = User::where('username', $request->username)->exists();
        }

        if ($usernameTaken) {
            return $this->error(
                message: 'This username is already taken.',
                code: Response::HTTP_CONFLICT,
                errors: ['username' => ['This username is already taken.']],
            );
        }

        if ($existingUser) {
            $latestCode = EmailVerification::where('user_id', $existingUser->id)
                ->latest()
                ->first();

            if ($latestCode && $latestCode->isValid()) {
                return $this->success(
                    data: ['email' => $email],
                    message: 'A verification code has already been sent to this email.',
                    code: Response::HTTP_OK,
                );
            }

            $existingUser->update([
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'suffix' => $request->suffix,
                'username' => $request->username,
                'password' => $request->password,
            ]);

            $this->sendCodeToUser($existingUser);

            return $this->success(
                data: ['email' => $email],
                message: 'Registration successful. A new verification code has been sent to your email.',
                code: Response::HTTP_OK,
            );
        }

        $user = User::create([
            'role_id' => Role::findBySlug(Role::USER)->id,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'username' => $request->username,
            'email' => $email,
            'password' => $request->password,
        ]);

        $this->sendCodeToUser($user);

        return $this->success(
            data: ['email' => $user->email],
            message: 'Registration successful. Please verify your email.',
            code: Response::HTTP_CREATED,
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::withRole()->where('email', $request->email)->first();

        if (!$user) {
            return $this->error(
                message: 'Invalid email or password.',
                code: Response::HTTP_UNAUTHORIZED,
            );
        }

        if (!$user->hasVerifiedEmail()) {
            return $this->error(
                message: 'Please verify your email before logging in.',
                code: Response::HTTP_FORBIDDEN,
                errors: [
                    'email' => ['Email not yet verified.'],
                    'requires_verification' => true,
                ],
            );
        }

        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            return $this->error(
                message: 'Invalid email or password.',
                code: Response::HTTP_UNAUTHORIZED,
            );
        }

        $request->session()->regenerate();

        return $this->success(
            data: [
                'user' => new UserResource($user),
            ],
            message: 'Login successful.',
        );
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return $this->success(
            message: 'Logged out successfully.',
        );
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('role');

        return $this->success(
            data: [
                'user' => new UserResource($user),
            ],
            message: 'Authenticated user retrieved.',
        );
    }

    public function sendVerificationCode(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        if ($validator->fails()) {
            return $this->error(
                message: 'Validation failed.',
                code: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: $validator->errors()->toArray(),
            );
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return $this->error(
                message: 'Email already verified.',
                code: Response::HTTP_BAD_REQUEST,
            );
        }

        $latestCode = EmailVerification::where('user_id', $user->id)
            ->latest()
            ->first();

        if ($latestCode && $latestCode->created_at->gt(now()->subSeconds(60))) {
            $retryAfter = 60 - now()->diffInSeconds($latestCode->created_at);

            return $this->error(
                message: 'Please wait before requesting a new code.',
                code: Response::HTTP_TOO_MANY_REQUESTS,
                errors: [
                    'retry_after' => max(1, (int) ceil($retryAfter)),
                ],
            );
        }

        $this->sendCodeToUser($user);

        return $this->success(
            message: 'Verification code sent.',
            data: [
                'expires_at' => now()->addMinutes(10)->toIso8601String(),
            ],
        );
    }

    public function verifyCode(VerifyCodeRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return $this->error(
                message: 'No account found with this email.',
                code: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['email' => ['No account found with this email.']],
            );
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(
                message: 'Email already verified.',
            );
        }

        $record = EmailVerification::where('user_id', $user->id)
            ->valid()
            ->latest()
            ->first();

        if (!$record) {
            $expiredRecord = EmailVerification::where('user_id', $user->id)
                ->whereNull('used_at')
                ->latest()
                ->first();

            if ($expiredRecord) {
                return $this->error(
                    message: 'Verification code has expired. Please request a new one.',
                    code: Response::HTTP_UNPROCESSABLE_ENTITY,
                    errors: ['code' => ['The verification code has expired. Please request a new one.']],
                );
            }

            return $this->error(
                message: 'No verification code found. Please request a new one.',
                code: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['code' => ['No verification code found. Please request a new one.']],
            );
        }

        if (!Hash::check($request->code, $record->code)) {
            return $this->error(
                message: 'Invalid verification code.',
                code: Response::HTTP_UNPROCESSABLE_ENTITY,
                errors: ['code' => ['The verification code is invalid.']],
            );
        }

        $record->markAsUsed();

        $user->markEmailAsVerified();

        return $this->success(
            message: 'Email verified successfully.',
        );
    }

    private function sendCodeToUser(User $user): void
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

        Mail::to($user->email)->send(new EmailVerificationCode($code));
    }
}
