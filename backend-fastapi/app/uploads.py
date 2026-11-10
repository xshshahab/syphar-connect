import time
import uuid
from dataclasses import dataclass
from pathlib import Path

from fastapi import Request, UploadFile

from .config import settings
from .errors import ApiError

MAX_BYTES = 5 * 1024 * 1024
CHUNK = 1024 * 1024

ALLOWED_TYPES = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".pdf": "application/pdf",
}

settings.upload_path.mkdir(parents=True, exist_ok=True)


@dataclass
class SavedUpload:
    filename: str
    path: Path
    original_name: str


async def save_upload(file: UploadFile | None) -> SavedUpload | None:
    """Validate one uploaded file and store it in UPLOAD_DIR.

    Browsers send an empty part when no file was chosen; that means "no file".
    """
    if file is None or not file.filename:
        return None

    ext = Path(file.filename).suffix.lower()
    if ALLOWED_TYPES.get(ext) != file.content_type:
        raise ApiError(
            400, "Only images (jpg, png, webp, gif) and PDF files are allowed"
        )

    filename = f"{int(time.time() * 1000)}-{uuid.uuid4()}{ext}"
    path = settings.upload_path / filename
    size = 0
    try:
        with open(path, "wb") as out:
            while chunk := await file.read(CHUNK):
                size += len(chunk)
                if size > MAX_BYTES:
                    raise ApiError(400, "File too large. Maximum size is 5MB")
                out.write(chunk)
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    return SavedUpload(filename, path, file.filename)


class UploadSession:
    """Saves uploads and deletes them again if the request then fails, so a
    rejected request never leaves orphan files on disk."""

    def __init__(self) -> None:
        self._saved: list[SavedUpload] = []

    async def save(self, file: UploadFile | None) -> SavedUpload | None:
        saved = await save_upload(file)
        if saved:
            self._saved.append(saved)
        return saved

    async def __aenter__(self) -> "UploadSession":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> bool:
        if exc_type is not None:
            for saved in self._saved:
                saved.path.unlink(missing_ok=True)
        return False


def file_url(request: Request, saved: SavedUpload) -> str:
    """Public URL of an uploaded file, served by the /uploads mount."""
    base = settings.base_url or str(request.base_url)
    return f"{base.rstrip('/')}/uploads/{saved.filename}"
