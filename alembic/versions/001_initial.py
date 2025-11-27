"""Initial schema with all tables

Revision ID: 001
Revises: 
Create Date: 2025-01-26 13:00:00.000000

This migration creates all tables per PRD schema (lines 400-461):
- users
- decks (REQ-1)
- cards (REQ-2)
- tags (REQ-3)
- card_tags (many-to-many)
- sched_states (REQ-4)
- review_logs (REQ-9)
- daily_counters (REQ-6)
- user_settings (REQ-10, REQ-11)
"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=False, server_default='UTC'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_id', 'users', ['id'])
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Create decks table (REQ-1)
    op.create_table(
        'decks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('new_per_day', sa.Integer(), nullable=True),
        sa.Column('review_per_day', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_decks_id', 'decks', ['id'])
    op.create_index('ix_decks_user_id', 'decks', ['user_id'])
    op.create_index('ix_decks_user_id_name', 'decks', ['user_id', 'name'])

    # Create tags table (REQ-3)
    op.create_table(
        'tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_tags_id', 'tags', ['id'])
    op.create_index('ix_tags_user_id', 'tags', ['user_id'])
    op.create_index('ix_tags_user_name', 'tags', ['user_id', 'name'], unique=True)

    # Create cards table (REQ-2)
    op.create_table(
        'cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('deck_id', sa.Integer(), nullable=False),
        sa.Column('front', sa.Text(), nullable=False),
        sa.Column('back', sa.Text(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('suspended', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_cards_id', 'cards', ['id'])
    op.create_index('ix_cards_user_id', 'cards', ['user_id'])
    op.create_index('ix_cards_deck_id', 'cards', ['deck_id'])
    op.create_index('ix_cards_user_deck', 'cards', ['user_id', 'deck_id'])
    op.create_index('ix_cards_suspended', 'cards', ['suspended'])

    # Create card_tags association table (REQ-3)
    op.create_table(
        'card_tags',
        sa.Column('card_id', sa.Integer(), nullable=False),
        sa.Column('tag_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['card_id'], ['cards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('card_id', 'tag_id')
    )

    # Create sched_states table (REQ-4)
    op.create_table(
        'sched_states',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('card_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('state', sa.String(length=20), nullable=False, server_default='new'),
        sa.Column('due_at', sa.DateTime(), nullable=False),
        sa.Column('interval_days', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('ease_factor', sa.Float(), nullable=False, server_default='2.5'),
        sa.Column('learning_step', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('lapses', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('version', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('ease_factor >= 1.3 AND ease_factor <= 3.0', name='check_ease_factor'),
        sa.ForeignKeyConstraint(['card_id'], ['cards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('card_id')
    )
    op.create_index('ix_sched_states_id', 'sched_states', ['id'])
    op.create_index('ix_sched_states_card_id', 'sched_states', ['card_id'], unique=True)
    op.create_index('ix_sched_states_user_id', 'sched_states', ['user_id'])
    op.create_index('ix_sched_states_due_at', 'sched_states', ['due_at'])
    op.create_index('ix_sched_due', 'sched_states', ['user_id', 'state', 'due_at'])

    # Create review_logs table (REQ-9)
    op.create_table(
        'review_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('card_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.String(length=10), nullable=False),
        sa.Column('state_before', sa.String(length=20), nullable=False),
        sa.Column('state_after', sa.String(length=20), nullable=False),
        sa.Column('time_taken_ms', sa.Integer(), nullable=True),
        sa.Column('interval_before', sa.Float(), nullable=False),
        sa.Column('interval_after', sa.Float(), nullable=False),
        sa.Column('ease_factor_before', sa.Float(), nullable=False),
        sa.Column('ease_factor_after', sa.Float(), nullable=False),
        sa.Column('reviewed_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['card_id'], ['cards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_review_logs_id', 'review_logs', ['id'])
    op.create_index('ix_review_logs_card_id', 'review_logs', ['card_id'])
    op.create_index('ix_review_logs_user_id', 'review_logs', ['user_id'])
    op.create_index('ix_review_logs_reviewed_at', 'review_logs', ['reviewed_at'])
    op.create_index('ix_review_logs_user_date', 'review_logs', ['user_id', 'reviewed_at'])

    # Create daily_counters table (REQ-6)
    op.create_table(
        'daily_counters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('introduced_new', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('reviews_done', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('again_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('good_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('easy_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_daily_counters_id', 'daily_counters', ['id'])
    op.create_index('ix_daily_counters_user_id', 'daily_counters', ['user_id'])
    op.create_index('ix_daily_counters_user_date', 'daily_counters', ['user_id', 'date'], unique=True)

    # Create user_settings table (REQ-10, REQ-11)
    op.create_table(
        'user_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('learning_steps', sa.String(length=100), nullable=False, server_default='10,1440'),
        sa.Column('new_per_day', sa.Integer(), nullable=True, server_default='15'),
        sa.Column('review_per_day', sa.Integer(), nullable=True, server_default='200'),
        sa.Column('dark_mode', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('music_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('music_volume', sa.Float(), nullable=False, server_default='0.5'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index('ix_user_settings_id', 'user_settings', ['id'])
    op.create_index('ix_user_settings_user_id', 'user_settings', ['user_id'], unique=True)

    # Insert default user for POC
    op.execute("""
        INSERT INTO users (username, timezone, created_at, updated_at) 
        VALUES ('default_user', 'UTC', now(), now())
    """)

    # Insert default settings for default user
    op.execute("""
        INSERT INTO user_settings (user_id, learning_steps, dark_mode, music_enabled, music_volume, created_at, updated_at)
        SELECT id, '10,1440', false, false, 0.5, now(), now()
        FROM users WHERE username = 'default_user'
    """)


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('user_settings')
    op.drop_table('daily_counters')
    op.drop_table('review_logs')
    op.drop_table('sched_states')
    op.drop_table('card_tags')
    op.drop_table('cards')
    op.drop_table('tags')
    op.drop_table('decks')
    op.drop_table('users')
