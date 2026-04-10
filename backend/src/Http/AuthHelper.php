<?php

declare(strict_types=1);

namespace App\Http;

use App\Application\Auth\AuthUser;
use App\Domain\Exception\UnauthorizedException;
use App\Infrastructure\Security\JwtService;

final class AuthHelper
{
    public static function attachJwtFromBearer(Request $request, JwtService $jwt): void
    {
        $auth = $request->getHeader('Authorization');
        if ($auth === null || ! preg_match('/Bearer\s+(\S+)/i', $auth, $m)) {
            return;
        }
        $user = $jwt->parseAuthUser(trim($m[1]));
        if ($user !== null) {
            $request->setAttribute('auth_user', $user);
        }
    }

    public static function requireUser(Request $request): AuthUser
    {
        $user = $request->getAttribute('auth_user');
        if (! $user instanceof AuthUser) {
            throw new UnauthorizedException('Unauthorized');
        }

        return $user;
    }
}
