<?php

declare(strict_types=1);

namespace App\Domain\Exception;

final class ValidationException extends DomainException
{
    public function __construct(
        string $message = 'Validation failed',
        private readonly array $errors = [],
        int $code = 422,
    ) {
        parent::__construct($message, $code);
    }

    public function getErrors(): array
    {
        return $this->errors;
    }
}
