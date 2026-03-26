"""create genre table

Revision ID: f5aa3b34a828
Revises:
Create Date: 2026-03-26 11:42:33.069317

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f5aa3b34a828"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "genres",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(100), unique=True),
    )
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("genres")
    pass
