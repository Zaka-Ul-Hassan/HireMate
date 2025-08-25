"""Remove unique constraint from Resume.Email

Revision ID: 24532b70ba1c
Revises: 11897090291d
Create Date: 2025-08-25 20:16:52.842144
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '24532b70ba1c'
down_revision: Union[str, Sequence[str], None] = '11897090291d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: remove unique constraint on Email."""
    # Replace 'UQ__Resumes__A9D105346EA588E3' with the actual constraint name in your DB
    op.drop_constraint('UQ__Resumes__A9D105346EA588E3', 'Resumes', type_='unique')


def downgrade() -> None:
    """Downgrade schema: restore unique constraint on Email."""
    op.create_unique_constraint('UQ__Resumes__A9D105346EA588E3', 'Resumes', ['Email'])
