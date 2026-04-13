<?php

declare(strict_types=1);

namespace App\Infrastructure\Repositories;

use App\Infrastructure\Interface\BaseRespositoryInterface;

use PDO;

class ArtistRepository implements BaseRespositoryInterface
{
    public function __construct(private readonly PDO $pdo) {}

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at FROM artists WHERE id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row !== false ? $row : null;
    }

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['name'],
            $data['dob'],
            $data['gender'],
            $data['address'],
            $data['first_release_year'],
            $data['no_of_albums_released'],
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $fields = [];
        $params = [];
        foreach (['name', 'dob', 'gender', 'address', 'first_release_year', 'no_of_albums_released'] as $key) {
            if (array_key_exists($key, $data)) {
                $fields[] = $key . ' = ?';
                $params[] = $data[$key];
            }
        }
        if ($fields === []) {
            return;
        }
        $params[] = $id;
        $sql = 'UPDATE artists SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $this->pdo->prepare($sql)->execute($params);
    }

    public function delete(int $id): void
    {
        $this->pdo->prepare('DELETE FROM artists WHERE id = ?')->execute([$id]);
    }

    public function count(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM artists')->fetchColumn();
    }

    public function paginate(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->pdo->prepare(
            'SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at
             FROM artists ORDER BY id ASC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function findAllForExport(): array
    {
        $stmt = $this->pdo->query(
            'SELECT id, name, dob, gender, address, first_release_year, no_of_albums_released, created_at, updated_at FROM artists ORDER BY id ASC'
        );

        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function bulkInsert(array $rows): void
    {
        if ($rows === []) {
            return;
        }
        $stmt = $this->pdo->prepare(
            'INSERT INTO artists (name, dob, gender, address, first_release_year, no_of_albums_released)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        foreach ($rows as $row) {
            $stmt->execute([
                $row['name'],
                $row['dob'],
                $row['gender'],
                $row['address'],
                $row['first_release_year'],
                $row['no_of_albums_released'],
            ]);
        }
    }
}
