<?php

declare(strict_types=1);

namespace App\Domain;

final class Role
{
    public const SUPER_ADMIN = 'super_admin';
    public const ARTIST_MANAGER = 'artist_manager';
    public const ARTIST = 'artist';

    public static function all(): array
    {
        return [self::SUPER_ADMIN, self::ARTIST_MANAGER, self::ARTIST];
    }

    public static function isValid(string $role): bool
    {
        return in_array($role, self::all(), true);
    }
}
