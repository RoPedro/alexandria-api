"""Access token issuing and verification.

Stateless HS256 JWTs. The payload carries only the user id and timestamps —
never the role — so the role is always read fresh from the database when a
protected route is hit.
"""

import logging
from datetime import datetime, timedelta, timezone

import jwt

from src.config import settings

logger = logging.getLogger(__name__)

ALGORITHM = settings.jwt_algorithm


def create_access_token(user_id: int, username: str, expires_at: datetime) -> str:
    """Sign a token for `user_id` that is valid until `expires_at`."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "username": username,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Verify a token and return its payload.

    Raises `jwt.ExpiredSignatureError` or `jwt.InvalidTokenError`.
    """
    return jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])


def user_token_expiry() -> datetime:
    """Expiry for a regular (non-admin) session."""
    return datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )


def admin_token_expiry() -> datetime:
    """Expiry for an admin session: the earlier of the hour cap and midnight."""
    return settings.admin_session_expiry().astimezone(timezone.utc)
