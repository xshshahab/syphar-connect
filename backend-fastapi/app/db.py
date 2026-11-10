import asyncio
import logging
from collections.abc import AsyncIterator
from functools import lru_cache

from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from .config import settings

log = logging.getLogger("syphar.db")
RETRY_SECONDS = 5


def async_database_url(url: str) -> str:
    """Accept the usual postgres:// / postgresql:// URLs and select asyncpg."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    return url


@lru_cache
def get_engine() -> AsyncEngine:
    return create_async_engine(
        async_database_url(settings.database_url), pool_pre_ping=True
    )


@lru_cache
def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(get_engine(), expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    async with get_sessionmaker()() as session:
        yield session


async def ping_database() -> bool:
    try:
        async with get_engine().connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


async def watch_database() -> None:
    """Log whether PostgreSQL is reachable, retrying until it is.

    Requests never depend on this: the connection pool reconnects on its own
    once the database is back. This only makes the reason visible in the logs.
    """
    attempt = 0
    while True:
        attempt += 1
        try:
            async with get_engine().connect() as conn:
                await conn.execute(text("SELECT 1"))
            log.info("PostgreSQL connected successfully!")
            return
        except Exception as exc:
            log.error(
                "could not connect to PostgreSQL (attempt %s): %s: %s. "
                "Check DATABASE_URL in backend-fastapi/.env and that the "
                "database accepts connections from this server. Retrying in %ss...",
                attempt,
                type(exc).__name__,
                exc,
                RETRY_SECONDS,
            )
            await asyncio.sleep(RETRY_SECONDS)
