<?php

declare(strict_types=1);

namespace App\Http;

use App\Domain\Exception\DomainException;
use App\Domain\Exception\ForbiddenException;
use App\Domain\Exception\NotFoundException;
use App\Domain\Exception\UnauthorizedException;
use App\Domain\Exception\ValidationException;
use Throwable;

final class ErrorHandler
{
    public static function toResponse(Throwable $e, bool $debug): Response
    {
        if ($e instanceof ValidationException) {
            return Response::json([
                'error' => $e->getMessage(),
                'errors' => $e->getErrors(),
            ], 422);
        }
        if ($e instanceof NotFoundException) {
            return Response::json(['error' => $e->getMessage()], 404);
        }
        if ($e instanceof ForbiddenException) {
            return Response::json(['error' => $e->getMessage()], 403);
        }
        if ($e instanceof UnauthorizedException) {
            return Response::json(['error' => $e->getMessage()], 401);
        }
        if ($e instanceof DomainException) {
            return Response::json(['error' => $e->getMessage()], 400);
        }
        $payload = ['error' => 'Internal server error'];
        if ($debug) {
            $payload['detail'] = $e->getMessage();
            $payload['trace'] = $e->getTraceAsString();
        }

        return Response::json($payload, 500);
    }
}
