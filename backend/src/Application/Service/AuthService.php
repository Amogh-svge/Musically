<?php

declare(strict_types=1);

namespace App\Application\Service;

use App\Application\Auth\AuthUser;
use App\Domain\Exception\UnauthorizedException;
use App\Domain\Exception\ValidationException;
use App\Domain\Role;
use App\Infrastructure\Repositories\UserRepository;
use App\Support\FullName;
use App\Infrastructure\Security\JwtService;
use App\Infrastructure\Security\PasswordHasher;

final class AuthService
{
    public function __construct(
        private readonly UserRepository $users,
        private readonly PasswordHasher $passwordHasher,
        private readonly JwtService $jwt,
    ) {}

    public function register(string $name, string $email, string $password): array
    {
        $name = trim($name);
        $email = trim(strtolower($email));
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
        if ($errors !== []) {
            throw new ValidationException('Validation failed', $errors);
        }
        if ($this->users->findByEmail($email) !== null) {
            throw new ValidationException('Validation failed', ['email already registered']);
        }
        [$firstName, $lastName] = FullName::split($name);
        $id = $this->users->create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password_hash' => $this->passwordHasher->hash($password),
            'role' => Role::ARTIST,
            'phone_number' => '0000000000',
        ]);
        $row = $this->users->findById($id);
        if ($row === null) {
            throw new \RuntimeException('User not found after create');
        }

        return ['user' => $this->publicUser($row)];
    }

    public function login(string $email, string $password): array
    {
        $email = trim(strtolower($email));
        if ($email === '' || $password === '') {
            throw new ValidationException('Validation failed', ['email and password are required']);
        }
        $row = $this->users->findByEmail($email);
        if ($row === null || ! $this->passwordHasher->verify($password, (string) $row['password'])) {
            throw new UnauthorizedException('Invalid email or password');
        }
        $user = new AuthUser(
            (int) $row['id'],
            (string) $row['email'],
            (string) $row['role'],
            null
        );

        return [
            'token' => $this->jwt->createToken($user),
            'user' => $this->publicUser($row),
        ];
    }

    public function currentUser(AuthUser $auth): array
    {
        $row = $this->users->findById($auth->id);
        if ($row === null) {
            throw new UnauthorizedException('User not found');
        }

        return $this->publicUser($row);
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
