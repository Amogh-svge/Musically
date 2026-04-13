<?php

declare(strict_types=1);

namespace App\Http;

final class CorsMiddleware
{
    public function __construct(
        private readonly array $allowedOrigins,
        private readonly bool $allowLocalhostAnyPortInDebug = false,
    ) {}

    public function apply(Request $request, callable $next): Response
    {
        $allowOrigin = $this->matchRequestOrigin($request);
        if ($request->getMethod() === 'OPTIONS') {
            return new Response(204, '', $this->corsHeaders($allowOrigin));
        }
        $response = $next($request);

        return $this->withCorsHeaders($response, $allowOrigin);
    }

    /**
     * Attach CORS headers to a response (e.g. error responses built outside {@see apply}).
     */
    public function mergeIntoResponse(Request $request, Response $response): Response
    {
        $allowOrigin = $this->matchRequestOrigin($request);

        return $this->withCorsHeaders($response, $allowOrigin);
    }

    private function matchRequestOrigin(Request $request): ?string
    {
        $origin = $request->getHeader('Origin');
        if ($origin === null || $origin === '') {
            return null;
        }
        foreach ($this->allowedOrigins as $allowed) {
            $allowed = trim($allowed);
            if ($allowed !== '' && strcasecmp($allowed, $origin) === 0) {
                return $origin;
            }
        }
        if ($this->allowLocalhostAnyPortInDebug) {
            if (preg_match('#\Ahttps?://(localhost|127\.0\.0\.1)(:\d+)?\z#i', $origin) === 1) {
                return $origin;
            }
        }

        return null;
    }

    private function withCorsHeaders(Response $response, ?string $allowOrigin): Response
    {
        $extra = $this->corsHeaders($allowOrigin);
        if ($extra === []) {
            return $response;
        }
        $merged = array_merge($response->getHeaders(), $extra);

        return new Response($response->getStatusCode(), $response->getBody(), $merged);
    }

    private function corsHeaders(?string $allowOrigin): array
    {
        if ($allowOrigin === null || $allowOrigin === '') {
            return [];
        }

        return [
            'Access-Control-Allow-Origin' => $allowOrigin,
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization',
            'Access-Control-Max-Age' => '86400',
        ];
    }
}
