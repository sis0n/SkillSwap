<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::name('api.')
    ->prefix('v1')
    ->group(function (): void {

        Route::get('health', App\Http\Controllers\Api\V1\HealthCheckController::class)
            ->name('health');

    });