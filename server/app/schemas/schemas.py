"""
Pydantic schemas for API request/response validation.
Based on PRD requirements REQ-1, REQ-2, REQ-3.
"""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# ============================================================================
# Deck Schemas (REQ-1)
# ============================================================================

class DeckBase(BaseModel):
    """Base deck schema with common fields."""
    name: str = Field(..., min_length=1, max_length=200, description="Deck name")
    description: Optional[str] = Field(None, description="Optional deck description")
    new_per_day: Optional[int] = Field(None, ge=0, le=1000, description="Per-deck new cards limit")
    review_per_day: Optional[int] = Field(None, ge=0, le=1000, description="Per-deck review limit")


class DeckCreate(DeckBase):
    """Schema for creating a new deck."""
    pass


class DeckUpdate(BaseModel):
    """Schema for updating a deck (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    new_per_day: Optional[int] = Field(None, ge=0, le=1000)
    review_per_day: Optional[int] = Field(None, ge=0, le=1000)


class DeckResponse(DeckBase):
    """Schema for deck responses including computed fields."""
    id: int
    user_id: int
    card_count: int = Field(default=0, description="Total cards in deck")
    due_count: int = Field(default=0, description="Cards due for review")
    new_count: int = Field(default=0, description="New cards not yet studied")
    learning_count: int = Field(default=0, description="Learning cards due now")
    review_count: int = Field(default=0, description="Review cards due now")
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DeckListResponse(BaseModel):
    """Schema for list of decks."""
    decks: List[DeckResponse]
    total: int


class DeckStats(BaseModel):
    """Schema for deck statistics."""
    deck_id: int
    deck_name: str
    total_cards: int
    new_cards: int
    learning_cards: int
    review_cards: int
    suspended_cards: int
    due_today: int
    average_ease: float
    retention_rate: float


# ============================================================================
# Tag Schemas (REQ-3)
# ============================================================================

class TagBase(BaseModel):
    """Base tag schema."""
    name: str = Field(..., min_length=1, max_length=100, description="Tag name")


class TagCreate(TagBase):
    """Schema for creating a new tag."""
    pass


class TagResponse(TagBase):
    """Schema for tag responses."""
    id: int
    user_id: int
    card_count: int = Field(default=0, description="Number of cards with this tag")
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class TagListResponse(BaseModel):
    """Schema for list of tags."""
    tags: List[TagResponse]
    total: int


# ============================================================================
# Card Schemas (REQ-2)
# ============================================================================

class CardBase(BaseModel):
    """Base card schema with common fields."""
    front: str = Field(..., min_length=1, description="Front of the card")
    back: str = Field(..., min_length=1, description="Back of the card")
    notes: Optional[str] = Field(None, description="Optional notes")


class CardCreate(CardBase):
    """Schema for creating a new card."""
    deck_id: int = Field(..., description="Deck to add card to")
    tag_ids: List[int] = Field(default_factory=list, description="Tag IDs to associate")


class CardUpdate(BaseModel):
    """Schema for updating a card (all fields optional)."""
    front: Optional[str] = Field(None, min_length=1)
    back: Optional[str] = Field(None, min_length=1)
    notes: Optional[str] = None
    deck_id: Optional[int] = None
    suspended: Optional[bool] = None
    tag_ids: Optional[List[int]] = None


class CardResponse(CardBase):
    """Schema for card responses."""
    id: int
    user_id: int
    deck_id: int
    deck_name: str = Field(default="", description="Name of the deck")
    suspended: bool
    tags: List[TagResponse] = Field(default_factory=list)
    
    # Scheduling info (if available)
    state: Optional[str] = Field(None, description="Scheduling state: new, learning, review")
    due_at: Optional[datetime] = Field(None, description="When card is due")
    interval_days: Optional[float] = Field(None, description="Current interval in days")
    
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class CardListResponse(BaseModel):
    """Schema for paginated list of cards."""
    cards: List[CardResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


class CardBrowseFilter(BaseModel):
    """Schema for browse/search filters (REQ-8)."""
    deck_ids: Optional[List[int]] = Field(None, description="Filter by deck IDs")
    tag_ids: Optional[List[int]] = Field(None, description="Filter by tag IDs")
    state: Optional[str] = Field(None, description="Filter by state: new, learning, review")
    suspended: Optional[bool] = Field(None, description="Filter by suspended status")
    search: Optional[str] = Field(None, description="Search in front/back text")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(50, ge=1, le=200, description="Items per page")
    sort_by: str = Field("created_at", description="Sort field")
    sort_order: str = Field("desc", description="Sort order: asc or desc")


# ============================================================================
# Scheduling Schemas (REQ-4, REQ-5)
# ============================================================================

class SchedStateResponse(BaseModel):
    """Schema for scheduling state."""
    card_id: int
    state: str
    due_at: datetime
    interval_days: float
    ease_factor: float
    learning_step: int
    lapses: int
    version: int
    
    model_config = ConfigDict(from_attributes=True)


class ReviewRating(BaseModel):
    """Schema for submitting a review rating (REQ-5)."""
    rating: str = Field(..., description="Rating: again, good, or easy")
    time_taken_ms: Optional[int] = Field(None, ge=0, description="Time taken in milliseconds")
    version: int = Field(..., description="Version for optimistic locking")


class ReviewResponse(BaseModel):
    """Schema for review response after rating."""
    card_id: int
    new_state: str
    new_due_at: datetime
    new_interval_days: float
    new_ease_factor: float
    cards_remaining: int


class QueueStats(BaseModel):
    """Schema for today's queue statistics (REQ-6)."""
    learning_due: int = Field(description="Cards in learning state due now")
    review_due: int = Field(description="Review cards due today")
    new_available: int = Field(description="New cards available (respecting limits)")
    total_due: int = Field(description="Total cards to study today")
    introduced_today: int = Field(description="New cards already introduced today")
    reviews_done_today: int = Field(description="Reviews completed today")


