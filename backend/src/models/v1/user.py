from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, Column, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from src.models.v1.dec_base import Base


class Role:
    """Application roles. Kept as plain strings so both SQLite and PostgreSQL
    behave the same (no native enum type on the SQLite side)."""

    ADMIN = "admin"
    USER = "user"

    ALL = (ADMIN, USER)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    # Stored lowercase: usernames are case-insensitive.
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default=Role.USER)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "role IN ('admin', 'user')",
            name="user_role_valid",
        ),
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, username={self.username!r}, role={self.role!r})"
