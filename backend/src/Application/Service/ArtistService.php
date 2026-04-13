<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Application\Auth\AuthUser;
use App\Domain\Exception\ForbiddenException;
use App\Domain\Exception\NotFoundException;
use App\Domain\Exception\ValidationException;
use App\Domain\Role;
use App\Infrastructure\Repositories\ArtistRepository;
use PDO;

final class ArtistService
{
    private const MAX_PER_PAGE = 100;
    private const DEFAULT_PER_PAGE = 15;

    public function __construct(
        private readonly ArtistRepository $artists,
        private readonly PDO $pdo,
    ) {}

    private function canAccessTab(AuthUser $actor): void
    {
        if (! in_array($actor->role, [Role::SUPER_ADMIN, Role::ARTIST_MANAGER], true)) {
            throw new ForbiddenException(
                'The artist directory is only available to super administrators and artist managers.'
            );
        }
    }

    private function requireArtistManager(AuthUser $actor): void
    {
        if ($actor->role !== Role::ARTIST_MANAGER) {
            throw new ForbiddenException(
                'Only artist managers can create, update, or delete artists and use CSV import or export. Super administrators can view the list but cannot change catalog data here.'
            );
        }
    }

    public function list(AuthUser $actor, int $page, int $perPage): array
    {
        $this->canAccessTab($actor);
        $page = max(1, $page);
        $perPage = min(self::MAX_PER_PAGE, max(1, $perPage ?: self::DEFAULT_PER_PAGE));
        $total = $this->artists->count();
        $rows = $this->artists->paginate($page, $perPage);
        $data = array_map(fn(array $r) => $this->publicArtist($r), $rows);
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

    public function create(AuthUser $actor, array $payload): array
    {
        $this->requireArtistManager($actor);
        $row = $this->normalizePayload($payload, true);
        $id = $this->artists->create($row);
        $created = $this->artists->findById($id);
        if ($created === null) {
            throw new \RuntimeException('Artist not found after create');
        }

        return $this->publicArtist($created);
    }

    public function update(AuthUser $actor, int $id, array $payload): array
    {
        $this->requireArtistManager($actor);
        $existing = $this->artists->findById($id);
        if ($existing === null) {
            throw new NotFoundException('Artist not found');
        }
        $data = $this->normalizePayload($payload, false);
        if ($data !== []) {
            $this->artists->update($id, $data);
        }
        $updated = $this->artists->findById($id);
        if ($updated === null) {
            throw new NotFoundException('Artist not found');
        }

        return $this->publicArtist($updated);
    }

    public function delete(AuthUser $actor, int $id): void
    {
        $this->requireArtistManager($actor);
        $existing = $this->artists->findById($id);
        if ($existing === null) {
            throw new NotFoundException('Artist not found');
        }
        $this->artists->delete($id);
    }

    public function exportCsv(AuthUser $actor): string
    {
        $this->requireArtistManager($actor);
        $rows = $this->artists->findAllForExport();
        $fh = fopen('php://temp', 'r+');
        if ($fh === false) {
            throw new \RuntimeException('Could not open temp stream');
        }
        fputcsv($fh, ['id', 'name', 'dob', 'gender', 'address', 'first_release_year', 'no_of_albums_released', 'created_at', 'updated_at']);
        foreach ($rows as $r) {
            fputcsv($fh, [
                $r['id'],
                $r['name'],
                $r['dob'],
                $r['gender'],
                $r['address'],
                $r['first_release_year'],
                $r['no_of_albums_released'],
                $r['created_at'],
                $r['updated_at'],
            ]);
        }
        rewind($fh);
        $csv = stream_get_contents($fh);
        fclose($fh);

        return $csv !== false ? $csv : '';
    }

    public function importCsv(AuthUser $actor, string $csvContent): array
    {
        $this->requireArtistManager($actor);
        $lines = preg_split('/\r\n|\r|\n/', trim($csvContent)) ?: [];
        if ($lines === []) {
            throw new ValidationException('Validation failed', ['empty file']);
        }
        $header = str_getcsv(array_shift($lines));
        $expected = ['name', 'dob', 'gender', 'address', 'first_release_year', 'no_of_albums_released'];
        $map = [];
        foreach ($expected as $col) {
            $idx = array_search($col, $header, true);
            if ($idx === false) {
                throw new ValidationException('Validation failed', ['missing column: ' . $col]);
            }
            $map[$col] = (int) $idx;
        }
        $batch = [];
        $errors = [];
        $lineNo = 1;
        foreach ($lines as $line) {
            ++$lineNo;
            if (trim($line) === '') {
                continue;
            }
            $cols = str_getcsv($line);
            try {
                $batch[] = $this->rowToInsert($cols, $map);
            } catch (\Throwable $e) {
                $errors[] = "Line {$lineNo}: " . $e->getMessage();
            }
        }
        if ($batch === []) {
            return ['imported' => 0, 'errors' => $errors];
        }
        $this->pdo->beginTransaction();
        try {
            $this->artists->bulkInsert($batch);
            $this->pdo->commit();
        } catch (\Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }

        return ['imported' => count($batch), 'errors' => $errors];
    }

    private function rowToInsert(array $cols, array $map): array
    {
        $name = trim((string) ($cols[$map['name']] ?? ''));
        if ($name === '') {
            throw new \InvalidArgumentException('name required');
        }
        $dobRaw = trim((string) ($cols[$map['dob']] ?? ''));
        $dob = $dobRaw === '' ? null : $this->parseDateTime($dobRaw);
        $genderRaw = trim((string) ($cols[$map['gender']] ?? ''));
        $gender = $genderRaw === '' ? null : $this->validateGender($genderRaw);
        $address = trim((string) ($cols[$map['address']] ?? ''));
        $address = $address === '' ? null : $address;
        $yearRaw = trim((string) ($cols[$map['first_release_year']] ?? ''));
        $year = $yearRaw === '' ? null : (int) $yearRaw;
        $albums = (int) ($cols[$map['no_of_albums_released']] ?? 0);

        return [
            'name' => $name,
            'dob' => $dob,
            'gender' => $gender,
            'address' => $address,
            'first_release_year' => $year,
            'no_of_albums_released' => max(0, $albums),
        ];
    }

    private function parseDateTime(string $s): ?string
    {
        $dt = date_create($s);
        if ($dt === false) {
            throw new \InvalidArgumentException('invalid dob');
        }

        return $dt->format('Y-m-d H:i:s');
    }

    private function validateGender(string $g): ?string
    {
        $g = strtolower($g);
        if (! in_array($g, ['m', 'f', 'o'], true)) {
            throw new \InvalidArgumentException('invalid gender');
        }

        return $g;
    }

    private function normalizePayload(array $payload, bool $isCreate): array
    {
        $out = [];
        if ($isCreate || array_key_exists('name', $payload)) {
            $name = trim((string) ($payload['name'] ?? ''));
            if ($name === '') {
                throw new ValidationException('Validation failed', ['name is required']);
            }
            $out['name'] = $name;
        }
        if (array_key_exists('dob', $payload)) {
            $v = $payload['dob'];
            $out['dob'] = $v === null || $v === '' ? null : $this->parseDateTime((string) $v);
        }
        if (array_key_exists('gender', $payload)) {
            $v = $payload['gender'];
            $out['gender'] = $v === null || $v === '' ? null : $this->validateGender((string) $v);
        }
        if (array_key_exists('address', $payload)) {
            $v = $payload['address'];
            $out['address'] = $v === null || $v === '' ? null : (string) $v;
        }
        if (array_key_exists('first_release_year', $payload)) {
            $v = $payload['first_release_year'];
            $out['first_release_year'] = $v === null || $v === '' ? null : (int) $v;
        }
        if (array_key_exists('no_of_albums_released', $payload)) {
            $out['no_of_albums_released'] = max(0, (int) ($payload['no_of_albums_released'] ?? 0));
        }
        if ($isCreate) {
            if (! isset($out['no_of_albums_released'])) {
                $out['no_of_albums_released'] = 0;
            }
        }

        return $out;
    }

    private function publicArtist(array $r): array
    {
        return [
            'id' => (int) $r['id'],
            'name' => (string) $r['name'],
            'dob' => $r['dob'],
            'gender' => $r['gender'],
            'address' => $r['address'],
            'first_release_year' => $r['first_release_year'],
            'no_of_albums_released' => (int) $r['no_of_albums_released'],
            'created_at' => (string) $r['created_at'],
            'updated_at' => (string) $r['updated_at'],
        ];
    }
}
