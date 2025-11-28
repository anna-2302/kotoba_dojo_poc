"""Add session configuration fields to UserSettings

Revision ID: 003_add_session_config
Revises: 002_add_theme_mode
Create Date: 2025-11-28 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add session configuration columns to user_settings table
    # SQLite-compatible version using batch operations
    with op.batch_alter_table('user_settings', schema=None) as batch_op:
        batch_op.add_column(sa.Column('max_session_size', sa.Integer(), nullable=False, server_default='50'))
        batch_op.add_column(sa.Column('preferred_session_scope', sa.String(length=20), nullable=False, server_default='all'))
        batch_op.add_column(sa.Column('preferred_deck_ids', sa.Text(), nullable=False, server_default='[]'))  # Use Text instead of JSON for SQLite
        batch_op.add_column(sa.Column('new_section_limit', sa.Integer(), nullable=False, server_default='15'))
        batch_op.add_column(sa.Column('learning_section_limit', sa.Integer(), nullable=False, server_default='20'))
        batch_op.add_column(sa.Column('review_section_limit', sa.Integer(), nullable=False, server_default='30'))
        batch_op.add_column(sa.Column('auto_start_sessions', sa.Boolean(), nullable=False, server_default='0'))  # Use 0 instead of 'false' for SQLite


def downgrade():
    # Remove session configuration columns from user_settings table
    with op.batch_alter_table('user_settings', schema=None) as batch_op:
        batch_op.drop_column('auto_start_sessions')
        batch_op.drop_column('review_section_limit')
        batch_op.drop_column('learning_section_limit')
        batch_op.drop_column('new_section_limit')
        batch_op.drop_column('preferred_deck_ids')
        batch_op.drop_column('preferred_session_scope')
        batch_op.drop_column('max_session_size')