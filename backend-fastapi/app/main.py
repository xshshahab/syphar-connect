import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings
from .db import ping_database, watch_database
from .errors import install_error_handlers
from .routers import applications, companies, jobs, users

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("syphar")


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not settings.secret_key:
        raise RuntimeError(
            "SECRET_KEY is not set. Add it to backend-fastapi/.env and restart the API."
        )
    if not settings.database_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Add it to backend-fastapi/.env and restart the API."
        )
    watcher = asyncio.create_task(watch_database())
    log.info("API started")
    try:
        yield
    finally:
        watcher.cancel()


app = FastAPI(
    title="Syphar Connect API",
    lifespan=lifespan,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    redoc_url=None,
)
install_error_handlers(app)

# Only needed when the client is served from a different origin than the API
# (always the case in development). Set CLIENT_URL to that origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_url],
    allow_credentials=True,
    allow_methods=["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allow_headers=["*"],
)

# Uploaded files (profile photos, logos, resumes)
app.mount("/uploads", StaticFiles(directory=settings.upload_path), name="uploads")


@app.get("/api/health", tags=["health"])
async def health():
    """Confirms the API is up and whether the database is connected."""
    connected = await ping_database()
    return JSONResponse(
        {"api": "ok", "db": "connected" if connected else "disconnected"},
        status_code=200 if connected else 503,
    )


app.include_router(users.router)
app.include_router(companies.router)
app.include_router(jobs.router)
app.include_router(applications.router)
