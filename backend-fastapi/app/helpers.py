import math
import uuid
from typing import Any


def falsy(value: Any) -> bool:
    """JavaScript truthiness for the values a JSON/form body can hold."""
    return value is None or value == "" or value == 0


def to_number(value: Any) -> float | None:
    """Like JavaScript's Number(): a finite float, or None when not a number."""
    if isinstance(value, bool):
        return float(value)
    try:
        number = float(str(value).strip()) if isinstance(value, str) else float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def parse_uuid(value: str) -> uuid.UUID | None:
    try:
        return uuid.UUID(value)
    except (ValueError, AttributeError, TypeError):
        return None
