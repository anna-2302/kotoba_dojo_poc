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
    op.add_column('user_settings', sa.Column('max_session_size', sa.Integer(), nullable=False, server_default='50'))
    op.add_column('user_settings', sa.Column('preferred_session_scope', sa.String(length=20), nullable=False, server_default='all'))
    op.add_column('user_settings', sa.Column('preferred_deck_ids', sa.JSON(), nullable=False, server_default='[]'))
    op.add_column('user_settings', sa.Column('new_section_limit', sa.Integer(), nullable=False, server_default='15'))
    op.add_column('user_settings', sa.Column('learning_section_limit', sa.Integer(), nullable=False, server_default='20'))
    op.add_column('user_settings', sa.Column('review_section_limit', sa.Integer(), nullable=False, server_default='30'))
    op.add_column('user_settings', sa.Column('auto_start_sessions', sa.Boolean(), nullable=False, server_default='false'))


def downgrade():
    # Remove session configuration columns from user_settings table
    op.drop_column('user_settings', 'auto_start_sessions')
    op.drop_column('user_settings', 'review_section_limit')
    op.drop_column('user_settings', 'learning_section_limit')
    op.drop_column('user_settings', 'new_section_limit')
    op.drop_column('user_settings', 'preferred_deck_ids')
    op.drop_column('user_settings', 'preferred_session_scope')
    op.drop_column('user_settings', 'max_session_size')