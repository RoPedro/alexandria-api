"""add authors fullname constraint

Revision ID: 1bec86eb99e5
Revises: 381a2879da37
Create Date: 2026-03-30 12:20:16.680463

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1bec86eb99e5"
down_revision: Union[str, Sequence[str], None] = "381a2879da37"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("authors") as batch_op:
        batch_op.create_unique_constraint(
            "uq_author_fullname", ["firstname", "lastname"]
        )
    pass


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("authors") as batch_op:
        batch_op.drop_constraint("uq_author_fullname", type_="unique")
    pass
