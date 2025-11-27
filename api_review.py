"""
Review Session API endpoints.
Implements REQ-5: Review Session UI from PRD.
"""
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.database import User, Card
from app.schemas.schemas import CardResponse

# Import review-specific schemas (these are at root level)
import sys
import os
# Ensure root directory is in path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from schemas_review import (
    ReviewSessionStart,
    ReviewSessionResponse,
    ReviewAnswerRequest,
    ReviewAnswerResponse,
    QueueStatsResponse
)

# Import scheduler and queue_builder from root level
import scheduler
import queue_builder

router = APIRouter()


def get_default_user(db: Session) -> User:
    """Get default user for POC (single-user assumption)."""
    user = db.query(User).filter(User.username == "default_user").first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default user not found. Run migrations."
        )
    return user


def build_card_response(card: Card, db: Session) -> CardResponse:
    """Build a CardResponse with all related data."""
    from app.api.cards import build_card_response as cards_build
    return cards_build(card, db)


@router.get("/stats", response_model=QueueStatsResponse)
def get_queue_stats(
    deck_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get queue statistics and daily progress.
    
    PRD REQ-6, REQ-9: Show due counts and today's stats.
    """
    user = get_default_user(db)
    
    stats = queue_builder.get_queue_stats(db, user.id)
    
    # If filtering by decks, get filtered counts
    if deck_ids:
        filtered_counts = queue_builder.get_queue_counts(db, user.id, deck_ids)
        stats["due_counts"] = filtered_counts
    
    return QueueStatsResponse(**stats)


@router.post("/start", response_model=dict)
def start_review_session(
    session_start: ReviewSessionStart,
    db: Session = Depends(get_db)
):
    """
    Start a review session and get the first card.
    
    PRD REQ-5, REQ-6: Begin session with queue priorities.
    Returns ReviewCard format (card + scheduling info).
    """
    user = get_default_user(db)
    
    # Get next card from queue
    next_card = queue_builder.get_next_card(
        db, 
        user.id, 
        session_start.deck_ids
    )
    
    if not next_card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No cards due for review"
        )
    
    # Build card response
    card_data = build_card_response(next_card, db)
    
    # Get scheduling state
    sched_state = next_card.sched_state
    if not sched_state:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Card has no scheduling state"
        )
    
    # Return ReviewCard format (card nested inside with scheduling)
    return {
        "card": card_data,
        "due_at": sched_state.due_at.isoformat(),
        "interval_days": sched_state.interval_days,
        "ease_factor": sched_state.ease_factor
    }


@router.get("/next", response_model=ReviewSessionResponse)
def get_next_card(
    deck_ids: Optional[List[int]] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get the next card to review.
    
    PRD REQ-5: Continue session with next card.
    """
    user = get_default_user(db)
    
    # Get next card from queue
    next_card = queue_builder.get_next_card(db, user.id, deck_ids)
    
    if not next_card:
        # No more cards - return empty response
        stats = queue_builder.get_queue_stats(db, user.id)
        return ReviewSessionResponse(
            card=None,
            queue_stats=stats,
            preview_times=None
        )
    
    # Build response
    card_response = build_card_response(next_card, db)
    
    # Get queue stats
    stats = queue_builder.get_queue_stats(db, user.id)
    
    # Calculate preview times
    sched_state = next_card.sched_state
    if sched_state:
        preview_times = scheduler.get_next_review_times(
            sched_state.state,
            sched_state.interval_days,
            sched_state.ease_factor,
            sched_state.learning_step
        )
    else:
        preview_times = scheduler.get_next_review_times(
            "new", 0.0, scheduler.EF_INITIAL, 0
        )
    
    return ReviewSessionResponse(
        card=card_response,
        queue_stats=stats,
        preview_times={
            "again": preview_times["again"].isoformat(),
            "good": preview_times["good"].isoformat(),
            "easy": preview_times["easy"].isoformat()
        }
    )


@router.post("/answer", response_model=dict)
def answer_card(
    answer: ReviewAnswerRequest,
    db: Session = Depends(get_db)
):
    """
    Submit an answer/rating for a card.
    
    PRD REQ-4, REQ-5: Process rating with SM-2 algorithm.
    Returns RatingResponse format (next_card, remaining, session_complete).
    """
    user = get_default_user(db)
    
    # Get card
    card = db.query(Card).filter(
        Card.id == answer.card_id,
        Card.user_id == user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card {answer.card_id} not found"
        )
    
    # Validate rating
    if answer.rating not in ["again", "good", "easy"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid rating: {answer.rating}"
        )
    
    # Process rating with scheduler
    try:
        updated_state = scheduler.process_rating(
            db, card, answer.rating, user.id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Get updated queue stats
    stats = queue_builder.get_queue_stats(db, user.id)
    
    # Get next card
    next_card = queue_builder.get_next_card(db, user.id, answer.deck_ids)
    
    # Build next_card response in ReviewCard format (with nested card + scheduling)
    next_card_response = None
    if next_card:
        card_data = build_card_response(next_card, db)
        sched_state = next_card.sched_state
        if sched_state:
            next_card_response = {
                "card": card_data,
                "due_at": sched_state.due_at.isoformat(),
                "interval_days": sched_state.interval_days,
                "ease_factor": sched_state.ease_factor
            }
    
    # Return response matching frontend RatingResponse interface
    return {
        "next_card": next_card_response,
        "remaining": stats["total_due"],
        "session_complete": next_card_response is None
    }
