# SypharConnect API (FastAPI + PostgreSQL)

The back end of SypharConnect. It serves the JSON API used by the React client in `../client`, stores data in PostgreSQL and keeps uploaded files (photos, logos, resumes) on disk.

| Area | Technology |
| --- | --- |
| Framework | FastAPI, served by Uvicorn |
| Database | PostgreSQL, SQLAlchemy 2 (async) with asyncpg |
| Migrations | Alembic |
| Passwords | bcrypt |
| Login cookie | PyJWT (`token` cookie, HS256, 1 day) |
| Uploads | jpg/png/webp/gif/pdf, 5 MB, served from `/uploads/...` |
| HTML cleaning | nh3 (allow-list for job descriptions) |
| Tests | pytest + httpx against a real PostgreSQL |

## Run it (development)

```bash
cd backend-fastapi
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

cp .env.sample .env            # then set DATABASE_URL and SECRET_KEY
alembic upgrade head           # creates the tables

uvicorn app.main:app --reload --port 8080
```

- API docs (Swagger): <http://localhost:8080/api/docs>
- Health check: <http://localhost:8080/api/health> returns `{"api":"ok","db":"connected"}`, or `503` with `"db":"disconnected"` when PostgreSQL cannot be reached.

A quick throwaway database with Docker:

```bash
docker run -d --name syphar-pg -e POSTGRES_USER=syphar -e POSTGRES_PASSWORD=secret \
  -e POSTGRES_DB=syphar_connect -p 5432:5432 postgres:16-alpine
# DATABASE_URL=postgresql://syphar:secret@127.0.0.1:5432/syphar_connect
```

## Database migrations

The schema lives in `app/models.py` and is applied with Alembic:

```bash
alembic upgrade head                                # apply
alembic revision --autogenerate -m "describe it"    # after changing models.py
```

Run `alembic upgrade head` on every deploy.

## Tests

The suite is end to end against a real PostgreSQL and **deletes every row**, so it refuses to run unless you name a throwaway database:

```bash
pip install -r requirements-dev.txt
TEST_DATABASE_URL=postgresql://syphar:secret@127.0.0.1:5432/syphar_test pytest
```

## Production notes

- Set `ENVIRONMENT=production` so the login cookie is HTTPS-only, and use a long random `SECRET_KEY`.
- Percent-encode special characters in the database password inside `DATABASE_URL` (`@` becomes `%40`).
- Start with `uvicorn app.main:app --host 127.0.0.1 --port 8080 --proxy-headers` behind Nginx. `--proxy-headers` makes links to uploaded files use your `https://` domain.
- Keep `UPLOAD_DIR` on a persistent disk, and back it up together with the database (`pg_dump`).

## Behaviour worth knowing

- **IDs are UUIDs**, sent to the client as `_id`.
- A malformed id in a URL answers 404 (or 400 for "save job") instead of a server error.
- A student can apply to a job only once; a unique constraint backs the check even when the button is double-clicked.
- Deleting a company keeps its jobs (their `company` becomes `null`).
- `GET /api/job/fetch-by-id/{id}` includes the full company, so the job page can show its details.
- Optional fields that are not set (`bio`, `resume`, `website`...) are sent as `null`.
- A database outage answers `503` with a JSON message, and the API reconnects by itself when PostgreSQL is back.
