<?php

declare(strict_types=1);

namespace App\Routes;

use App\Http\Controllers\AuthController;
use App\Http\Request;
use App\Http\Response;

function normalize_route_path(string $path): string
{
    if ($path !== '/' && str_ends_with($path, '/')) {
        return rtrim($path, '/') ?: '/';
    }

    return $path;
}

function dispatch_api(Request $request, array $deps): Response
{
    $path = normalize_route_path($request->getPath());
    $method = $request->getMethod();
    $routes = getRoutes($deps, $request);

    foreach ($routes as [$routeMethod, $routePath, $handler]) {

        if ($method !== $routeMethod) {
            continue;
        }

        if ($routePath === $path) {
            return $handler();
        }

        // Regex match
        if (str_starts_with($routePath, '#') && preg_match($routePath, $path, $matches)) {
            array_shift($matches); // remove full match
            return $handler(...$matches);
        }
    }

    return Response::json(['error' => 'Not found'], 404);
}

function getRoutes(array $deps, Request $request): array
{
    $pathPrefix = rtrim((string) $deps['api_prefix'], '/');
    $controllers = [
        'auth' => new AuthController($deps['auth']),
    ];

    return [
        // Auth
        ['POST', "$pathPrefix/auth/register", fn() => $controllers['auth']->register($request)],
        ['POST', "$pathPrefix/auth/login", fn() => $controllers['auth']->login($request)],
    ];
}
