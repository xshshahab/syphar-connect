import asyncio
import os
import shutil
import tempfile
import uuid
from pathlib import Path

import pytest

# These tests wipe every table, so they only ever run against a database that
# was named explicitly for testing.
TEST_DB = os.environ.get("TEST_DATABASE_URL")
if not TEST_DB:
    pytest.exit(
        "Set TEST_DATABASE_URL to a throwaway PostgreSQL database "
        "(the tests delete all rows).",
        returncode=2,
    )

TEST_SECRET = "test-secret-test-secret-test-secret-0123"
_uploads = tempfile.mkdtemp(prefix="syphar-test-uploads-")
os.environ.update(
    DATABASE_URL=TEST_DB,
    SECRET_KEY=TEST_SECRET,
    UPLOAD_DIR=_uploads,
    ENVIRONMENT="development",
)

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlalchemy.ext.asyncio import create_async_engine  # noqa: E402
from sqlalchemy.pool import NullPool  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent


@pytest.fixture(scope="session", autouse=True)
def _schema():
    command.upgrade(Config(str(ROOT / "alembic.ini")), "head")
    yield
    shutil.rmtree(_uploads, ignore_errors=True)


@pytest.fixture(scope="session")
def client(_schema):
    from app.main import app

    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _clean_tables(_schema):
    from app.db import async_database_url

    async def wipe():
        engine = create_async_engine(async_database_url(TEST_DB), poolclass=NullPool)
        async with engine.begin() as conn:
            await conn.execute(
                text("TRUNCATE saved_jobs, applications, jobs, companies, users CASCADE")
            )
        await engine.dispose()

    asyncio.run(wipe())


@pytest.fixture
def make_user(client):
    """Sign up and log in. Returns (user_json, headers) where headers carry
    that user's login cookie, so one test can act as several people."""

    def _make(role="student", password="secret123", **extra):
        email = extra.pop("email", f"{uuid.uuid4().hex[:8]}@example.com")
        r = client.post(
            "/api/auth/user/register",
            data={
                "fullName": f"Test {role}",
                "email": email,
                "phoneNumber": "9999999999",
                "password": password,
                "role": role,
                **extra,
            },
        )
        assert r.status_code == 201, r.text
        r = client.post("/api/auth/user/login", json={"email": email, "password": password})
        assert r.status_code == 200, r.text
        token = r.cookies["token"]
        client.cookies.clear()
        return r.json()["user"], {"Cookie": f"token={token}"}

    return _make
