<?php

declare(strict_types=1);

namespace App\Infrastructure\Security;

use App\Application\Auth\AuthUser;
use DateTimeImmutable;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

final class JwtService
{
    public function __construct(
        private readonly string $secret,
        private readonly int $ttlSeconds,
    ) {
    }

    public function createToken(AuthUser $user): string
    {
        $now = new DateTimeImmutable();
        $payload = [
            'iss' => 'rbac-admin-api',
            'iat' => $now->getTimestamp(),
            'exp' => $now->getTimestamp() + $this->ttlSeconds,
            'sub' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'artist_id' => $user->artistId,
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    public function parseAuthUser(string $jwt): ?AuthUser
    {
        try {
            $decoded = JWT::decode($jwt, new Key($this->secret, 'HS256'));
            $data = (array) $decoded;
            $sub = isset($data['sub']) ? (int) $data['sub'] : 0;
            if ($sub <= 0) {
                return null;
            }
            $role = isset($data['role']) ? (string) $data['role'] : '';
            $email = isset($data['email']) ? (string) $data['email'] : '';
            $artistId = isset($data['artist_id']) ? (int) $data['artist_id'] : null;
            if ($artistId === 0) {
                $artistId = null;
            }

            return new AuthUser($sub, $email, $role, $artistId);
        } catch (\Throwable) {
            return null;
        }
    }
}
