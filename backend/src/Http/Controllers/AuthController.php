<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Application\Service\AuthService;
use App\Http\AuthHelper;
use App\Http\Request;
use App\Http\Response;

final class AuthController
{
    public function __construct(private readonly AuthService $authService) {}

    public function register(Request $request): Response
    {
        $body = $request->getJsonBody();
        $result = $this->authService->register(
            (string) ($body['name'] ?? ''),
            (string) ($body['email'] ?? ''),
            (string) ($body['password'] ?? ''),
        );

        return Response::json($result, 201);
    }

    public function login(Request $request): Response
    {
        $body = $request->getJsonBody();
        $result = $this->authService->login(
            (string) ($body['email'] ?? ''),
            (string) ($body['password'] ?? ''),
        );

        return Response::json($result);
    }

    public function me(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $row = $this->authService->me($user);

        return Response::json(['user' => $row]);
    }
}
