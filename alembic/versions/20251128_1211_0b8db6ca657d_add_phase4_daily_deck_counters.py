"""add_phase4_daily_deck_counters

Revision ID: 0b8db6ca657d
Revises: 002
Create Date: 2025-11-28 12:11:03.111496

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0b8db6ca657d'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add JSON columns to daily_counters for per-deck tracking
    op.add_column('daily_counters', sa.Column('introduced_new_per_deck', sa.JSON(), nullable=False, server_default='{}'))
    op.add_column('daily_counters', sa.Column('reviews_done_per_deck', sa.JSON(), nullable=False, server_default='{}'))
    
    # Create daily_deck_counters table
    op.create_table('daily_deck_counters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('deck_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('introduced_new', sa.Integer(), nullable=False, default=0),
        sa.Column('reviews_done', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_daily_deck_counters_user_deck_date', 'daily_deck_counters', ['user_id', 'deck_id', 'date'], unique=True)
    op.create_index(op.f('ix_daily_deck_counters_deck_id'), 'daily_deck_counters', ['deck_id'])
    op.create_index(op.f('ix_daily_deck_counters_id'), 'daily_deck_counters', ['id'])
    op.create_index(op.f('ix_daily_deck_counters_user_id'), 'daily_deck_counters', ['user_id'])


def downgrade() -> None:
    # Drop daily_deck_counters table and indexes
    op.drop_index(op.f('ix_daily_deck_counters_user_id'), table_name='daily_deck_counters')
    op.drop_index(op.f('ix_daily_deck_counters_id'), table_name='daily_deck_counters')
    op.drop_index(op.f('ix_daily_deck_counters_deck_id'), table_name='daily_deck_counters')
    op.drop_index('ix_daily_deck_counters_user_deck_date', table_name='daily_deck_counters')
    op.drop_table('daily_deck_counters')
    
    # Drop JSON columns from daily_counters
    op.drop_column('daily_counters', 'reviews_done_per_deck')
    op.drop_column('daily_counters', 'introduced_new_per_deck')