# ============================================================================
# Stats Schemas (REQ-9)
# ============================================================================

class DailyStats(BaseModel):
    """Schema for daily statistics."""
    date: datetime
    introduced_new: int
    reviews_done: int
    again_count: int
    good_count: int
    easy_count: int
    
    model_config = ConfigDict(from_attributes=True)


class StatsResponse(BaseModel):
    """Schema for overall statistics."""
    total_cards: int
    total_decks: int
    cards_by_state: dict = Field(description="Count of cards by state")
    daily_stats: List[DailyStats] = Field(description="Recent daily statistics")
    streak_days: int = Field(description="Current study streak")


# ============================================================================
# User Settings Schemas (REQ-10, REQ-11)
# ============================================================================

class UserSettingsResponse(BaseModel):
    """Schema for user settings."""
    learning_steps: str
    new_per_day: Optional[int] = None
    review_per_day: Optional[int] = None
    dark_mode: bool  # Deprecated: use theme_mode instead (kept for backward compatibility)
    music_enabled: bool
    music_volume: float
    visual_theme: str = 'mizuiro'
    theme_mode: str = 'day'  # Phase 3: 'day' or 'night'
    
    # Session configuration (Phase 4)
    max_session_size: int = 50
    preferred_session_scope: str = 'all'
    preferred_deck_ids: List[int] = Field(default_factory=list)
    new_section_limit: int = 15
    learning_section_limit: int = 20
    review_section_limit: int = 30
    auto_start_sessions: bool = False
    
    model_config = ConfigDict(from_attributes=True)


class UserSettingsUpdate(BaseModel):
    """Schema for updating user settings."""
    learning_steps: Optional[str] = None
    new_per_day: Optional[int] = Field(None, ge=1, le=1000)
    review_per_day: Optional[int] = Field(None, ge=1, le=1000)
    dark_mode: Optional[bool] = None  # Deprecated: use theme_mode instead
    music_enabled: Optional[bool] = None
    music_volume: Optional[float] = Field(None, ge=0.0, le=1.0)
    visual_theme: Optional[str] = None
    theme_mode: Optional[str] = Field(None, pattern='^(day|night)$', description="Theme mode: 'day' or 'night'")
    
    # Session configuration (Phase 4)
    max_session_size: Optional[int] = Field(None, ge=5, le=200, description="Maximum cards per session")
    preferred_session_scope: Optional[str] = Field(None, pattern='^(all|deck)$', description="Session scope: 'all' or 'deck'")
    preferred_deck_ids: Optional[List[int]] = Field(None, description="Preferred deck IDs for deck sessions")
    new_section_limit: Optional[int] = Field(None, ge=0, le=50, description="Max new cards per session")
    learning_section_limit: Optional[int] = Field(None, ge=0, le=100, description="Max learning cards per session")
    review_section_limit: Optional[int] = Field(None, ge=0, le=150, description="Max review cards per session")
    auto_start_sessions: Optional[bool] = Field(None, description="Auto-start next session after completion")


# ============================================================================
# Error Schemas
# ============================================================================

class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    error_code: Optional[str] = None
