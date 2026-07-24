<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Models\Role;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\AbstractUser as SocialiteUser;

class SocialAuthService
{
    private const array PROVIDERS = ['google'];

    public function getAvailableProviders(): array
    {
        return self::PROVIDERS;
    }

    public function validateProvider(string $provider): void
    {
        if (!in_array($provider, self::PROVIDERS, true)) {
            throw new SocialAuthException("Provider [{$provider}] is not supported.");
        }
    }

    public function authenticate(string $provider, SocialiteUser $socialiteUser): User
    {
        $providerId = (string) $socialiteUser->getId();
        $email = $socialiteUser->getEmail();

        $existingSocialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->first();

        if ($existingSocialAccount) {
            return $existingSocialAccount->user;
        }

        $existingUser = $email ? User::where('email', $email)->first() : null;

        if ($existingUser) {
            return $this->linkAccount($existingUser, $provider, $socialiteUser);
        }

        return $this->createUser($provider, $socialiteUser);
    }

    private function linkAccount(User $user, string $provider, SocialiteUser $socialiteUser): User
    {
        $providerId = (string) $socialiteUser->getId();

        $alreadyLinked = SocialAccount::where('provider', $provider)
            ->where('provider_id', $providerId)
            ->where('user_id', '!=', $user->id)
            ->exists();

        if ($alreadyLinked) {
            throw new SocialAuthException('This social account is already linked to another user.');
        }

        $existingLink = SocialAccount::where('user_id', $user->id)
            ->where('provider', $provider)
            ->first();

        if ($existingLink && $existingLink->provider_id !== $providerId) {
            throw new SocialAuthException(
                "This account is already linked to a different {$provider} account. " .
                'The existing link cannot be overwritten.'
            );
        }

        if (!$this->isEmailVerifiedByProvider($socialiteUser)) {
            throw new SocialAuthException(
                'Your email has not been verified by the provider. ' .
                'Please use a different authentication method.'
            );
        }

        DB::transaction(function () use ($user, $provider, $socialiteUser) {
            if (!$user->hasVerifiedEmail()) {
                $user->markEmailAsVerified();
            }

            $this->createSocialAccount($user, $provider, $socialiteUser);
        });

        return $user;
    }

    private function createUser(string $provider, SocialiteUser $socialiteUser): User
    {
        if (!$this->isEmailVerifiedByProvider($socialiteUser)) {
            throw new SocialAuthException(
                'Your email has not been verified by the provider. ' .
                'Please use a different authentication method.'
            );
        }

        if (!$socialiteUser->getEmail()) {
            throw new SocialAuthException(
                'No email address returned by the provider. ' .
                'Please use a different authentication method.'
            );
        }

        return DB::transaction(function () use ($provider, $socialiteUser) {
            $user = User::create([
                'role_id' => Role::findBySlug(Role::USER)->id,
                'first_name' => $this->extractFirstName($socialiteUser),
                'middle_name' => null,
                'last_name' => $this->extractLastName($socialiteUser),
                'suffix' => null,
                'username' => $this->generateUniqueUsername($socialiteUser->getEmail()),
                'email' => $socialiteUser->getEmail(),
                'password' => $this->generatePassword(),
            ]);

            $user->markEmailAsVerified();

            $this->createSocialAccount($user, $provider, $socialiteUser);

            return $user;
        });
    }

    private function createSocialAccount(User $user, string $provider, SocialiteUser $socialiteUser): SocialAccount
    {
        return $user->socialAccounts()->create([
            'provider' => $provider,
            'provider_id' => (string) $socialiteUser->getId(),
            'provider_email' => $socialiteUser->getEmail(),
            'avatar_url' => $socialiteUser->getAvatar(),
        ]);
    }

    private function isEmailVerifiedByProvider(SocialiteUser $socialiteUser): bool
    {
        return filter_var(
            $socialiteUser->offsetGet('email_verified') ?? $socialiteUser->offsetGet('verified_email') ?? false,
            FILTER_VALIDATE_BOOLEAN
        );
    }

    private function extractFirstName(SocialiteUser $socialiteUser): string
    {
        $name = trim((string) $socialiteUser->getName());

        if ($name === '') {
            return explode('@', (string) $socialiteUser->getEmail())[0];
        }

        $parts = explode(' ', $name, 2);

        return $parts[0] ?: 'User';
    }

    private function extractLastName(SocialiteUser $socialiteUser): string
    {
        $name = trim((string) $socialiteUser->getName());

        if ($name === '') {
            return 'User';
        }

        $parts = explode(' ', $name, 2);

        return $parts[1] ?? 'User';
    }

    private function generateUniqueUsername(string $email): string
    {
        $baseUsername = explode('@', $email)[0];
        $baseUsername = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseUsername);
        $baseUsername = substr($baseUsername, 0, 20);

        $username = $baseUsername;
        $counter = 1;

        while (User::where('username', $username)->exists()) {
            $suffix = (string) $counter;
            $username = substr($baseUsername, 0, 20 - strlen($suffix) - 1) . '_' . $suffix;
            $counter++;
        }

        return $username;
    }

    private function generatePassword(): string
    {
        return Hash::make(Str::random(64));
    }
}
