"""
Additional Pydantic schemas for Phase 2: Review Session
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field


# Review Session Schemas

class ReviewSessionStart(BaseModel):
    """Request to start a review session (legacy format)."""
    deck_ids: Optional[List[int]] = Field(
        None, 
        description="Optional list of deck IDs to review from"
    )
    
    # Phase 4 compatibility
    scope: Optional[str] = Field(
        None,
        description="Optional: 'all' or 'deck' for Phase 4 sessions"
    )
    deck_id: Optional[int] = Field(
        None,
        description="Optional: single deck ID for scope='deck'"
    )


class QueueStatsResponse(BaseModel):
    """Queue statistics and daily progress."""
    due_counts: Dict[str, int] = Field(
        description="Counts by category: learning, review, new"
    )
    limits: Dict[str, int] = Field(
        description="Daily limits: new_per_day, review_per_day"
    )
    today: Dict[str, Any] = Field(
        description="Today's progress: reviews_done, introduced_new, etc."
    )
    remaining: Dict[str, int] = Field(
        description="Remaining slots: reviews, new"
    )
    total_due: int = Field(
        description="Total cards in today's queue"
    )


class ReviewSessionResponse(BaseModel):
    """Response when getting a card to review."""
    card: Optional[Any] = Field(  # CardResponse from Phase 1.4
        None,
        description="Card to review, or None if queue is empty"
    )
    queue_stats: QueueStatsResponse = Field(
        description="Current queue statistics"
    )
    preview_times: Optional[Dict[str, str]] = Field(
        None,
        description="Preview of next review times for each rating (ISO format)"
    )


class ReviewAnswerRequest(BaseModel):
    """Request to submit a card rating."""
    card_id: int = Field(description="Card ID being rated")
    rating: str = Field(description="Rating: again, good, or easy")
    deck_ids: Optional[List[int]] = Field(
        None,
        description="Optional deck filter for next card"
    )


class SchedStateUpdate(BaseModel):
    """Updated scheduling state after rating."""
    state: str = Field(description="New state: new, learning, or review")
    due_at: str = Field(description="Next due date (ISO format)")
    interval_days: float = Field(description="Interval in days")
    ease_factor: float = Field(description="Ease factor")


class ReviewAnswerResponse(BaseModel):
    """Response after submitting a card rating."""
    updated_state: SchedStateUpdate = Field(
        description="Updated scheduling state"
    )
    queue_stats: QueueStatsResponse = Field(
        description="Updated queue statistics"
    )
    next_card: Optional[Any] = Field(  # CardResponse
        None,
        description="Next card to review, or None if done"
    )
    preview_times: Optional[Dict[str, str]] = Field(
        None,
        description="Preview times for next card ratings"
    )


# Phase 4: Enhanced Session Schemas

class CardStubResponse(BaseModel):
    """Minimal card info for session queue."""
    id: int
    deck_id: int
    front_preview: str  # Keep for backward compatibility
    front: str  # Full front content for review
    back: str   # Full back content for review
    deck_name: str  # Deck name for display
    state: str
    tags: List[str]
    due_at: Optional[str] = Field(None, description="Due timestamp in ISO format")
    created_at: str = Field(description="Creation timestamp in ISO format")


class SessionSectionsResponse(BaseModel):
    """Three-section structured session."""
    new: List[CardStubResponse]
    learning: List[CardStubResponse]
    review: List[CardStubResponse]


class DeckLimitsResponse(BaseModel):
    """Per-deck limit tracking."""
    new_cap: int
    review_cap: int
    new_used: int
    review_used: int


class SessionMetaResponse(BaseModel):
    """Session metadata and applied limits."""
    total_new: int
    total_learning: int
    total_review: int
    deck_order: List[str]
    global_limits: Dict[str, int]
    per_deck_limits: Dict[int, DeckLimitsResponse]


class SessionBuildRequest(BaseModel):
    """Request to build a structured session."""
    scope: str = Field(description="'all' for All Decks, 'deck' for Specific Deck")
    deck_id: Optional[int] = Field(None, description="Required if scope='deck'")
    

class SessionBuildResponse(BaseModel):
    """Response with structured session queue."""
    sections: SessionSectionsResponse
    meta: SessionMetaResponse
    session_id: str = Field(description="Unique session identifier")


class ReviewAnswerEnhancedRequest(BaseModel):
    """Enhanced request to submit a card rating with session context."""
    card_id: int = Field(description="Card ID being rated")
    rating: str = Field(description="Rating: again, good, or easy")
    section: str = Field(description="Current section: new, learning, or review")
    elapsed_ms: Optional[int] = Field(None, description="Time spent on card in milliseconds")
    session_id: Optional[str] = Field(None, description="Session identifier")


class ReviewAnswerEnhancedResponse(BaseModel):
    """Enhanced response after submitting a card rating."""
    updated: Dict[str, Any] = Field(description="Updated card state (state, due_at, interval_days, ease_factor)")
    log_written: bool = Field(description="True if this rating was logged (Good/Easy only)")
    repeat_scheduled: bool = Field(description="True if 'Again' rating scheduled in-session repeat")


class SessionStatsResponse(BaseModel):
    """Session-based queue statistics showing counts per section."""
    sections: Dict[str, int] = Field(
        description="Card counts by section: new, learning, review"
    )
    limits: Dict[str, int] = Field(
        description="Daily limits: new_per_day, review_per_day"
    )
    today: Dict[str, Any] = Field(
        description="Today's progress: reviews_done, introduced_new, etc."
    )
    remaining: Dict[str, int] = Field(
        description="Remaining slots: reviews, new"
    )
    total_available: int = Field(
        description="Total cards available for session"
    )
    deck_breakdown: Optional[Dict[str, Dict[str, int]]] = Field(
        None,
        description="Per-deck breakdown of section counts"
    )