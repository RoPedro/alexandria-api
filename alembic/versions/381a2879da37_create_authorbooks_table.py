"""create authorBooks table

Revision ID: 381a2879da37
Revises: 4f5e2355636c
Create Date: 2026-03-26 17:30:57.121060

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "381a2879da37"
down_revision: str | Sequence[str] | None = "4f5e2355636c"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "authorBooks",
        sa.Column(
            "author_id", sa.Integer, sa.ForeignKey("authors.id"), primary_key=True
        ),
        sa.Column("book_id", sa.Integer, sa.ForeignKey("books.id"), primary_key=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("authorBooks")
