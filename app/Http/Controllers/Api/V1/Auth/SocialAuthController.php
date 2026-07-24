<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\BaseController;
use App\Services\Auth\SocialAuthException;
use App\Services\Auth\SocialAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends BaseController
{
    public function __construct(
        private readonly SocialAuthService $socialAuthService,
    ) {}

    public function redirect(string $provider): RedirectResponse
    {
        try {
            $this->socialAuthService->validateProvider($provider);
        } catch (SocialAuthException $e) {
            return redirect('/login');
        }

        session(['social_auth_provider' => $provider]);

        return Socialite::driver($provider)
            ->stateless()
            ->redirect();
    }

    public function callback(Request $request, string $provider): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

        try {
            $this->socialAuthService->validateProvider($provider);
        } catch (SocialAuthException $e) {
            return redirect($frontendUrl . '/login');
        }

        $socialiteUser = null;

        try {
            $socialiteUser = Socialite::driver($provider)
                ->stateless()
                ->user();
        } catch (\Exception $e) {
            Log::warning('Socialite OAuth callback failed', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return redirect($frontendUrl . '/login?error=' . urlencode('Authentication failed. Please try again.'));
        }

        try {
            $user = $this->socialAuthService->authenticate($provider, $socialiteUser);
        } catch (SocialAuthException $e) {
            Log::info('Social auth rejected', [
                'provider' => $provider,
                'reason' => $e->getMessage(),
            ]);

            return redirect($frontendUrl . '/login?error=' . urlencode($e->getMessage()));
        }

        Auth::login($user);

        $request->session()->regenerate();

        return redirect($frontendUrl . '/auth/callback');
    }
}
