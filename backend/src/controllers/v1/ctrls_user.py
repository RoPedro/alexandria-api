"""User persistence and authentication helpers."""

import logging

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.models.v1.user import Role, User
from src.security.passwords import hash_password, verify_password

logger = logging.getLogger(__name__)

# Computed once at import so a login attempt against an unknown username still
# pays the argon2 cost, keeping "unknown user" and "wrong password" similar.
_DUMMY_HASH = hash_password("dummy-password-for-timing")


def getAll(db: Session) -> list[User]:
    stmt = select(User).order_by(User.id)
    return list(db.execute(stmt).scalars().all())


def get(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_by_username(db: Session, username: str) -> User | None:
    stmt = select(User).where(User.username == username.strip().lower())
    return db.execute(stmt).scalars().first()


def count_admins(db: Session) -> int:
    stmt = select(func.count()).select_from(User).where(User.role == Role.ADMIN)
    return db.execute(stmt).scalar_one()


def add(
    db: Session, username: str, password: str, role: str = Role.USER
) -> User | None:
    """Create a user. Returns `None` when the username is already taken."""
    user = User(
        username=username.strip().lower(),
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        return None
    return user


def authenticate(db: Session, username: str, password: str) -> User | None:
    """Return the user when the credentials match, `None` otherwise."""
    user = get_by_username(db, username)
    if user is None:
        verify_password(password, _DUMMY_HASH)
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active:
        return None
    return user
