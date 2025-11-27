"""
Additional Pydantic schemas for Phase 2: Review Session
"""
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from pydantic import BaseModel, Field


# Review Session Schemas

class ReviewSessionStart(BaseModel):
    """Request to start a review session."""
    deck_ids: Optional[List[int]] = Field(
        None, 
        description="Optional list of deck IDs to review from"
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
