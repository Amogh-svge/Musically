# RBAC Admin API (PHP)

---

## What you need installed

| Tool                                | Why                                                                  |
| ----------------------------------- | -------------------------------------------------------------------- |
| **PHP 8.1 or newer**                | Runs the API code. Check with `php -v`.                              |
| **Composer**                        | Installs PHP libraries (e.g. JWT, dotenv). Check with `composer -V`. |
| **MySQL 8** (or MariaDB compatible) | Stores users, artists, and songs.                                    |

---

## Concepts (30 seconds)

- **Document root:** The only folder the browser should talk to is `public/`. All requests go through `public/index.php` (or the dev router below).
- **Composer:** Reads `composer.json` and downloads packages into `vendor/`. Always run `composer install` after cloning.
- **Migrations:** PHP scripts that create or update database tables. Run them once after creating an empty database.

---

## Setup (step by step)

### 1. Go to the backend folder

```bash
cd backend
```

### 2. Copy the environment template

```bash
cp .env.example .env
```

Open `.env` in an editor. At minimum set:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — must match a database you create in MySQL.
- `JWT_SECRET` — use a long random string in production.
- `CORS_ORIGIN` — must include the **exact** URL of your React app (including port). Several values are allowed, comma-separated, for example:

  `CORS_ORIGIN=http://localhost:5173,http://localhost:5177`

### 3. Create an empty MySQL database

In MySQL (command line or GUI), create a database, e.g. `rbac_admin`, and a user that can access it. Put the same name and credentials in `.env`.

### 4. Install PHP dependencies

```bash
composer install
```

If `composer` is not found, install Composer from [getcomposer.org](https://getcomposer.org/) and try again.

### 5. Run database migrations

```bash
php bin/migrate.php
```

You should see something like `Ran 1 migration(s).`

To roll back the **last** migration:

```bash
php bin/migrate.php down
```

### 6. Create the first super admin account

Use the provided script (recommended). It hashes the password safely:

```bash
php bin/seed-super-admin.php
```

Arguments: `email`, `password`, optional display name. If you omit them, defaults from the script are used.

### 7. Start the API (development)

From the `backend` folder:

```bash
php -S localhost:8080 -t public public/router-dev.php
```

- **`-t public`** — only files under `public/` are served as static files.
- **`public/router-dev.php`** — sends all non-file requests to `index.php` (needed for clean URLs).

Leave this terminal open. The API base URL is:

`http://localhost:8080` + `API_PREFIX` from `.env` (default **`/api/v1`**)

Full example: `http://localhost:8080/api/v1/test`

## Roles and main endpoints (short)

| Role             | Typical use                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `super_admin`    | User management (`/users`), full read access.                                                           |
| `artist_manager` | Create/update/delete **artists**, CSV import/export, manage **songs** for any artist.                   |
| `artist`         | Register default; can list songs for a linked artist; song mutations if linked in JWT (future DB link). |

Song genres: `rnb`, `country`, `classic`, `rock`, `jazz`.

---

## Troubleshooting

| Problem                                                  | What to try                                                                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `composer: command not found`                            | Install Composer and ensure it is on your `PATH`.                                                                                                                                                 |
| `Access denied for user` (MySQL)                         | Fix `DB_USER` / `DB_PASSWORD` / `DB_NAME` in `.env`.                                                                                                                                              |
| `404 Not Found` on API routes                            | Use `public/router-dev.php` with `php -S` as shown, or configure rewrites on Apache/Nginx.                                                                                                        |
| Browser says **CORS** blocked on **422** or other errors | Previously error bodies skipped CORS headers; that is fixed. Ensure `APP_DEBUG=true` for dev (any localhost port) or list your exact Vite URL in `CORS_ORIGIN`. Restart PHP after editing `.env`. |
| `Address already in use` on port 8080                    | Pick another port: `php -S localhost:8081 -t public public/router-dev.php` and update the front-end `VITE_BACKEND_URL`.                                                                           |

---
