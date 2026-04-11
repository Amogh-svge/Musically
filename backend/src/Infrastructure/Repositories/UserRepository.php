<?php

declare(strict_types=1);

namespace App\Infrastructure\Repositories;

use App\Infrastructure\Interface\BaseRespositoryInterface;

use PDO;

class UserRepository implements BaseRespositoryInterface
{
    public function __construct(private readonly PDO $pdo) {}

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, first_name, last_name, email, password, role, phone_number, dob, gender, address, created_at, updated_at FROM users WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row !== false ? $row : null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, first_name, last_name, email, password, role, phone_number, dob, gender, address, created_at, updated_at FROM users WHERE email = ? LIMIT 1'
        );
        $stmt->execute([$email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row !== false ? $row : null;
    }

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO users (first_name, last_name, email, password, role, phone_number, dob, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $data['first_name'],
            $data['last_name'],
            $data['email'],
            $data['password_hash'],
            $data['role'],
            $data['phone_number'],
            $data['dob'] ?? null,
            $data['gender'] ?? null,
            $data['address'] ?? null,
        ]);

        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $data): void
    {
        $allowedFields = [
            'first_name',
            'last_name',
            'email',
            'password_hash' => 'password',
            'role',
            'phone_number',
            'dob',
            'gender',
            'address'
        ];

        $fields = [];
        $params = [];

        foreach ($allowedFields as $key => $value) {
            $column = is_int($key) ? $value : $value;
            $dataKey = is_int($key) ? $value : $key;

            if (array_key_exists($dataKey, $data)) {
                $fields[] = "$column = ?";
                $params[] = $data[$dataKey];
            }
        }

        if (empty($fields)) return;

        $params[] = $id;

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $this->pdo->prepare($sql)->execute($params);
    }

    public function delete(int $id): void
    {
        $stmt = $this->pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
    }

    public function countAll(): int
    {
        return (int) $this->pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    }

    public function paginate(int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        $stmt = $this->pdo->prepare(
            'SELECT id, first_name, last_name, email, role, phone_number, dob, gender, address, created_at, updated_at FROM users ORDER BY id ASC LIMIT ? OFFSET ?'
        );
        $stmt->bindValue(1, $perPage, PDO::PARAM_INT);
        $stmt->bindValue(2, $offset, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
    }
}
