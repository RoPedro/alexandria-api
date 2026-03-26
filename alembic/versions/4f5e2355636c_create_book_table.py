"""create book table

Revision ID: 4f5e2355636c
Revises: 3091d6e2083b
Create Date: 2026-03-26 13:56:29.735063

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4f5e2355636c"
down_revision: Union[str, Sequence[str], None] = "3091d6e2083b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "books",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("isbn", sa.String(20), unique=True),
        sa.Column("title", sa.String(255)),
        sa.Column("description", sa.String),
        sa.Column("release_date", sa.Date),
        sa.Column("genre_id", sa.Integer, sa.ForeignKey("genres.id")),
    )
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
