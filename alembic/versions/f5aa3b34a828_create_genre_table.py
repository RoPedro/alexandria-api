"""create genre table

Revision ID: f5aa3b34a828
Revises:
Create Date: 2026-03-26 11:42:33.069317

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "f5aa3b34a828"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "genres",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), unique=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("genres")
