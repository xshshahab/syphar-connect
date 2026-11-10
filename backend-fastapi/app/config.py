from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env", extra="ignore", case_sensitive=False
    )

    # postgresql://user:password@host:5432/dbname
    database_url: str = ""
    # Signs the login cookie. Keep the value used by the Node API if you want
    # people who are already logged in to stay logged in.
    secret_key: str = ""

    # Absolute path, or relative to the backend-fastapi folder.
    upload_dir: str = "uploads"
    # Public URL of the API, used to build links to uploaded files. When unset,
    # links use the address the request came in on.
    base_url: str | None = None
    # Set to "production" so the login cookie is HTTPS-only.
    environment: str = "development"
    # Origin of the client when it is served from a different address.
    client_url: str = "http://localhost:5173"

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"

    @property
    def upload_path(self) -> Path:
        return (BACKEND_ROOT / self.upload_dir).resolve()


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
