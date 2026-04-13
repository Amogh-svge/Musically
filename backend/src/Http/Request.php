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

    public function getQuery(): array
    {
        return $this->query;
    }

    public function getQueryString(string $key, ?string $default = null): ?string
    {
        $v = $this->query[$key] ?? null;

        return $v !== null ? (string) $v : $default;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function getHeader(string $name): ?string
    {
        foreach ($this->headers as $k => $v) {
            if (strcasecmp($k, $name) === 0) {
                return $v;
            }
        }

        return null;
    }

    public function getBody(): ?string
    {
        return $this->body;
    }

    public function getJsonBody(): array
    {
        if ($this->body === null || $this->body === '') {
            return [];
        }
        $data = json_decode($this->body, true);
        if (! is_array($data)) {
            return [];
        }

        return $data;
    }

    public function setAttribute(string $key, mixed $value): void
    {
        $this->attributes[$key] = $value;
    }

    public function getAttribute(string $key, mixed $default = null): mixed
    {
        return $this->attributes[$key] ?? $default;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public function getUploadedFile(string $key): ?array
    {
        if (! isset($_FILES[$key])) {
            return null;
        }
        $f = $_FILES[$key];
        if (! is_array($f) || ! isset($f['tmp_name'], $f['error'])) {
            return null;
        }
        if (! is_uploaded_file($f['tmp_name'])) {
            return null;
        }

        return [
            'name' => (string) ($f['name'] ?? ''),
            'type' => (string) ($f['type'] ?? ''),
            'tmp_name' => (string) $f['tmp_name'],
            'error' => (int) $f['error'],
            'size' => (int) ($f['size'] ?? 0),
        ];
    }
}
