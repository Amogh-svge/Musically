<?php

declare(strict_types=1);

namespace App\Http;

final class Response
{
    public function __construct(
        private readonly int $statusCode,
        private readonly string $body,
        private readonly array $headers = [],
    ) {}

    public static function json(mixed $data, int $status = 200): self
    {
        $payload = json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);

        return new self($status, $payload, ['Content-Type' => 'application/json; charset=utf-8']);
    }

    public static function empty(int $status = 204): self
    {
        return new self($status, '');
    }

    public static function text(string $body, int $status = 200, array $headers = []): self
    {
        $h = array_merge(['Content-Type' => 'text/plain; charset=utf-8'], $headers);

        return new self($status, $body, $h);
    }

    public function getStatusCode(): int
    {
        return $this->statusCode;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }

    public function send(): void
    {
        http_response_code($this->statusCode);
        foreach ($this->headers as $name => $value) {
            header($name . ': ' . $value);
        }
        echo $this->body;
    }
}
