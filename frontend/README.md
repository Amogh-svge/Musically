# Sonic Curator — Frontend (React)

React 18 single-page app for the RBAC admin UI:
The API lives in **`../backend`**. This app only talks to it over HTTP (JSON + multipart for CSV upload).

---

## What you need

| Tool        | Version         | Check     |
| ----------- | --------------- | --------- |
| **Node.js** | 18+ recommended | `node -v` |
| **npm**     | Comes with Node | `npm -v`  |

---

## First-time setup

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Point the app at your API

Create `frontend/.env` (or copy from a teammate). Set the **full base URL** of the API **including** the prefix `/api/v1`:

```env
VITE_BACKEND_URL=http://localhost:8080/api/v1
```

Rules:

- If your PHP dev server uses another host/port, change this value to match.
- Vite only reads env variables that start with `VITE_`. After changing `.env`, restart `npm run dev`.

### 3. Match CORS on the backend

The browser will send requests **from** your Vite origin (e.g. `http://localhost:5173` or `http://localhost:5177`). The **backend** `.env` must list that exact origin in `CORS_ORIGIN` (comma-separated if you use several ports). See `../backend/README.md`.

### 4. Start the dev server

```bash
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`). If the port is busy, Vite may use **5174**, **5177**, etc.—update backend `CORS_ORIGIN` accordingly.

### 5. Log in

Use a user that exists in the database:

- Register at `/register` (creates an **artist** account), or
- Use a **super admin** / **artist manager** created via the backend seed script or `/users` API.

**Role hints for the UI:**

- **Artists** — list is visible to super admin and artist manager; **create/edit/delete and CSV** need **artist_manager** (CSV import/export too).
- **Users** — **super_admin** only.
- **Songs** — super admin and artist manager can add/delete songs for any artist (API behavior aligned with this UI).

---

## Scripts

| Command       | Purpose                       |
| ------------- | ----------------------------- |
| `npm run dev` | Hot-reload development server |

---

## Features (current)

- **React Hook Form** on login, register, and all admin modals (validation + less boilerplate).
- **Modals:** add/edit artist, import CSV (artists), add user, add song.
- **CSV:** export downloads `artists.csv`; import opens a modal with file picker (multipart `file` field). A sample file **`artists.csv`** is in the **repository root** (the folder above `frontend/`) so you can import it without creating your own CSV first.
- **TanStack Query** for caching and refetch after mutations.

---

## Troubleshooting

| Symptom                               | Likely fix                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **CORS** error in the browser console | Add your exact Vite URL (with port) to backend `CORS_ORIGIN`. Restart PHP.                                      |
| `Network Error` / ECONNREFUSED        | Backend not running, or `VITE_BACKEND_URL` wrong host/port.                                                     |
| 401 on every page after login         | Token missing; check localStorage key `sonic-curator-jwt`. Clear site data and log in again.                    |
| 403 on artist create or CSV           | Logged-in user is not **artist_manager** (or super admin where applicable). Create such a user via super admin. |
| Import succeeds but count is 0        | Check CSV header matches backend expectations (see backend README).                                             |

---

For API details, roles, curl examples, and PHP setup for beginners, read **`../backend/README.md`**.
