<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Application\Service\SongService;
use App\Http\AuthHelper;
use App\Http\Request;
use App\Http\Response;

final class SongController
{
    public function __construct(private readonly SongService $songService)
    {
    }

    public function listByArtist(Request $request, int $artistId): Response
    {
        $user = AuthHelper::requireUser($request);
        $page = (int) ($request->getQueryString('page', '1') ?? '1');
        $perPage = (int) ($request->getQueryString('per_page', '15') ?? '15');
        $result = $this->songService->listByArtist($user, $artistId, $page, $perPage);

        return Response::json($result);
    }

    public function create(Request $request, int $artistId): Response
    {
        $user = AuthHelper::requireUser($request);
        $body = $request->getJsonBody();
        $created = $this->songService->create($user, $artistId, $body);

        return Response::json(['song' => $created], 201);
    }

    public function update(Request $request, int $artistId, int $songId): Response
    {
        $user = AuthHelper::requireUser($request);
        $body = $request->getJsonBody();
        $updated = $this->songService->update($user, $artistId, $songId, $body);

        return Response::json(['song' => $updated]);
    }

    public function delete(Request $request, int $artistId, int $songId): Response
    {
        $user = AuthHelper::requireUser($request);
        $this->songService->delete($user, $artistId, $songId);

        return Response::empty(204);
    }
}
