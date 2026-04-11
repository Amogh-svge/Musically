<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Application\Service\UserService;
use App\Http\AuthHelper;
use App\Http\Request;
use App\Http\Response;

final class UserController
{
    public function __construct(private readonly UserService $userService)
    {
    }

    public function list(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $page = (int) ($request->getQueryString('page', '1') ?? '1');
        $perPage = (int) ($request->getQueryString('per_page', '15') ?? '15');
        $result = $this->userService->list($user, $page, $perPage);

        return Response::json($result);
    }

    public function create(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $body = $request->getJsonBody();
        $created = $this->userService->create($user, $body);

        return Response::json(['user' => $created], 201);
    }

    public function update(Request $request, int $id): Response
    {
        $user = AuthHelper::requireUser($request);
        $body = $request->getJsonBody();
        $updated = $this->userService->update($user, $id, $body);

        return Response::json(['user' => $updated]);
    }

    public function delete(Request $request, int $id): Response
    {
        $user = AuthHelper::requireUser($request);
        $this->userService->delete($user, $id);

        return Response::empty(204);
    }
}
