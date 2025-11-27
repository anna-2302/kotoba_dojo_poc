"""Add theme_mode to user_settings

Revision ID: 002
Revises: 001
Create Date: 2025-11-27 14:00:00.000000

Phase 3: Adds theme_mode column to support unified Day/Night theme system.
Migrates existing dark_mode boolean to theme_mode ENUM.
Maintains backward compatibility with dark_mode column.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add theme_mode column to user_settings.
    Migrate dark_mode values: False -> 'day', True -> 'night'.
    """
    # Add theme_mode column with default 'day'
    op.add_column(
        'user_settings',
        sa.Column('theme_mode', sa.String(length=10), nullable=False, server_default='day')
    )
    
    # Migrate existing dark_mode values to theme_mode
    # PostgreSQL uses TRUE/FALSE, SQLite uses 1/0, so we use boolean comparison
    op.execute("""
        UPDATE user_settings 
        SET theme_mode = CASE 
            WHEN dark_mode = TRUE THEN 'night'
            ELSE 'day'
        END
    """)
    
    # Add check constraint to ensure theme_mode is valid
    op.create_check_constraint(
        'ck_user_settings_theme_mode',
        'user_settings',
        "theme_mode IN ('day', 'night')"
    )
    
    # Note: We keep dark_mode column for backward compatibility during transition
    # It can be removed in a future migration after frontend is fully migrated


def downgrade() -> None:
    """
    Remove theme_mode column and check constraint.
    """
    op.drop_constraint('ck_user_settings_theme_mode', 'user_settings', type_='check')
    op.drop_column('user_settings', 'theme_mode')
