"""Password hashing.

Argon2id through `pwdlib` (the maintained successor to `passlib`). The salt is
generated per password and embedded in the resulting hash string.
"""

import logging

from pwdlib import PasswordHash

logger = logging.getLogger(__name__)

_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plaintext password (argon2id, unique salt per call)."""
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Check a plaintext password against a stored hash.

    Never raises: a malformed or foreign hash simply fails to verify.
    """
    if not password or not password_hash:
        return False
    try:
        return _hasher.verify(password, password_hash)
    except Exception:  # noqa: BLE001 - any hashing backend error means "no match"
        logger.debug("Password verification failed to run against the stored hash.")
        return False
