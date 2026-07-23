<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthCheckController;
use Illuminate\Support\Facades\Route;

Route::name('api.')
    ->prefix('v1')
    ->group(function (): void {

        Route::get('health', HealthCheckController::class)
            ->name('health');

        Route::prefix('auth')->group(function (): void {

            Route::post('register', [AuthController::class, 'register'])
                ->name('auth.register');

            Route::post('login', [AuthController::class, 'login'])
                ->name('auth.login');

            Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
                ->middleware('signed')
                ->name('auth.email.verify');

            Route::middleware('auth:sanctum')->group(function (): void {

                Route::post('logout', [AuthController::class, 'logout'])
                    ->name('auth.logout');

                Route::get('me', [AuthController::class, 'me'])
                    ->name('auth.me');

                Route::post('email/verification-notification', [AuthController::class, 'resendVerification'])
                    ->name('auth.email.verification.send');

            });
        });

        Route::middleware('auth:sanctum')->group(function (): void {

            Route::get('me', [AuthController::class, 'me'])
                ->name('me');

        });
    });