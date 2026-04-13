<?php

declare(strict_types=1);

use App\Application\Service\ArtistService;
use App\Application\Service\AuthService;
use App\Application\Service\SongService;
use App\Application\Service\UserService;
use App\Http\CorsMiddleware;
use App\Infrastructure\Database\ConnectionFactory;
use App\Infrastructure\Repositories\UserRepository;
use App\Infrastructure\Repositories\ArtistRepository;
use App\Infrastructure\Repositories\SongRepository;
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
$artistRepository = new ArtistRepository($pdo);
$songRepository = new SongRepository($pdo);

$passwordHasher = new PasswordHasher();
$jwtSecret = $_ENV['JWT_SECRET'] ?? 'change-me';
$jwtTtl = (int) ($_ENV['JWT_TTL'] ?? 86400);
$jwtService = new JwtService($jwtSecret, $jwtTtl);

$authService = new AuthService($userRepository, $passwordHasher, $jwtService);
$userService = new UserService($userRepository, $passwordHasher);
$artistService = new ArtistService($artistRepository, $pdo);
$songService = new SongService($songRepository, $artistRepository);

$corsRaw = $_ENV['CORS_ORIGIN'] ?? 'http://localhost:5173,http://localhost:5177';
$corsAllowed = array_values(array_filter(array_map('trim', explode(',', $corsRaw))));
if ($corsAllowed === []) {
    $corsAllowed = ['http://localhost:5173', 'http://localhost:5177'];
}
$corsDebug = filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN);
$cors = new CorsMiddleware($corsAllowed, $corsDebug);


$apiPrefix = $_ENV['API_PREFIX'] ?? '/api/v1';

return [
    'api_prefix' => $apiPrefix,
    'cors' => $cors,
    'jwt' => $jwtService,
    'auth' => $authService,
    'users' => $userService,
    'artists' => $artistService,
    'songs' => $songService,
];
