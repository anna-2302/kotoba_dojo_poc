"""merge_phase4_migrations

Revision ID: bc4b4f6ccd11
Revises: 003, 0b8db6ca657d
Create Date: 2025-11-28 13:18:14.255032

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'bc4b4f6ccd11'
down_revision = ('003', '0b8db6ca657d')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
