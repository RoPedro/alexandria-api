"""Authentication dependencies.

`get_current_user` resolves the bearer token to a user row; `require_admin`
additionally asserts the admin role. The role is always read from the
database, never from the token, so a role change takes effect immediately.
"""

import logging
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from db.connection import get_db
from src.controllers.v1 import ctrls_user
from src.models.v1.user import Role, User
from src.security import tokens

logger = logging.getLogger(__name__)

# auto_error=False so a missing token produces our own 401 with a clear detail
# instead of FastAPI's generic "Not authenticated" for the wrong shape.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login", auto_error=False)

UNAUTHENTICATED_DETAIL = "Authentication required"
FORBIDDEN_DETAIL = "Administrator privileges are required for this operation"


def _credentials_error(detail: str = UNAUTHENTICATED_DETAIL) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    token: Annotated[str | None, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
) -> User:
    """Resolve the bearer token into the active user, or raise 401."""
    if not token:
        raise _credentials_error()

    try:
        payload = tokens.decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise _credentials_error("Session expired, please sign in again")
    except jwt.InvalidTokenError:
        raise _credentials_error("Invalid authentication token")

    subject = payload.get("sub")
    try:
        user_id = int(subject)
    except TypeError, ValueError:
        raise _credentials_error("Invalid authentication token")

    user = ctrls_user.get(db, user_id)
    if user is None or not user.is_active:
        raise _credentials_error()
    return user


def require_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    """Allow only admins through; 403 for an authenticated non-admin."""
    if user.role != Role.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=FORBIDDEN_DETAIL
        )
    return user


current_user = Annotated[User, Depends(get_current_user)]
admin_user = Annotated[User, Depends(require_admin)]
