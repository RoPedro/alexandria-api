import os

# Keep the OpenTelemetry exporter out of the test run: it would try to ship
# metrics to the configured collector and drown the test output in noise.
os.environ.setdefault("FASTAPI_OTEL_AUTO_CONFIGURE", "false")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from db.connection import get_db
from main import app
from src.models.v1 import Base  # noqa: F401 - imports every model, so create_all sees them
from src.models.v1.user import Role
from src.security import tokens
from src.controllers.v1 import ctrls_user

SQLITE_URL = "sqlite://"  # in-memory

engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,  # ensures same connection is reused across threads
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def test_api():
    Base.metadata.create_all(bind=engine)  # create tables
    yield
    Base.metadata.drop_all(bind=engine)  # clean up after each test


@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def _create_account(username: str, role: str) -> dict:
    """Insert an account straight into the database and return its auth header."""
    db = TestingSessionLocal()
    try:
        user = ctrls_user.add(db, username, "password123", role)
        assert user is not None
        token = tokens.create_access_token(
            user.id, user.username, tokens.user_token_expiry()
        )
    finally:
        db.close()
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers():
    """Authorization header for an admin account."""
    return _create_account("admin", Role.ADMIN)


@pytest.fixture
def user_headers():
    """Authorization header for a regular (non-admin) account."""
    return _create_account("reader", Role.USER)
