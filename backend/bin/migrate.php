<?php

declare(strict_types=1);

use App\Infrastructure\Database\ConnectionFactory;
use App\Infrastructure\Migration\MigrationRunner;
use App\Infrastructure\Migration\Migrations\InitialSchema;
use Dotenv\Dotenv;

$root = dirname(__DIR__);
require $root . '/vendor/autoload.php';

if (is_file($root . '/.env')) {
    Dotenv::createImmutable($root)->safeLoad();
}

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = (int) ($_ENV['DB_PORT'] ?? 3306);
$dbname = $_ENV['DB_NAME'] ?? 'rbac_admin';
$user = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

$pdo = ConnectionFactory::create($host, $port, $dbname, $user, $password);

$migrations = [
    new InitialSchema(),
];

$runner = new MigrationRunner($pdo, $migrations);
$action = $argv[1] ?? 'up';

if ($action === 'down') {
    $ok = $runner->rollbackLast();
    echo $ok ? "Rolled back last migration" : "Nothing to roll back";
    exit(0);
}

$n = $runner->migrate();
echo "Ran {$n} migration(s).\n";
