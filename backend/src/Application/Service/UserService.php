<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Application\Auth\AuthUser;
use App\Domain\Exception\ForbiddenException;
use App\Domain\Exception\NotFoundException;
use App\Domain\Exception\ValidationException;
use App\Domain\Role;
use App\Infrastructure\Repositories\UserRepository;
use App\Support\FullName;
use App\Infrastructure\Security\PasswordHasher;

final class UserService
{
    private const MAX_PER_PAGE = 100;
    private const DEFAULT_PER_PAGE = 15;

    public function __construct(
        private readonly UserRepository $users,
        private readonly PasswordHasher $passwordHasher,
    ) {}

    private function requireSuperAdmin(AuthUser $actor): void
    {
        if ($actor->role !== Role::SUPER_ADMIN) {
            throw new ForbiddenException(
                'This action is only available to super administrators. Your account does not have permission to manage users.'
            );
        }
    }

    public function list(AuthUser $actor, int $page, int $perPage): array
    {
        $this->requireSuperAdmin($actor);
        $page = max(1, $page);
        $perPage = min(self::MAX_PER_PAGE, max(1, $perPage ?: self::DEFAULT_PER_PAGE));
        $total = $this->users->countAll();
        $rows = $this->users->paginate($page, $perPage);
        $data = array_map(fn(array $r) => $this->publicUser($r), $rows);
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
        $this->requireSuperAdmin($actor);
        $name = trim((string) ($payload['name'] ?? ''));
        $email = trim(strtolower((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $role = (string) ($payload['role'] ?? '');
        $errors = [];
        if ($name === '') {
            $errors[] = 'name is required';
        }
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'valid email is required';
        }
        if (strlen($password) < 8) {
            $errors[] = 'password must be at least 8 characters';
        }
        if (! Role::isValid($role)) {
            $errors[] = 'invalid role';
        }
        if ($errors !== []) {
            throw new ValidationException('Validation failed', $errors);
        }
        if ($this->users->findByEmail($email) !== null) {
            throw new ValidationException('Validation failed', ['email already taken']);
        }
        [$firstName, $lastName] = FullName::split($name);
        $phone = trim((string) ($payload['phone_number'] ?? ''));
        if ($phone === '') {
            $phone = '0000000000';
        }
        $id = $this->users->create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password_hash' => $this->passwordHasher->hash($password),
            'role' => $role,
            'phone_number' => $phone,
            'dob' => $payload['dob'] ?? null,
            'gender' => $payload['gender'] ?? null,
            'address' => $payload['address'] ?? null,
        ]);
        $row = $this->users->findById($id);
        if ($row === null) {
            throw new \RuntimeException('User not found after create');
        }

        return $this->publicUser($row);
    }

    public function update(AuthUser $actor, int $id, array $payload): array
    {
        $this->requireSuperAdmin($actor);
        $row = $this->users->findById($id);
        if ($row === null) {
            throw new NotFoundException('User not found');
        }
        $data = [];
        if (isset($payload['name'])) {
            [$fn, $ln] = FullName::split(trim((string) $payload['name']));
            $data['first_name'] = $fn;
            $data['last_name'] = $ln;
        }

        foreach (['phone_number', 'dob', 'gender', 'address'] as $field) {
            if (array_key_exists($field, $payload)) {
                $data[$field] = is_string($payload[$field])
                    ? trim($payload[$field])
                    : $payload[$field];
            }
        }

        if (isset($payload['email'])) {
            $email = trim(strtolower((string) $payload['email']));
            if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new ValidationException('Validation failed', ['valid email is required']);
            }
            $other = $this->users->findByEmail($email);
            if ($other !== null && (int) $other['id'] !== $id) {
                throw new ValidationException('Validation failed', ['email already taken']);
            }
            $data['email'] = $email;
        }
        if (isset($payload['password']) && (string) $payload['password'] !== '') {
            if (strlen((string) $payload['password']) < 8) {
                throw new ValidationException('Validation failed', ['password must be at least 8 characters']);
            }
            $data['password_hash'] = $this->passwordHasher->hash((string) $payload['password']);
        }
        if (isset($payload['role'])) {
            $role = (string) $payload['role'];
            if (! Role::isValid($role)) {
                throw new ValidationException('Validation failed', ['invalid role']);
            }
            $data['role'] = $role;
        }
        if ($data !== []) {
            $this->users->update($id, $data);
        }
        $updated = $this->users->findById($id);
        if ($updated === null) {
            throw new NotFoundException('User not found');
        }

        return $this->publicUser($updated);
    }

    public function delete(AuthUser $actor, int $id): void
    {
        $this->requireSuperAdmin($actor);
        if ($actor->id === $id) {
            throw new ValidationException('Validation failed', ['cannot delete own account']);
        }
        $row = $this->users->findById($id);
        if ($row === null) {
            throw new NotFoundException('User not found');
        }
        $this->users->delete($id);
    }

    private function publicUser(array $row): array
    {
        $display = trim((string) ($row['first_name'] ?? '') . ' ' . (string) ($row['last_name'] ?? ''));

        return [
            'id' => (int) $row['id'],
            'name' => $display !== '' ? $display : (string) ($row['email'] ?? ''),
            'email' => (string) $row['email'],
            'role' => (string) $row['role'],
            'artist_id' => null,
            'created_at' => (string) $row['created_at'],
            'updated_at' => (string) $row['updated_at'],
        ];
    }
}
