<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Application\Auth\AuthUser;
use App\Domain\Exception\ForbiddenException;
use App\Domain\Exception\NotFoundException;
use App\Domain\Exception\ValidationException;
use App\Domain\Role;
use App\Infrastructure\Repositories\ArtistRepository;
use App\Infrastructure\Repositories\SongRepository;

final class SongService
{
    private const GENRES = ['rnb', 'country', 'classic', 'rock', 'jazz'];
    private const MAX_PER_PAGE = 100;
    private const DEFAULT_PER_PAGE = 15;

    public function __construct(
        private readonly SongRepository $songs,
        private readonly ArtistRepository $artists,
    ) {}

    private function canView(AuthUser $actor): void
    {
        if (!in_array($actor->role, [Role::SUPER_ADMIN, Role::ARTIST_MANAGER, Role::ARTIST], true)) {
            throw new ForbiddenException(
                'Your account cannot access song data. Sign in as an artist, artist manager, or super administrator.'
            );
        }
    }

    private function requireArtistForMutation(AuthUser $actor, int $routeArtistId): void
    {
        if (
            $actor->role !== Role::ARTIST
            || $actor->artistId === null
            || $actor->artistId !== $routeArtistId
        ) {
            throw new ForbiddenException(
                'You can only manage songs for your own linked artist. Artist managers and super administrators can manage songs for any artist.'
            );
        }
    }

    private function requireSongEditor(AuthUser $actor, int $routeArtistId): void
    {
        if (in_array($actor->role, [Role::SUPER_ADMIN, Role::ARTIST_MANAGER], true)) {
            return;
        }
        $this->requireArtistForMutation($actor, $routeArtistId);
    }

    public function listByArtist(AuthUser $actor, int $artistId, int $page, int $perPage): array
    {
        $this->canView($actor);
        if ($actor->role === Role::ARTIST) {
            if ($actor->artistId === null || $actor->artistId !== $artistId) {
                throw new ForbiddenException(
                    'You can only view songs for the artist profile linked to your account.'
                );
            }
        }
        $artist = $this->artists->findById($artistId);
        if ($artist === null) {
            throw new NotFoundException('Artist not found');
        }
        $page = max(1, $page);
        $perPage = min(self::MAX_PER_PAGE, max(1, $perPage ?: self::DEFAULT_PER_PAGE));
        $total = $this->songs->countByArtistId($artistId);
        $rows = $this->songs->paginateByArtist($artistId, $page, $perPage);
        $data = array_map(fn(array $r) => $this->publicSong($r), $rows);
        $pages = (int) ceil($total / $perPage);

        return [
            'data' => $data,
            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'pages' => $pages,
            ],
        ];
    }

    public function create(AuthUser $actor, int $artistId, array $payload): array
    {
        $this->requireSongEditor($actor, $artistId);
        $artist = $this->artists->findById($artistId);
        if ($artist === null) {
            throw new NotFoundException('Artist not found');
        }
        $title = trim((string) ($payload['title'] ?? ''));
        $album = trim((string) ($payload['album_name'] ?? ''));
        $genre = strtolower(trim((string) ($payload['genre'] ?? '')));
        $errors = [];
        if ($title === '') {
            $errors[] = 'title is required';
        }
        if ($album === '') {
            $errors[] = 'album_name is required';
        }
        if (! in_array($genre, self::GENRES, true)) {
            $errors[] = 'invalid genre';
        }
        if ($errors !== []) {
            throw new ValidationException('Validation failed', $errors);
        }
        $id = $this->songs->create([
            'artist_id' => $artistId,
            'title' => $title,
            'album_name' => $album,
            'genre' => $genre,
        ]);
        $row = $this->songs->findById($id);
        if ($row === null) {
            throw new \RuntimeException('Song not found after create');
        }

        return $this->publicSong($row);
    }

    public function update(AuthUser $actor, int $artistId, int $songId, array $payload): array
    {
        $this->requireSongEditor($actor, $artistId);
        $row = $this->songs->findById($songId);
        if ($row === null || (int) $row['artist_id'] !== $artistId) {
            throw new NotFoundException('Song not found');
        }
        $data = [];
        if (isset($payload['title'])) {
            $t = trim((string) $payload['title']);
            if ($t === '') {
                throw new ValidationException('Validation failed', ['title cannot be empty']);
            }
            $data['title'] = $t;
        }
        if (isset($payload['album_name'])) {
            $a = trim((string) $payload['album_name']);
            if ($a === '') {
                throw new ValidationException('Validation failed', ['album_name cannot be empty']);
            }
            $data['album_name'] = $a;
        }
        if (isset($payload['genre'])) {
            $g = strtolower(trim((string) $payload['genre']));
            if (! in_array($g, self::GENRES, true)) {
                throw new ValidationException('Validation failed', ['invalid genre']);
            }
            $data['genre'] = $g;
        }
        if ($data !== []) {
            $this->songs->update($songId, $data);
        }
        $updated = $this->songs->findById($songId);
        if ($updated === null) {
            throw new NotFoundException('Song not found');
        }

        return $this->publicSong($updated);
    }

    public function delete(AuthUser $actor, int $artistId, int $songId): void
    {
        $this->requireSongEditor($actor, $artistId);
        $row = $this->songs->findById($songId);
        if ($row === null || (int) $row['artist_id'] !== $artistId) {
            throw new NotFoundException('Song not found');
        }
        $this->songs->delete($songId);
    }

    /** @param array<string, mixed> $r */
    private function publicSong(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'artist_id' => (int) $r['artist_id'],
            'title' => (string) $r['title'],
            'album_name' => (string) $r['album_name'],
            'genre' => (string) $r['genre'],
            'created_at' => (string) $r['created_at'],
            'updated_at' => (string) $r['updated_at'],
        ];
    }
}
