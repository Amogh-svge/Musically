<?php

declare(strict_types=1);

namespace App\Routes;

use App\Http\Controllers\ArtistController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SongController;
use App\Http\Controllers\UserController;
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

        // Exact match
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
        'users' => new UserController($deps['users']),
        'artists' => new ArtistController($deps['artists']),
        'songs' => new SongController($deps['songs']),
    ];

    return [
        ['GET', "$pathPrefix/test", fn() => Response::json(['status' => 'ok'])],

        // Auth
        ['POST', "$pathPrefix/auth/register", fn() => $controllers['auth']->register($request)],
        ['POST', "$pathPrefix/auth/login", fn() => $controllers['auth']->login($request)],
        ['GET',  "$pathPrefix/auth/me", fn() => $controllers['auth']->currentUser($request)],

        // Users
        ['GET',  "$pathPrefix/users", fn() => $controllers['users']->list($request)],
        ['POST', "$pathPrefix/users", fn() => $controllers['users']->create($request)],
        ['PUT',  "#^$pathPrefix/users/([0-9]+)$#", fn($id) => $controllers['users']->update($request, (int)$id)],
        ['DELETE', "#^$pathPrefix/users/([0-9]+)$#", fn($id) => $controllers['users']->delete($request, (int)$id)],

        // Artists
        ['GET', "$pathPrefix/artists/export/csv", fn() => $controllers['artists']->exportCsv($request)],
        ['POST', "$pathPrefix/artists/import/csv", fn() => $controllers['artists']->importCsv($request)],
        ['GET', "$pathPrefix/artists", fn() => $controllers['artists']->list($request)],
        ['POST', "$pathPrefix/artists", fn() => $controllers['artists']->create($request)],
        ['PUT', "#^$pathPrefix/artists/([0-9]+)$#", fn($id) => $controllers['artists']->update($request, (int)$id)],
        ['DELETE', "#^$pathPrefix/artists/([0-9]+)$#", fn($id) => $controllers['artists']->delete($request, (int)$id)],

        // Songs
        [
            'GET',
            "#^$pathPrefix/artists/([0-9]+)/songs$#",
            fn($artistId) =>
            $controllers['songs']->listByArtist($request, (int)$artistId)
        ],
        [
            'POST',
            "#^$pathPrefix/artists/([0-9]+)/songs$#",
            fn($artistId) =>
            $controllers['songs']->create($request, (int)$artistId)
        ],
        [
            'PUT',
            "#^$pathPrefix/artists/([0-9]+)/songs/([0-9]+)$#",
            fn($artistId, $songId) =>
            $controllers['songs']->update($request, (int)$artistId, (int)$songId)
        ],
        [
            'DELETE',
            "#^$pathPrefix/artists/([0-9]+)/songs/([0-9]+)$#",
            fn($artistId, $songId) =>
            $controllers['songs']->delete($request, (int)$artistId, (int)$songId)
        ],
    ];
}
