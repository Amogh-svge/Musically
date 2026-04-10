<?php

declare(strict_types=1);

namespace App\Application\Auth;

final class AuthUser
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly string $role,
        public readonly ?int $artistId,
    ) {
    }

    /** @return array<string, mixed> */
    public function toPublicArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'artist_id' => $this->artistId,
        ];
    }
}
