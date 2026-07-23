<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\BaseController;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends BaseController
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'suffix' => $request->suffix,
            'username' => $request->username,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        event(new Registered($user));

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success(
            data: [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            message: 'Registration successful.',
            code: Response::HTTP_CREATED,
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error(
                message: 'Invalid email or password.',
                code: Response::HTTP_UNAUTHORIZED,
            );
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return $this->success(
            data: [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            message: 'Login successful.',
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(
            message: 'Logged out successfully.',
        );
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success(
            data: new UserResource($request->user()),
            message: 'Authenticated user retrieved.',
        );
    }

    public function verifyEmail(Request $request, string $id, string $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return $this->error(
                message: 'Invalid verification link.',
                code: Response::HTTP_FORBIDDEN,
            );
        }

        if ($user->hasVerifiedEmail()) {
            return $this->success(
                message: 'Email already verified.',
            );
        }

        $user->markEmailAsVerified();

        return $this->success(
            message: 'Email verified successfully.',
        );
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->success(
                message: 'Email already verified.',
            );
        }

        $user->sendEmailVerificationNotification();

        return $this->success(
            message: 'Verification email sent.',
        );
    }
}
