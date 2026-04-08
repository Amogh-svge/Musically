<?php

declare(strict_types=1);

namespace App\Http;

final class Request
{
    public function __construct(
        private readonly string $method,
        private readonly string $path,
        private readonly array $query,
        private readonly array $headers,
        private readonly ?string $body,
        private array $attributes = [],
    ) {}

    public static function fromGlobals(): self
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $query = $_GET;
        $headers = self::getAllHeaders();
        $body = file_get_contents('php://input') ?: null;

        return new self($method, $path, $query, $headers, $body);
    }

    private static function getAllHeaders(): array
    {
        $headers = [];
        foreach ($_SERVER as $key => $value) {
            if (str_starts_with($key, 'HTTP_')) {
                $name = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                $headers[$name] = (string) $value;
            }
        }
        if (isset($_SERVER['CONTENT_TYPE'])) {
            $headers['Content-Type'] = (string) $_SERVER['CONTENT_TYPE'];
        }
        if (isset($_SERVER['AUTHORIZATION'])) {
            $headers['Authorization'] = (string) $_SERVER['AUTHORIZATION'];
        }
        if (function_exists('getallheaders')) {
            foreach (getallheaders() ?: [] as $k => $v) {
                $headers[$k] = (string) $v;
            }
        }

        return $headers;
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }
}
