<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Application\Service\ArtistService;
use App\Http\AuthHelper;
use App\Http\Request;
use App\Http\Response;

final class ArtistController
{
    public function __construct(private readonly ArtistService $artistService)
    {
    }

    public function exportCsv(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $csv = $this->artistService->exportCsv($user);

        return new Response(200, $csv, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="artists.csv"',
        ]);
    }

    public function importCsv(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $file = $request->getUploadedFile('file');
        if ($file === null || $file['error'] !== UPLOAD_ERR_OK) {
            return Response::json(['error' => 'file upload required (field: file)'], 400);
        }
        $content = file_get_contents($file['tmp_name']);
        if ($content === false) {
            return Response::json(['error' => 'could not read file'], 400);
        }
        $result = $this->artistService->importCsv($user, $content);

        return Response::json($result);
    }

    public function list(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $page = (int) ($request->getQueryString('page', '1') ?? '1');
        $perPage = (int) ($request->getQueryString('per_page', '15') ?? '15');
        $result = $this->artistService->list($user, $page, $perPage);

        return Response::json($result);
    }

    public function create(Request $request): Response
    {
        $user = AuthHelper::requireUser($request);
        $body = $request->getJsonBody();
        $created = $this->artistService->create($user, $body);

        return Response::json(['artist' => $created], 201);
    }

    public function update(Request $request, int $id): Response
    {
        $user = AuthHelper::requireUser($request);
        $body = $request->getJsonBody();
        $updated = $this->artistService->update($user, $id, $body);

        return Response::json(['artist' => $updated]);
    }

    public function delete(Request $request, int $id): Response
    {
        $user = AuthHelper::requireUser($request);
        $this->artistService->delete($user, $id);

        return Response::empty(204);
    }
}
