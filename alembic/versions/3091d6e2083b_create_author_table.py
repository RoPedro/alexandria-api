"""create author table

Revision ID: 3091d6e2083b
Revises: f5aa3b34a828
Create Date: 2026-03-26 13:53:25.387561

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "3091d6e2083b"
down_revision: str | Sequence[str] | None = "f5aa3b34a828"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "authors",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("firstname", sa.String(100)),
        sa.Column("lastname", sa.String(100)),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("authors")
