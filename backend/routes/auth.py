from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from schemas.user import TokenResponse, UserCreate, UserPublic, UserRegister
from src.controllers.v1 import ctrls_user
from src.dependencies.auth import current_user, require_admin
from src.models.v1.user import Role, User
from src.security import tokens

from .utils import session_object

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_session(user: User) -> TokenResponse:
    """Sign a session for the user, with a lifetime that depends on the role."""
    if user.role == Role.ADMIN:
        expires_at = tokens.admin_token_expiry()
    else:
        expires_at = tokens.user_token_expiry()

    access_token = tokens.create_access_token(user.id, user.username, expires_at)
    return TokenResponse(
        access_token=access_token,
        expires_at=expires_at,
        user=UserPublic.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse)
def register(
    data: Annotated[UserRegister, Form()],
    db: Session = session_object,
):
    """Public registration. Always creates a regular user — never an admin."""
    user = ctrls_user.add(db, data.username, data.password, Role.USER)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username is already taken"
        )
    return _issue_session(user)


@router.post("/login", response_model=TokenResponse)
def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = session_object,
):
    """Exchange a username and password for a session token."""
    user = ctrls_user.authenticate(db, form.username, form.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _issue_session(user)


@router.get("/me", response_model=UserPublic)
def me(user: current_user):
    """The session holder's own account. The frontend uses it on boot to learn
    the authoritative role instead of trusting the token payload."""
    return UserPublic.model_validate(user)


@router.post("/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    data: Annotated[UserCreate, Form()],
    db: Session = session_object,
    admin: User = Depends(require_admin),
):
    """Admin-only: create an account with an explicit role (this is how admins
    register other admins)."""
    user = ctrls_user.add(db, data.username, data.password, data.role)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Username is already taken"
        )
    return UserPublic.model_validate(user)


@router.get("/users", response_model=list[UserPublic])
def list_users(db: Session = session_object, admin: User = Depends(require_admin)):
    """Admin-only: list every account."""
    return [UserPublic.model_validate(user) for user in ctrls_user.getAll(db)]
