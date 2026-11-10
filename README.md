<div align="center">

# SypharConnect

**A modern job-hunt platform that connects job seekers and recruiters.**

Find jobs, apply in a click, track every application, post openings and review applicants, all in one place.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)

![SypharConnect home page](assets/home.png)

</div>

---

## Table of contents

- [About the project](#about-the-project)
- [Features](#features)
- [Tech stack](#tech-stack)
- [How it fits together](#how-it-fits-together)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Available scripts](#available-scripts)
- [Application routes](#application-routes)
- [API overview](#api-overview)
- [Database](#database)
- [File uploads](#file-uploads)
- [Security notes](#security-notes)
- [Testing](#testing)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Author](#author)

## About the project

SypharConnect is a full-stack job portal with two kinds of accounts:

- **Job seekers (students)** search and filter jobs, save the ones they like, apply with their resume and follow the status of each application.
- **Recruiters** register their companies, publish job postings with a rich-text description, and review, accept or reject applicants from a dashboard.

The front end is a React single-page app. The back end is a **Python FastAPI** service backed by **PostgreSQL**. The app has a cinematic first-visit onboarding, light and dark themes, and a responsive layout that works from phones to wide desktops.

## Features

### For job seekers

- **Onboarding** shown once per device: three full-screen steps (Discover, Apply and track, Hire) with floating job cards, a live product preview and smooth cross-fades. It never scrolls and fits any window size, in light and dark.
- **Job listings** with multi-select filters: location, job type, role and salary range.
- **Search page** to find jobs by role, one or more cities (type your own too) and years of experience.
- **Job page with company details:** the hiring company's logo, name, location and description, plus a clickable website link that opens in a new tab.
- **Save for later** bookmarks, listed on the profile page.
- **One-click apply.** If no resume is on file, the app asks for one first, then applies.
- **Applied Jobs page** with a status summary (pending, accepted, rejected) and a table of applications.
- **Profile** with a cover banner, photo, bio, skills and resume; photos go through a LinkedIn-style **crop editor** (zoom and straighten).

### For recruiters

- **Company management:** register a company, upload a logo, edit its details.
- **Post a job** with a rich-text editor (headings, bold, lists, quotes), a job-type dropdown, experience, salary in LPA, positions and requirements as tags.
- **Applicants dashboard:** per-job applicant counts, a navbar badge with the number still waiting for a decision, and a side panel with each applicant's contact details, bio, skills and resume.
- **Accept or reject** applicants; the badge and status update immediately.

### Across the app

- Light and dark themes with a toggle.
- JWT authentication in an HTTP-only cookie, with automatic sign-out when a session expires.
- Role-aware navigation, logo and footer.
- Sanitised rich text, ownership checks on the server, and file-type and size limits on uploads.
- Clear JSON errors from the API and a health endpoint that reports the database state.

## Tech stack

### Front end (`/client`)

| Area | Technology |
| --- | --- |
| Framework | React 19, TypeScript, Vite 7 |
| Styling | Tailwind CSS 4, shadcn/ui (Radix UI), Tailwind Typography, `tw-animate-css` |
| State | Redux Toolkit, redux-persist |
| Routing | React Router 7 |
| Data and tables | Axios, TanStack Table |
| Rich text | Tiptap 3, DOMPurify |
| Images | react-easy-crop |
| Animation | Motion (Framer Motion) for transitions, CSS animations for the onboarding scene |
| UI extras | lucide-react (icons), Sonner (toasts), Embla Carousel |
| Tooling | ESLint 9 with typescript-eslint |

### Back end (`/backend-fastapi`)

| Area | Technology |
| --- | --- |
| Language and framework | Python 3.11+ (developed on 3.12), **FastAPI**, served by **Uvicorn** |
| Database | **PostgreSQL** (developed and tested on 16) |
| ORM and driver | SQLAlchemy 2 (async) with asyncpg |
| Migrations | Alembic |
| Validation and settings | Pydantic 2, pydantic-settings |
| Authentication | JWT in an HTTP-only cookie (PyJWT), passwords hashed with bcrypt |
| Uploads | python-multipart, files stored on disk and served from `/uploads` |
| HTML sanitising | nh3 (allow-list for job descriptions) |
| Testing | pytest, httpx (end-to-end tests against a real PostgreSQL) |

### Infrastructure

| Area | Technology |
| --- | --- |
| Web server | Nginx: serves the built client and proxies `/api` and `/uploads` |
| Process manager | systemd (or PM2) running Uvicorn |
| HTTPS | Let's Encrypt (Certbot) |
| Local database | Docker (`postgres:16`) or a local PostgreSQL install |

## How it fits together

```
Browser ──HTTPS──▶ Nginx ──┬──▶ client/dist           (static React app)
                           ├──▶ /api      ──▶ Uvicorn + FastAPI ──▶ PostgreSQL
                           └──▶ /uploads  ──▶ files on disk (photos, logos, resumes)
```

In production the app and the API share one domain, so cookies stay simple and no CORS is needed. In development the client (`localhost:5173`) talks to the API (`localhost:8080`) directly.

## Project structure

```
syphar-connect/
├── assets/                     # images used in this README
├── backend-fastapi/
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, /uploads, /api/health
│   │   ├── config.py           # settings from environment variables
│   │   ├── db.py               # async engine, sessions, connection watcher
│   │   ├── models.py           # SQLAlchemy models (users, companies, jobs, ...)
│   │   ├── security.py         # JWT cookie, bcrypt, auth dependency
│   │   ├── serializers.py      # database rows -> the JSON the client expects
│   │   ├── uploads.py          # upload validation and storage
│   │   ├── sanitize.py         # rich-text sanitising
│   │   ├── errors.py           # JSON error handlers
│   │   └── routers/            # users, companies, jobs, applications
│   ├── migrations/             # Alembic migrations
│   ├── tests/                  # end-to-end API tests
│   ├── requirements.txt
│   └── .env.sample             # environment variable template
├── client/
│   └── src/
│       ├── admin/              # recruiter screens (companies, jobs, applicants)
│       ├── auth/               # login and signup
│       ├── components/         # navbar, footer, shared UI
│       ├── hooks/              # data-fetching and behaviour hooks
│       ├── pages/              # home, jobs, search, profile, onboarding, legal, ...
│       ├── redux/              # store, slices and types
│       ├── routes/             # route guards
│       ├── shared/             # reusable pieces (editor, crop dialog, ...)
│       └── utils/              # constants, helpers (safe links, filters, ...)
└── uploads/                    # created at runtime, git-ignored
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 or newer, and npm
- [Python](https://www.python.org/) 3.11 or newer
- [PostgreSQL](https://www.postgresql.org/): a local install, or Docker

### 1. Clone

```bash
git clone git@github.com:xshshahab/syphar-connect.git
cd syphar-connect
```

Dependencies (`node_modules`, the Python virtual environment) are **not** in the repository; you install them below.

### 2. Start a database

Quickest with Docker:

```bash
docker run -d --name syphar-pg \
  -e POSTGRES_USER=syphar -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=syphar_connect \
  -p 5432:5432 -v syphar-pg-data:/var/lib/postgresql/data postgres:16-alpine
```

Or create a database and user in your own PostgreSQL. If port 5432 is taken, publish another one (for example `-p 5433:5432`) and use it in the URL below.

### 3. Set up the back end

```bash
cd backend-fastapi
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.sample .env                # then edit DATABASE_URL and SECRET_KEY
alembic upgrade head               # creates the tables
uvicorn app.main:app --reload --port 8080
```

The `.env` file is git-ignored and must never be committed. See [Environment variables](#environment-variables).

- API: <http://localhost:8080>
- Interactive docs (Swagger): <http://localhost:8080/api/docs>
- Health check: <http://localhost:8080/api/health> returns `{"api":"ok","db":"connected"}`

### 4. Set up the client

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Open <http://localhost:5173>.

> In development the client calls the API at `http://localhost:8080` and the API allows `http://localhost:5173`. Override them with `VITE_API_URL` (client, build time) and `CLIENT_URL` (back end) if you use other addresses.

## Environment variables

Set these in `backend-fastapi/.env` (copy `.env.sample`):

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://syphar:secret@127.0.0.1:5432/syphar_connect`. Percent-encode special characters in the password (`@` becomes `%40`). |
| `SECRET_KEY` | Secret used to sign the login cookie. Use a long random value (32+ characters). |
| `UPLOAD_DIR` | Folder for uploaded files: an absolute path, or relative to `backend-fastapi/`. Use `../uploads` in development and a persistent path in production, e.g. `/var/data/syphar-uploads`. |
| `BASE_URL` | Optional. Public URL of the API, used in links to uploaded files. Defaults to the address of the request. Set it in production, e.g. `https://jobs.example.com`. |
| `ENVIRONMENT` | Set to `production` on a live server so the login cookie is HTTPS-only. |
| `CLIENT_URL` | Optional. Browser origin allowed by CORS when the client is on a different address than the API (default `http://localhost:5173`). |

The client reads one optional build-time variable, `VITE_API_URL`, when the API lives on another host.

## Available scripts

**Back end** (`/backend-fastapi`)

| Command | Description |
| --- | --- |
| `uvicorn app.main:app --reload --port 8080` | Start the API with auto-reload |
| `alembic upgrade head` | Apply database migrations |
| `alembic revision --autogenerate -m "message"` | Create a migration after changing `models.py` |
| `pytest` | Run the API tests (needs `TEST_DATABASE_URL`, see [Testing](#testing)) |

**Client** (`/client`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Application routes

| Route | Who | Page |
| --- | --- | --- |
| `/welcome` | Everyone | First-visit onboarding |
| `/auth/login`, `/auth/signup` | Guests | Authentication |
| `/` | Logged in | Home |
| `/jobs`, `/search`, `/description/:id` | Logged in | Browse, search and view jobs (with company details) |
| `/profile` | Logged in | Profile (students: saved jobs; recruiters: activity) |
| `/applied-jobs` | Students | Applied jobs and statuses |
| `/admin/companies`, `/admin/companies/register-company`, `/admin/companies/:id` | Recruiters | Company management |
| `/admin/ad-jobs`, `/admin/ad-jobs/post-job`, `/admin/ad-jobs/:id/applicants` | Recruiters | Job management and applicants |
| `/admin/applicants` | Recruiters | Applicants overview |
| `/about`, `/contact`, `/privacy`, `/terms` | Everyone | Information pages |

## API overview

All endpoints except register, login, logout and health require the login cookie. Failed requests always answer in JSON: `{"message": "...", "success": false}`.

| Base path | Endpoints |
| --- | --- |
| `/api/health` | `GET /` (API and database status) |
| `/api/auth/user` | `POST /register`, `POST /login`, `GET /logout`, `PUT /profile/update-profile/{id}`, `GET /fetch-all-users` |
| `/api/v1` (companies) | `POST /register-company`, `GET /companies`, `GET /company/{id}`, `PUT /company/update-company/{id}`, `DELETE /company/delete/{id}` |
| `/api/job` | `POST /create-job`, `GET /all-job`, `GET /fetch-by-id/{id}` (includes the full company), `GET /admin-job`, `GET /saved`, `POST` and `DELETE /save/{id}` |
| `/api/application` | `GET /apply/{id}`, `GET /applied-job`, `GET /applicants/{id}`, `POST /update-status/{id}` |

`GET /api/job/all-job` accepts these query parameters:

- `keyword`: free-text match on title and description.
- `location`, `jobType`, `industry` (role), `salary`: repeat a parameter to select several values. Values within one parameter are OR-ed, different parameters are AND-ed. `salary` takes ranges such as `6-10` or `20+` (LPA).
- `experience`: years of experience; returns jobs asking for that many years or fewer.

## Database

PostgreSQL, with the schema managed by Alembic migrations in `backend-fastapi/migrations`.

| Table | Purpose |
| --- | --- |
| `users` | Accounts (student or recruiter) and their profile |
| `companies` | Companies registered by recruiters |
| `jobs` | Job postings (each belongs to a company and a recruiter) |
| `applications` | A student's application to a job, with its status. A student can apply to a job only once (unique constraint). |
| `saved_jobs` | "Save for later" bookmarks |

Deleting a company keeps its jobs; deleting a user or job removes the rows that depend on them. IDs are UUIDs, sent to the client as `_id`.

## File uploads

Profile photos, company logos and resumes are saved to the folder set in `UPLOAD_DIR` and served from `/uploads/<filename>`.

- Allowed types: JPG, PNG, WEBP, GIF and PDF.
- Maximum size: 5 MB.
- Files get random names.
- The `uploads/` folder is git-ignored, so uploaded files are never committed.

## Security notes

- Passwords are hashed with bcrypt and never sent back to the client.
- The login cookie is HTTP-only and `SameSite=Strict`, and `Secure` in production.
- Recruiters can only view or change their own companies, jobs and applicants; the server enforces this.
- Job descriptions are sanitised with an allow-list on the server and again when shown.
- Company website links are only ever rendered when they are `http` or `https`, and open with `rel="noopener noreferrer"`.
- Search keywords are escaped before being used in database queries.
- Uploads are limited by type and size, and removed again if the request fails.
- `.env` files, `node_modules`, the virtual environment and the `uploads/` folder are git-ignored. Keep real secrets only in your local `.env` or your server's environment.

## Testing

The API has an end-to-end test suite (authentication, uploads, search filters, ownership rules and the whole apply-and-review flow) that runs against a real PostgreSQL. It **deletes every row**, so it refuses to run unless you name a throwaway database:

```bash
cd backend-fastapi
pip install -r requirements-dev.txt
TEST_DATABASE_URL=postgresql://syphar:secret@127.0.0.1:5432/syphar_test pytest
```

## Deployment

The recommended setup is a single Linux VPS with Nginx serving the built client and proxying `/api` and `/uploads`, on one domain, with Uvicorn running under systemd and PostgreSQL on the same machine:

1. Install Nginx, PostgreSQL, Python and Node.js; create the database and a dedicated user.
2. Clone the repository, create the virtual environment, install the requirements and fill in `.env` (`ENVIRONMENT=production`, a strong `SECRET_KEY`, your `DATABASE_URL`, a persistent `UPLOAD_DIR`, your public `BASE_URL`).
3. Run `alembic upgrade head`, then start `uvicorn app.main:app --host 127.0.0.1 --port 8080 --proxy-headers` under systemd.
4. Build the client with `npm run build` and point Nginx at `client/dist`, with a fallback to `index.html` for client-side routes.
5. Add free HTTPS with Certbot, and schedule `pg_dump` backups of the database and a copy of the uploads folder.

Uploaded files are stored on disk, so the host needs a persistent disk (a VPS, or Render/Railway with a volume). Serverless hosts such as Vercel cannot keep those files.

## Known limitations

- The Contact form shows a thank-you message but does not send the message anywhere yet.
- The Privacy Policy and Terms of Service are general template text; have them reviewed before launch.
- The client has no automated tests yet (the API does).
- The project used MongoDB in an earlier version. There is no importer for old MongoDB data; a new PostgreSQL database starts empty.

## Author

**Md. Shahabuddin**

- LinkedIn: <https://www.linkedin.com/in/mdshahabuddin82/>
- X: <https://x.com/imdshahab82>
- Instagram: <https://www.instagram.com/imdshahab.82>

Licensed under the ISC license.
