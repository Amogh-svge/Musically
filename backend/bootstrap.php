<?php

declare(strict_types=1);

use App\Infrastructure\Database\ConnectionFactory;
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
