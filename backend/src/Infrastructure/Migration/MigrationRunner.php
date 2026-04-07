<?php

declare(strict_types=1);

namespace App\Infrastructure\Migration;

use PDO;

final class MigrationRunner
{
    public function __construct(
        private readonly PDO $pdo,
        private readonly array $migrations,
    ) {}

    public function migrate(): int
    {
        $count = 0;
        foreach ($this->migrations as $migration) {
            $migration->up($this->pdo);
            ++$count;
        }

        return $count;
    }

    public function rollbackLast(): int
    {
        $count = 0;
        foreach ($this->migrations as $migration) {
            $migration->down($this->pdo);
            ++$count;
        }

        return $count;
    }
}
