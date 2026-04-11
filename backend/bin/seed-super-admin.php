<?php

declare(strict_types=1);

use App\Domain\Role;
use App\Infrastructure\Database\ConnectionFactory;
use App\Infrastructure\Security\PasswordHasher;
use Dotenv\Dotenv;

$root = dirname(__DIR__);
require $root . '/vendor/autoload.php';

if (is_file($root . '/.env')) {
    Dotenv::createImmutable($root)->safeLoad();
}

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = (int) ($_ENV['DB_PORT'] ?? 3306);
$dbname = $_ENV['DB_NAME'] ?? 'rbac_admin';
$dbUser = $_ENV['DB_USER'] ?? 'root';
$dbPassword = $_ENV['DB_PASSWORD'] ?? '';

$first_name = 'Cloco';
$last_name = 'Nepal';
$email = isset($argv[1]) ? trim((string) $argv[1]) : 'admin@example.com';
$plain = isset($argv[2]) ? (string) $argv[2] : 'admin12345';
$name = isset($argv[3]) ? trim((string) $argv[3]) : 'Super Admin';
$phoneNumber = '+9779800000000';
$dob = '1990-01-01';
$gender = 'm';
$address = 'Kathmandu, Nepal';
$createdAt = date('Y-m-d H:i:s');
$updatedAt = date('Y-m-d H:i:s');

$pdo = ConnectionFactory::create($host, $port, $dbname, $dbUser, $dbPassword);

$check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->execute([$email]);
if ($check->fetch() !== false) {
    fwrite(STDERR, "User already exists: {$email}\n");
    exit(1);
}

$hash = (new PasswordHasher())->hash($plain);
$stmt = $pdo->prepare(
    'INSERT INTO users (first_name, last_name, email, password, role, phone_number, dob, gender, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$first_name, $last_name, $email, $hash, Role::SUPER_ADMIN, $phoneNumber, $dob, $gender, $address, $createdAt, $updatedAt]);

echo "Created super_admin user: {$email}\n";


/**
 * Create one super_admin user
 *
 * Usage:
 *   php bin/seed-super-admin.php
 */
