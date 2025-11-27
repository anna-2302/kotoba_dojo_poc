"""
SQLAlchemy database models.
Schema based on PRD lines 400-461.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, 
    Float, ForeignKey, Table, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.db.session import Base


# Association table for card-tags many-to-many relationship (REQ-3)
card_tags = Table(
    'card_tags',
    Base.metadata,
    Column('card_id', Integer, ForeignKey('cards.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True),
    Column('created_at', DateTime, default=datetime.utcnow, nullable=False)
)


class User(Base):
    """
    User model (simplified for POC - single user assumed).
    PRD Line 405-408.
    """
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    timezone = Column(String(50), default='UTC', nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    decks = relationship("Deck", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    daily_counters = relationship("DailyCounter", back_populates="user", cascade="all, delete-orphan")


class Deck(Base):
    """
    Deck model for organizing cards (REQ-1).
    PRD Line 410-415.
    """
    __tablename__ = 'decks'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    
    # Optional per-deck limits (REQ-1, line 36)
    new_per_day = Column(Integer, nullable=True)  # NULL means use global default
    review_per_day = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('ix_decks_user_id_name', 'user_id', 'name'),
    )


class Card(Base):
    """
    Card model with front/back content (REQ-2).
    PRD Line 417-426.
    """
    __tablename__ = 'cards'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    deck_id = Column(Integer, ForeignKey('decks.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Card content
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    notes = Column(Text, nullable=True)
    
    # Card state (REQ-2, line 45)
    suspended = Column(Boolean, default=False, nullable=False, index=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    deck = relationship("Deck", back_populates="cards")
    tags = relationship("Tag", secondary=card_tags, back_populates="cards")
    sched_state = relationship("SchedState", back_populates="card", uselist=False, cascade="all, delete-orphan")
    review_logs = relationship("ReviewLog", back_populates="card", cascade="all, delete-orphan")
    
    # Indexes for search and filtering
    __table_args__ = (
        Index('ix_cards_user_deck', 'user_id', 'deck_id'),
        Index('ix_cards_suspended', 'suspended'),
    )


class Tag(Base):
    """
    Tag model for categorizing cards (REQ-3).
    PRD Line 428-432.
    """
    __tablename__ = 'tags'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User")
    cards = relationship("Card", secondary=card_tags, back_populates="tags")
    
    # Indexes
    __table_args__ = (
        Index('ix_tags_user_name', 'user_id', 'name', unique=True),
    )


class SchedState(Base):
    """
    Scheduling state for SM-2 algorithm (REQ-4).
    PRD Line 434-448.
    """
    __tablename__ = 'sched_states'
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey('cards.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # SM-2 state (REQ-4, lines 58-68)
    state = Column(String(20), default='new', nullable=False, index=True)  # 'new', 'learning', 'review'
    due_at = Column(DateTime, nullable=False, index=True)
    
    # SM-2 algorithm parameters
    interval_days = Column(Float, default=0.0, nullable=False)
    ease_factor = Column(Float, default=2.5, nullable=False)
    
    # Learning state tracking
    learning_step = Column(Integer, default=0, nullable=False)  # Current step in learning_steps
    lapses = Column(Integer, default=0, nullable=False)  # Number of times card has lapsed
    
    # Optimistic concurrency control (REQ-4, line 466)
    version = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    card = relationship("Card", back_populates="sched_state")
    user = relationship("User")
    
    # Indexes for queue queries (PRD lines 469-479)
    __table_args__ = (
        Index('ix_sched_due', 'user_id', 'state', 'due_at'),
        CheckConstraint('ease_factor >= 1.3 AND ease_factor <= 3.0', name='check_ease_factor'),
    )


class ReviewLog(Base):
    """
    Log of all review actions for analytics (REQ-9).
    PRD Line 450-455.
    """
    __tablename__ = 'review_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey('cards.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    
    # Review details
    rating = Column(String(10), nullable=False)  # 'again', 'good', 'easy'
    state_before = Column(String(20), nullable=False)
    state_after = Column(String(20), nullable=False)
    
    # Timing
    time_taken_ms = Column(Integer, nullable=True)
    
    # Scheduling snapshot
    interval_before = Column(Float, nullable=False)
    interval_after = Column(Float, nullable=False)
    ease_factor_before = Column(Float, nullable=False)
    ease_factor_after = Column(Float, nullable=False)
    
    reviewed_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    # Relationships
    card = relationship("Card", back_populates="review_logs")
    user = relationship("User")
    
    # Indexes for stats queries
    __table_args__ = (
        Index('ix_review_logs_user_date', 'user_id', 'reviewed_at'),
    )


class DailyCounter(Base):
    """
    Daily counters for limits and stats (REQ-6).
    PRD Line 457-463.
    """
    __tablename__ = 'daily_counters'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    date = Column(DateTime, nullable=False)  # Date at 00:00 in user's timezone
    
    # Counters
    introduced_new = Column(Integer, default=0, nullable=False)
    reviews_done = Column(Integer, default=0, nullable=False)
    again_count = Column(Integer, default=0, nullable=False)
    good_count = Column(Integer, default=0, nullable=False)
    easy_count = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="daily_counters")
    
    # Indexes
    __table_args__ = (
        Index('ix_daily_counters_user_date', 'user_id', 'date', unique=True),
    )


class UserSettings(Base):
    """
    User-specific settings (REQ-10, REQ-11).
    PRD Line implied from requirements.
    """
    __tablename__ = 'user_settings'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    
    # Learning settings (can override defaults)
    learning_steps = Column(String(100), default='10,1440', nullable=False)  # minutes: 10m, 1d
    new_per_day = Column(Integer, default=15, nullable=True)  # NULL means use global default
    review_per_day = Column(Integer, default=200, nullable=True)  # NULL means use global default
    
    # UI settings
    dark_mode = Column(Boolean, default=False, nullable=False)
    music_enabled = Column(Boolean, default=False, nullable=False)
    music_volume = Column(Float, default=0.5, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="settings")
