<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

class HealthCheckController extends BaseController
{
    public function __invoke(): JsonResponse
    {
        return $this->success([
            'app' => config('app.name'),
            'version' => 'v1',
            'environment' => config('app.env'),
            'php_version' => PHP_VERSION,
            'timestamp' => now()->toIso8601String(),
        ], 'Service is healthy');
    }
}