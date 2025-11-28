"""
Review Session API endpoints.
Implements REQ-5: Review Session UI from PRD.
"""
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.database import User, Card, Deck
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
    QueueStatsResponse,
    # Phase 4 schemas
    SessionBuildRequest,
    SessionBuildResponse,
    SessionSectionsResponse,
    SessionStatsResponse,
    SessionMetaResponse,
    CardStubResponse,
    DeckLimitsResponse,
    ReviewAnswerEnhancedRequest,
    ReviewAnswerEnhancedResponse
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


def card_stub_to_response(stub, db: Session) -> CardStubResponse:
    """Convert queue_builder CardStub to API response."""
    # Fetch full card data from database
    card = db.query(Card).filter(Card.id == stub.id).first()
    deck = db.query(Deck).filter(Deck.id == stub.deck_id).first()
    
    return CardStubResponse(
        id=stub.id,
        deck_id=stub.deck_id,
        front_preview=stub.front_preview,
        front=card.front if card else stub.front_preview,
        back=card.back if card else "",
        deck_name=deck.name if deck else f"Deck {stub.deck_id}",
        state=stub.state,
        tags=stub.tags,
        due_at=stub.due_at.isoformat() if stub.due_at else None,
        created_at=stub.created_at.isoformat() if stub.created_at else datetime.utcnow().isoformat()
    )


def generate_session_id() -> str:
    """Generate a unique session ID."""
    import uuid
    return f"session_{uuid.uuid4().hex[:16]}"


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


@router.get("/stats/session", response_model=SessionStatsResponse)
def get_session_stats(
    scope: str = Query("all", description="'all' for All Decks, 'deck' for Specific Deck"),
    deck_id: Optional[int] = Query(None, description="Required if scope='deck'"),
    db: Session = Depends(get_db)
):
    """
    Get session-based queue statistics showing counts per section (New, Learning, Review).
    
    Phase 4 PRD implementation: Shows structured session statistics instead of single next-card logic.
    """
    user = get_default_user(db)
    
    # Validate inputs
    if scope not in ["all", "deck"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scope must be 'all' or 'deck'"
        )
    
    if scope == "deck" and deck_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="deck_id required when scope='deck'"
        )
    
    try:
        # Build session to get section counts
        sections, meta = queue_builder.build_session_queue(
            db, user.id, scope, deck_id
        )
        
        # Get traditional stats for limits and daily progress
        traditional_stats = queue_builder.get_queue_stats(db, user.id)
        
        # Structure section counts
        section_counts = {
            "new": len(sections.new),
            "learning": len(sections.learning), 
            "review": len(sections.review)
        }
        
        # Calculate total available (respecting daily limits)
        total_available = section_counts["learning"]  # Learning unlimited
        total_available += min(section_counts["review"], traditional_stats["remaining"]["reviews"])
        total_available += min(section_counts["new"], traditional_stats["remaining"]["new"])
        
        # Optional: Per-deck breakdown for All Decks sessions
        deck_breakdown = None
        if scope == "all" and len(sections.new + sections.learning + sections.review) > 0:
            deck_breakdown = {}
            all_cards = sections.new + sections.learning + sections.review
            deck_names = {card.deck_id: f"Deck {card.deck_id}" for card in all_cards}
            
            for deck_id_key, deck_name in deck_names.items():
                deck_breakdown[deck_name] = {
                    "new": len([c for c in sections.new if c.deck_id == deck_id_key]),
                    "learning": len([c for c in sections.learning if c.deck_id == deck_id_key]),
                    "review": len([c for c in sections.review if c.deck_id == deck_id_key])
                }
        
        return SessionStatsResponse(
            sections=section_counts,
            limits=traditional_stats["limits"],
            today=traditional_stats["today"],
            remaining=traditional_stats["remaining"],
            total_available=total_available,
            deck_breakdown=deck_breakdown
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get session stats: {str(e)}"
        )


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


@router.post("/session/build", response_model=SessionBuildResponse)
def build_session(
    request: SessionBuildRequest,
    db: Session = Depends(get_db)
):
    """
    Build a structured Phase 4 session with three sections (New → Learning → Review).
    
    Phase 4 PRD implementation:
    - All Decks: Uses global limits + per-deck caps, round-robin allocation
    - Specific Deck: Uses only that deck's limits, ignores global limits
    """
    user = get_default_user(db)
    
    # Validate request
    if request.scope not in ["all", "deck"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="scope must be 'all' or 'deck'"
        )
    
    if request.scope == "deck" and request.deck_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="deck_id required when scope='deck'"
        )
    
    try:
        # Build structured session using Phase 4 queue builder
        sections, meta = queue_builder.build_session_queue(
            db=db,
            user_id=user.id,
            scope=request.scope,
            deck_id=request.deck_id
        )
        
        # Convert to API response format
        sections_response = SessionSectionsResponse(
            new=[card_stub_to_response(stub, db) for stub in sections.new],
            learning=[card_stub_to_response(stub, db) for stub in sections.learning],
            review=[card_stub_to_response(stub, db) for stub in sections.review]
        )
        
        # Convert per-deck limits
        per_deck_limits = {}
        for deck_id, limits in meta.per_deck_limits.items():
            per_deck_limits[deck_id] = DeckLimitsResponse(
                new_cap=limits.new_cap,
                review_cap=limits.review_cap,
                new_used=limits.new_used,
                review_used=limits.review_used
            )
        
        meta_response = SessionMetaResponse(
            total_new=meta.total_new,
            total_learning=meta.total_learning,
            total_review=meta.total_review,
            deck_order=meta.deck_order,
            global_limits=meta.global_limits,
            per_deck_limits=per_deck_limits
        )
        
        session_id = generate_session_id()
        
        return SessionBuildResponse(
            sections=sections_response,
            meta=meta_response,
            session_id=session_id
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build session: {str(e)}"
        )


@router.post("/answer/enhanced", response_model=ReviewAnswerEnhancedResponse)
def answer_card_enhanced(
    answer: ReviewAnswerEnhancedRequest,
    db: Session = Depends(get_db)
):
    """
    Phase 4 enhanced answer endpoint that handles in-session repeats.
    
    Updates scheduler state on every rating but only logs Good/Easy ratings.
    'Again' ratings trigger client-side reinsertion logic.
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
    
    # Validate rating and section
    if answer.rating not in ["again", "good", "easy"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid rating: {answer.rating}"
        )
    
    if answer.section not in ["new", "learning", "review"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid section: {answer.section}"
        )
    
    try:
        # Process rating with scheduler (always updates state)
        updated_state = scheduler.process_rating(
            db, card, answer.rating, user.id
        )
        
        # Determine if this was logged (Good/Easy only)
        log_written = answer.rating in ["good", "easy"]
        
        # Determine if repeat was scheduled (Again only)
        repeat_scheduled = answer.rating == "again"
        
        # Build response
        return ReviewAnswerEnhancedResponse(
            updated={
                "state": updated_state.state if hasattr(updated_state, 'state') else card.sched_state.state,
                "due_at": updated_state.due_at.isoformat() if hasattr(updated_state, 'due_at') else card.sched_state.due_at.isoformat(),
                "interval_days": updated_state.interval_days if hasattr(updated_state, 'interval_days') else card.sched_state.interval_days,
                "ease_factor": updated_state.ease_factor if hasattr(updated_state, 'ease_factor') else card.sched_state.ease_factor
            },
            log_written=log_written,
            repeat_scheduled=repeat_scheduled
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
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
