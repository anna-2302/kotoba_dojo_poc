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
    SQLite-compatible version using batch operations.
    """
    with op.batch_alter_table('user_settings', schema=None) as batch_op:
        # Add theme_mode column with default 'day'
        batch_op.add_column(
            sa.Column('theme_mode', sa.String(length=10), nullable=False, server_default='day')
        )
        
        # Add check constraint (SQLite supports this in batch mode)
        batch_op.create_check_constraint(
            'ck_user_settings_theme_mode',
            "theme_mode IN ('day', 'night')"
        )
    
    # Migrate existing dark_mode values to theme_mode
    # SQLite uses 1/0 for boolean
    op.execute("""
        UPDATE user_settings 
        SET theme_mode = CASE 
            WHEN dark_mode = 1 THEN 'night'
            ELSE 'day'
        END
    """)
    
    # Note: We keep dark_mode column for backward compatibility during transition
    # It can be removed in a future migration after frontend is fully migrated


def downgrade() -> None:
    """
    Remove theme_mode column and check constraint.
    """
    with op.batch_alter_table('user_settings', schema=None) as batch_op:
        batch_op.drop_constraint('ck_user_settings_theme_mode', type_='check')
        batch_op.drop_column('theme_mode')
