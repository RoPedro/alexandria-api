"""Create administrator accounts out of band.

The first admin cannot come from an admin (there is none yet), so it is created
from the environment or from this CLI:

    python -m db.create_admin --username admin
    ADMIN_USERNAME=admin ADMIN_PASSWORD=secret python -m db.create_admin

Both paths are idempotent: running them twice does not create a second account
and never overwrites an existing password.
"""

import argparse
import getpass
import logging
from os import getenv

from sqlalchemy.orm import Session

from db.connection import engine
from src.config import settings
from src.controllers.v1 import ctrls_user
from src.models.v1.user import Role, User

logger = logging.getLogger(__name__)


def ensure_admin(username: str, password: str) -> tuple[User | None, bool]:
    """Make sure `username` exists and is an admin.

    Returns the user and whether anything changed. An existing account keeps
    its password — this never overwrites credentials.
    """
    with Session(bind=engine) as session:
        existing = ctrls_user.get_by_username(session, username)
        if existing is not None:
            if existing.role == Role.ADMIN:
                return existing, False
            existing.role = Role.ADMIN
            session.commit()
            session.refresh(existing)
            return existing, True

        user = ctrls_user.add(session, username, password, Role.ADMIN)
        return user, True


def ensure_bootstrap_admin() -> User | None:
    """Create the admin described by ADMIN_USERNAME / ADMIN_PASSWORD.

    Only acts when the database has no admin at all, so a later redeploy never
    resurrects or overwrites an account.
    """
    username = settings.admin_username
    password = settings.admin_password
    if not username or not password:
        return None

    with Session(bind=engine) as session:
        if ctrls_user.count_admins(session) > 0:
            logger.info("An admin already exists, skipping the bootstrap.")
            return None

    user, _ = ensure_admin(username, password)
    if user is not None:
        logger.warning("Bootstrapped admin account '%s'.", username)
    return user


def _read_password(username: str) -> str:
    password = getenv("ADMIN_PASSWORD") or ""
    if password:
        return password
    entered = getpass.getpass(f"Password for '{username}': ")
    confirmation = getpass.getpass("Confirm password: ")
    if entered != confirmation:
        raise SystemExit("Passwords do not match.")
    return entered


def main() -> None:
    parser = argparse.ArgumentParser(description="Create an admin account.")
    parser.add_argument("--username", default=getenv("ADMIN_USERNAME", "") or None)
    parser.add_argument(
        "--password",
        default=None,
        help="Password to set. Omit to be prompted (or use ADMIN_PASSWORD).",
    )
    args = parser.parse_args()

    username = (args.username or "").strip().lower()
    if not username:
        raise SystemExit("A username is required (--username or ADMIN_USERNAME).")

    password = args.password if args.password is not None else _read_password(username)
    if len(password) < settings.password_min_length:
        raise SystemExit(
            f"The password must be at least {settings.password_min_length} characters long."
        )

    user, changed = ensure_admin(username, password)
    if user is None:
        raise SystemExit("Could not create the admin account.")
    if changed:
        print(f"Admin '{user.username}' is ready.")
    else:
        print(f"Admin '{user.username}' already existed, nothing changed.")


if __name__ == "__main__":
    main()
