<?php

declare(strict_types=1);

namespace App\Http;

final class CorsMiddleware
{
    public function __construct(private readonly string $allowOrigin) {}

    public function apply(Request $request, callable $next): Response
    {
        if ($request->getMethod() === 'OPTIONS') {
            return $this->preflight();
        }
        $response = $next($request);

        return $this->withCorsHeaders($response);
    }

    private function preflight(): Response
    {
        $headers = $this->corsHeaders();

        return new Response(204, '', $headers);
    }

    private function withCorsHeaders(Response $response): Response
    {
        $merged = array_merge($response->getHeaders(), $this->corsHeaders());

        return new Response($response->getStatusCode(), $response->getBody(), $merged);
    }

    private function corsHeaders(): array
    {
        return [
            'Access-Control-Allow-Origin' => $this->allowOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
            'Access-Control-Max-Age' => '86400',
        ];
    }
}
