from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from src.config import settings
from src.models.v1.user import Role


class UserPublic(BaseModel):
    """What the API exposes about a user — never the password hash."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    role: str
    is_active: bool = True
    created_at: datetime | None = None


class UserRegister(BaseModel):
    """Public registration payload. It has no role field on purpose: guests can
    only ever create regular users."""

    username: str = Field(
        min_length=settings.username_min_length,
        max_length=settings.username_max_length,
        pattern=r"^[A-Za-z0-9._-]+$",
    )
    password: str = Field(min_length=settings.password_min_length, max_length=128)


class UserCreate(UserRegister):
    """Admin-only payload: an admin decides the role of the account it creates."""

    role: str = Field(default=Role.USER)

    @field_validator("role")
    @classmethod
    def role_must_be_known(cls, value: str) -> str:
        if value not in Role.ALL:
            raise ValueError(f"role must be one of {', '.join(Role.ALL)}")
        return value


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: UserPublic
