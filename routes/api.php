<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthCheckController;
use App\Http\Controllers\Api\V1\LanguageController;
use App\Http\Controllers\Api\V1\Discover\DiscoverController;
use App\Http\Controllers\Api\V1\Profile\PortfolioLinkController;
use App\Http\Controllers\Api\V1\Profile\ProfileController;
use App\Http\Controllers\Api\V1\Skills\SkillCategoryController;
use App\Http\Controllers\Api\V1\Skills\SkillController;
use App\Http\Controllers\Api\V1\Skills\UserSkillController;
use Illuminate\Support\Facades\Route;

Route::name('api.')
    ->prefix('v1')
    ->group(function (): void {

        Route::get('health', HealthCheckController::class)
            ->name('health');

        Route::get('languages', [LanguageController::class, 'index'])
            ->name('languages.index');

        Route::get('skill-categories', [SkillCategoryController::class, 'index'])
            ->name('skill-categories.index');

        Route::get('skills', [SkillController::class, 'index'])
            ->name('skills.index');

        Route::get('discover', [DiscoverController::class, 'index'])
            ->name('discover.index')
            ->middleware('throttle:api');

        Route::prefix('auth')->group(function (): void {

            Route::post('register', [AuthController::class, 'register'])
                ->name('auth.register');

            Route::post('login', [AuthController::class, 'login'])
                ->name('auth.login')
                ->middleware('throttle:login');

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

            Route::prefix('me')->group(function (): void {

                Route::get('profile', [ProfileController::class, 'show'])
                    ->name('me.profile.show');

                Route::put('profile', [ProfileController::class, 'update'])
                    ->name('me.profile.update');

                Route::post('avatar', [ProfileController::class, 'uploadAvatar'])
                    ->name('me.avatar.upload');

                Route::delete('avatar', [ProfileController::class, 'deleteAvatar'])
                    ->name('me.avatar.delete');

                Route::get('availability', [ProfileController::class, 'getAvailability'])
                    ->name('me.availability.show');

                Route::put('availability', [ProfileController::class, 'updateAvailability'])
                    ->name('me.availability.update');

                Route::get('portfolio-links', [PortfolioLinkController::class, 'index'])
                    ->name('me.portfolio-links.index');

                Route::post('portfolio-links', [PortfolioLinkController::class, 'store'])
                    ->name('me.portfolio-links.store');

                Route::put('portfolio-links/reorder', [PortfolioLinkController::class, 'reorder'])
                    ->name('me.portfolio-links.reorder');

                Route::put('portfolio-links/{portfolioLink}', [PortfolioLinkController::class, 'update'])
                    ->name('me.portfolio-links.update');

                Route::delete('portfolio-links/{portfolioLink}', [PortfolioLinkController::class, 'destroy'])
                    ->name('me.portfolio-links.destroy');

                Route::get('skills', [UserSkillController::class, 'index'])
                    ->name('me.skills.index');

                Route::post('skills', [UserSkillController::class, 'store'])
                    ->name('me.skills.store');

                Route::put('skills/{userSkill}', [UserSkillController::class, 'update'])
                    ->name('me.skills.update');

                Route::delete('skills/{userSkill}', [UserSkillController::class, 'destroy'])
                    ->name('me.skills.destroy');

            });
        });

        Route::get('users/{username}', [ProfileController::class, 'showPublic'])
            ->name('users.show');
    });
