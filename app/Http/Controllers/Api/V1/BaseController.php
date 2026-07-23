<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Traits\ApiResponse;
use Illuminate\Routing\Controller;

abstract class BaseController extends Controller
{
    use ApiResponse;
}