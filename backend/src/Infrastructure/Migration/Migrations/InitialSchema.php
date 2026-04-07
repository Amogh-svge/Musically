<?php

declare(strict_types=1);

namespace App\Infrastructure\Migration\Migrations;

use App\Infrastructure\Interface\MigrationInterface;
use PDO;

final class InitialSchema implements MigrationInterface
{
    public function name(): string
    {
        return 'initial_schema';
    }

    public function up(PDO $pdo): void
    {
        $pdo->exec(<<<'SQL'
            CREATE TABLE artists (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                dob DATETIME NULL,
                gender ENUM('m', 'f', 'o') NULL,
                address VARCHAR(255) NULL,
                first_release_year YEAR NULL,
                no_of_albums_released INT UNSIGNED NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL);

        $pdo->exec(<<<'SQL'
            CREATE TABLE users (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(500) NOT NULL,
                role ENUM('super_admin', 'artist_manager', 'artist') NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                dob DATETIME NULL,
                gender ENUM('m', 'f', 'o') NULL,
                address VARCHAR(255) NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY uq_users_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL);

        $pdo->exec(<<<'SQL'
            CREATE TABLE music (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                artist_id INT UNSIGNED NOT NULL,
                title VARCHAR(255) NOT NULL,
                album_name VARCHAR(255) NOT NULL,
                genre ENUM('rnb', 'country', 'classic', 'rock', 'jazz') NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_music_artist FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL);
    }

    public function down(PDO $pdo): void
    {
        $pdo->exec('DROP TABLE IF EXISTS music');
        $pdo->exec('DROP TABLE IF EXISTS users');
        $pdo->exec('DROP TABLE IF EXISTS artists');
    }
}
