import logging
from typing import Any

from asyncpg.exceptions import PostgresConnectionError
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import InterfaceError, OperationalError
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("syphar")


class ApiError(Exception):
    """An expected failure, answered as {"message": ..., "success": false}."""

    def __init__(self, status_code: int, message: str, **extra: Any):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.extra = extra


def _body(message: str, **extra: Any) -> dict[str, Any]:
    return {"message": message, **extra, "success": False}


def install_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error(_: Request, exc: ApiError):
        return JSONResponse(
            _body(exc.message, **exc.extra), status_code=exc.status_code
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_error(_: Request, exc: StarletteHTTPException):
        message = "Not found" if exc.status_code == 404 else str(exc.detail)
        return JSONResponse(_body(message), status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_: Request, exc: RequestValidationError):
        return JSONResponse(_body("Invalid request"), status_code=400)

    # The database is down or unreachable: say so, instead of a generic 500.
    # The connection pool reconnects by itself once it is back.
    @app.exception_handler(ConnectionError)
    @app.exception_handler(TimeoutError)
    @app.exception_handler(PostgresConnectionError)
    @app.exception_handler(OperationalError)
    @app.exception_handler(InterfaceError)
    async def database_unavailable(_: Request, exc: Exception):
        log.error("database unavailable: %s: %s", type(exc).__name__, exc)
        return JSONResponse(
            _body("The database is unavailable. Please try again shortly."),
            status_code=503,
        )

    # Last resort: any error that was not handled returns JSON instead of hanging
    @app.exception_handler(Exception)
    async def unhandled(_: Request, exc: Exception):
        log.exception("ERROR! unhandled: %s", exc)
        return JSONResponse(_body("Something went wrong"), status_code=500)
