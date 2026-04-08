<?php

declare(strict_types=1);

use App\Http\AuthHelper;
use App\Http\ErrorHandler;
use App\Http\Request;
use App\Http\Response;
use function App\Routes\dispatch_api;

$deps = require dirname(__DIR__) . '/bootstrap.php';
require_once dirname(__DIR__) . '/src/Routes/api.php';

$debug = filter_var($_ENV['APP_DEBUG'] ?? false, FILTER_VALIDATE_BOOLEAN);

$request = Request::fromGlobals();
