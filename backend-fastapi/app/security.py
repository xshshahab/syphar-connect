import asyncio
import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Request, Response

from .config import settings
from .errors import ApiError

COOKIE_NAME = "token"
TOKEN_TTL = timedelta(days=1)
ALGORITHM = "HS256"


# bcrypt only looks at the first 72 bytes. bcryptjs (the Node API) silently
# truncates; the Python library may raise instead, so truncate the same way.
def _pw(password: str) -> bytes:
    return password.encode("utf-8")[:72]


async def hash_password(password: str) -> str:
    hashed = await asyncio.to_thread(bcrypt.hashpw, _pw(password), bcrypt.gensalt(10))
    return hashed.decode()


async def verify_password(password: str, hashed: str) -> bool:
    try:
        return await asyncio.to_thread(bcrypt.checkpw, _pw(password), hashed.encode())
    except ValueError:  # malformed hash
        return False


def create_token(user_id: uuid.UUID) -> str:
    now = datetime.now(timezone.utc)
    payload = {"userId": str(user_id), "iat": now, "exp": now + TOKEN_TTL}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def set_login_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        COOKIE_NAME,
        token,
        max_age=int(TOKEN_TTL.total_seconds()),
        httponly=True,
        samesite="strict",
        # only sent over HTTPS in production
        secure=settings.is_production,
    )


def clear_login_cookie(response: Response) -> None:
    response.set_cookie(COOKIE_NAME, "", max_age=0)


async def current_user_id(request: Request) -> uuid.UUID:
    """Dependency: the id of the logged-in user, from the login cookie."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise ApiError(401, "User Not Authenticated")
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return uuid.UUID(payload["userId"])
    except Exception:
        # invalid or expired token
        raise ApiError(401, "Session expired. Please log in again.")
