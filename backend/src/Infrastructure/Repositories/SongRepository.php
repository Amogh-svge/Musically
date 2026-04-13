<?php

declare(strict_types=1);

namespace App\Infrastructure\Repositories;

use App\Infrastructure\Interface\BaseRespositoryInterface;
use PDO;

class SongRepository implements BaseRespositoryInterface
{
    public function __construct(private readonly PDO $pdo) {}

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, artist_id, title, album_name, genre, created_at, updated_at FROM music WHERE id = ?'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row !== false ? $row : null;
    }

    public function countByArtistId(int $artistId): int
    {
        $stmt = $this->pdo->prepare('SELECT COUNT(*) FROM music WHERE artist_id = ?');
        $stmt->execute([$artistId]);

        return (int) $stmt->fetchColumn();
    }

    public function paginateByArtist(int $artistId, int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->pdo->prepare(
            'SELECT id, artist_id, title, album_name, genre, created_at, updated_at
             FROM music WHERE artist_id = ? ORDER BY id ASC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $artistId, PDO::PARAM_INT);
        $stmt->bindValue(2, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(3, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO music (artist_id, title, album_name, genre) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['artist_id'],
            $data['title'],
            $data['album_name'],
            $data['genre'],
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $fields = [];
        $params = [];
        foreach (['title', 'album_name', 'genre'] as $key) {
            if (array_key_exists($key, $data)) {
                $fields[] = $key . ' = ?';
                $params[] = $data[$key];
            }
        }
        if ($fields === []) {
            return;
        }
        $params[] = $id;
        $sql = 'UPDATE music SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $this->pdo->prepare($sql)->execute($params);
    }

    public function delete(int $id): void
    {
        $this->pdo->prepare('DELETE FROM music WHERE id = ?')->execute([$id]);
    }
}
