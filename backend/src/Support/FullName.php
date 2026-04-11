<?php

declare(strict_types=1);

namespace App\Support;

final class FullName
{
    /**
     * @return array{0: string, 1: string} [first_name, last_name]
     */
    public static function split(string $name): array
    {
        $name = trim($name);
        if ($name === '') {
            return ['User', 'User'];
        }
        $pos = strpos($name, ' ');
        if ($pos === false) {
            return [$name, $name];
        }
        $first = trim(substr($name, 0, $pos));
        $last = trim(substr($name, $pos + 1));
        if ($last === '') {
            $last = $first;
        }
        if ($first === '') {
            $first = $last;
        }

        return [$first, $last];
    }
}
