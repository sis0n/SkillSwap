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

            Route::post('email/send-code', [AuthController::class, 'sendVerificationCode'])
                ->name('auth.email.send-code');

            Route::post('email/verify-code', [AuthController::class, 'verifyCode'])
                ->name('auth.email.verify-code');

            Route::middleware('auth:sanctum')->group(function (): void {

                Route::post('logout', [AuthController::class, 'logout'])
                    ->name('auth.logout');

                Route::get('me', [AuthController::class, 'me'])
                    ->name('auth.me');

            });
        });

        Route::middleware('auth:sanctum')->group(function (): void {

            Route::get('me', [AuthController::class, 'me'])
                ->name('me');

        });
    });
