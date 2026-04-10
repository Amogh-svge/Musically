<?php

declare(strict_types=1);

use App\Application\Service\AuthService;
use App\Infrastructure\Database\ConnectionFactory;
use App\Infrastructure\Repositories\UserRepository;
use App\Infrastructure\Security\JwtService;
use App\Infrastructure\Security\PasswordHasher;
use Dotenv\Dotenv;

$root = __DIR__;
require $root . '/vendor/autoload.php';

if (is_file($root . '/.env')) {
    Dotenv::createImmutable($root)->safeLoad();
}

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = (int) ($_ENV['DB_PORT'] ?? 3306);
$dbname = $_ENV['DB_NAME'] ?? 'rbac_admin';
$dbUser = $_ENV['DB_USER'] ?? 'root';
$dbPassword = $_ENV['DB_PASSWORD'] ?? '';

// Create database connection
$pdo = ConnectionFactory::create($host, $port, $dbname, $dbUser, $dbPassword);

$userRepository = new UserRepository($pdo);

$passwordHasher = new PasswordHasher();
$jwtSecret = $_ENV['JWT_SECRET'] ?? 'change-me';
$jwtTtl = (int) ($_ENV['JWT_TTL'] ?? 86400);
$jwtService = new JwtService($jwtSecret, $jwtTtl);

$authService = new AuthService($userRepository, $passwordHasher, $jwtService);

$apiPrefix = $_ENV['API_PREFIX'] ?? '/api/v1';

return [
    'api_prefix' => $apiPrefix,
    'jwt' => $jwtService,
    'auth' => $authService,
];
