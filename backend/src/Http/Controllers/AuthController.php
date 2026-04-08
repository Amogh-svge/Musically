<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Request;
use App\Http\Response;

final class AuthController
{
    public function register(Request $request): Response {}

    public function login(Request $request): Response {}
}
