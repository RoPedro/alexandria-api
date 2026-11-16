"""Application settings, read from the environment.

Every value has a safe default so the app boots out of the box; anything
security-sensitive (the JWT secret) warns loudly when it falls back to a
generated value instead of failing hard.
"""

import logging
import secrets
from datetime import datetime, time, timedelta, timezone
from os import getenv

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def _bool_env(name: str, default: bool) -> bool:
    raw = getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _int_env(name: str, default: int) -> int:
    raw = getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError:
        logger.warning("%s=%r is not an integer, using %s instead.", name, raw, default)
        return default


def _timezone(name: str, default: str):
    from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

    raw = (getenv(name) or default).strip()
    try:
        return ZoneInfo(raw)
    except ZoneInfoNotFoundError, ValueError:
        logger.warning("%s=%r is not a valid timezone, falling back to UTC.", name, raw)
        return timezone.utc


class Settings:
    def __init__(self) -> None:
        # --- Token signing -------------------------------------------------
        self.jwt_secret_key = (getenv("JWT_SECRET_KEY") or "").strip()
        if not self.jwt_secret_key:
            self.jwt_secret_key = secrets.token_urlsafe(48)
            logger.warning(
                "JWT_SECRET_KEY is not set: generated an ephemeral secret. "
                "Every session dies on restart and tokens do not survive a redeploy. "
                "Set JWT_SECRET_KEY in the environment for a stable deployment."
            )
        self.jwt_algorithm = (getenv("JWT_ALGORITHM") or "HS256").strip()

        # --- Lifetimes -----------------------------------------------------
        # Regular users get a long-lived session.
        self.access_token_expire_minutes = _int_env(
            "ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 30
        )
        # Admins get a short one, optionally capped at midnight.
        self.admin_session_hours = _int_env("ADMIN_SESSION_HOURS", 8)
        self.admin_expire_at_midnight = _bool_env("ADMIN_EXPIRE_AT_MIDNIGHT", True)
        self.admin_timezone = _timezone("ADMIN_TIMEZONE", "UTC")

        # --- First admin bootstrap -----------------------------------------
        self.admin_username = (getenv("ADMIN_USERNAME") or "").strip()
        self.admin_password = getenv("ADMIN_PASSWORD") or ""

        # --- Validation ----------------------------------------------------
        self.username_min_length = _int_env("USERNAME_MIN_LENGTH", 3)
        self.username_max_length = _int_env("USERNAME_MAX_LENGTH", 50)
        self.password_min_length = _int_env("PASSWORD_MIN_LENGTH", 8)

    def admin_session_expiry(self, now: datetime | None = None) -> datetime:
        """When an admin session must end: the earlier of the hour cap and midnight."""
        current = now or datetime.now(self.admin_timezone)
        candidates = [current + timedelta(hours=self.admin_session_hours)]
        if self.admin_expire_at_midnight:
            next_midnight = datetime.combine(
                current.date() + timedelta(days=1), time.min, tzinfo=self.admin_timezone
            )
            candidates.append(next_midnight)
        return min(candidates)


settings = Settings()
