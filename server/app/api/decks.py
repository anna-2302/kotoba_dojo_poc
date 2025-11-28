"""
Deck CRUD API endpoints.
Implements REQ-1: Decks from PRD.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import sys
import os

# Add parent directory to path to import root-level modules
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.db.session import get_db
from app.models.database import Deck, Card, SchedState, User, DailyCounter
from app.schemas.schemas import (
    DeckCreate,
    DeckUpdate,
    DeckResponse,
    DeckListResponse,
    DeckStats
)
from queue_builder import get_global_limits

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


@router.get("/", response_model=DeckListResponse)
def list_decks(
    db: Session = Depends(get_db)
):
    """
    List all decks for the user.
    
    REQ-1: Returns all decks with card counts and due counts.
    Due counts respect daily limits.
    """
    user = get_default_user(db)
    
    # Get today's counter to see how many cards have been reviewed
    today = datetime.utcnow().date()
    counter = db.query(DailyCounter).filter(
        DailyCounter.user_id == user.id,
        DailyCounter.date == today
    ).first()
    
    if not counter:
        # Create today's counter if it doesn't exist
        counter = DailyCounter(
            user_id=user.id,
            date=today,
            introduced_new=0,
            reviews_done=0,
            again_count=0,
            good_count=0,
            easy_count=0
        )
        db.add(counter)
        db.commit()
        db.refresh(counter)
    
    # Get decks with card counts
    decks = db.query(Deck).filter(Deck.user_id == user.id).all()
    
    deck_responses = []
    for deck in decks:
        # Count total cards
        card_count = db.query(func.count(Card.id)).filter(
            Card.deck_id == deck.id
        ).scalar() or 0
        
        # Count new cards available (not yet introduced)
        new_count = db.query(func.count(Card.id)).filter(
            Card.deck_id == deck.id,
            Card.suspended == False
        ).join(SchedState, Card.id == SchedState.card_id, isouter=True).filter(
            (SchedState.state == 'new') | (SchedState.state == None)
        ).scalar() or 0
        
        # Count learning cards due now (always shown, unlimited)
        now = datetime.utcnow()
        learning_due = db.query(func.count(Card.id)).filter(
            Card.deck_id == deck.id,
            Card.suspended == False
        ).join(SchedState, Card.id == SchedState.card_id).filter(
            SchedState.state == 'learning',
            SchedState.due_at <= now
        ).scalar() or 0
        
        # Count review cards due now (before applying limits)
        review_due = db.query(func.count(Card.id)).filter(
            Card.deck_id == deck.id,
            Card.suspended == False
        ).join(SchedState, Card.id == SchedState.card_id).filter(
            SchedState.state == 'review',
            SchedState.due_at <= now
        ).scalar() or 0
        
        # For deck listing, show the total cards that are technically "due"
        # (learning + review + new), without applying global daily limits
        # The actual queue will respect limits, but users should see all pending work
        due_count = learning_due + review_due + new_count
        
        # Create response
        deck_dict = {
            "id": deck.id,
            "user_id": deck.user_id,
            "name": deck.name,
            "description": deck.description,
            "new_per_day": deck.new_per_day,
            "review_per_day": deck.review_per_day,
            "card_count": card_count,
            "due_count": due_count,
            "new_count": new_count,
            "learning_count": learning_due,
            "review_count": review_due,
            "created_at": deck.created_at,
            "updated_at": deck.updated_at
        }
        deck_responses.append(DeckResponse(**deck_dict))
    
    return DeckListResponse(
        decks=deck_responses,
        total=len(deck_responses)
    )


@router.post("/", response_model=DeckResponse, status_code=status.HTTP_201_CREATED)
def create_deck(
    deck_in: DeckCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new deck.
    
    REQ-1: User can create a deck with a name.
    """
    user = get_default_user(db)
    
    # Create deck
    deck = Deck(
        user_id=user.id,
        name=deck_in.name,
        description=deck_in.description,
        new_per_day=deck_in.new_per_day,
        review_per_day=deck_in.review_per_day
    )
    
    db.add(deck)
    db.commit()
    db.refresh(deck)
    
    # Return with counts
    deck_dict = {
        "id": deck.id,
        "user_id": deck.user_id,
        "name": deck.name,
        "description": deck.description,
        "new_per_day": deck.new_per_day,
        "review_per_day": deck.review_per_day,
        "card_count": 0,
        "due_count": 0,
        "new_count": 0,
        "created_at": deck.created_at,
        "updated_at": deck.updated_at
    }
    
    return DeckResponse(**deck_dict)


@router.get("/{deck_id}", response_model=DeckResponse)
def get_deck(
    deck_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific deck by ID.
    
    REQ-1: Deck shows card count and due count.
    """
    user = get_default_user(db)
    
    deck = db.query(Deck).filter(
        Deck.id == deck_id,
        Deck.user_id == user.id
    ).first()
    
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck {deck_id} not found"
        )
    
    # Count cards
    card_count = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id
    ).scalar() or 0
    
    # Count new cards
    new_count = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id, isouter=True).filter(
        (SchedState.state == 'new') | (SchedState.state == None)
    ).scalar() or 0
    
    # Count learning and review cards due now
    from datetime import datetime
    now = datetime.utcnow()
    learning_due = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state == 'learning',
        SchedState.due_at <= now
    ).scalar() or 0
    
    review_due = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state == 'review',
        SchedState.due_at <= now
    ).scalar() or 0
    
    due_count = learning_due + review_due + new_count
    
    deck_dict = {
        "id": deck.id,
        "user_id": deck.user_id,
        "name": deck.name,
        "description": deck.description,
        "new_per_day": deck.new_per_day,
        "review_per_day": deck.review_per_day,
        "card_count": card_count,
        "due_count": due_count,
        "new_count": new_count,
        "learning_count": learning_due,
        "review_count": review_due,
        "created_at": deck.created_at,
        "updated_at": deck.updated_at
    }
    
    return DeckResponse(**deck_dict)


@router.put("/{deck_id}", response_model=DeckResponse)
def update_deck(
    deck_id: int,
    deck_in: DeckUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a deck.
    
    REQ-1: Rename deck, update description or limits.
    """
    user = get_default_user(db)
    
    deck = db.query(Deck).filter(
        Deck.id == deck_id,
        Deck.user_id == user.id
    ).first()
    
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck {deck_id} not found"
        )
    
    # Update fields if provided
    update_data = deck_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deck, field, value)
    
    db.commit()
    db.refresh(deck)
    
    # Return with counts
    card_count = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id
    ).scalar() or 0
    
    new_count = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id, isouter=True).filter(
        (SchedState.state == 'new') | (SchedState.state == None)
    ).scalar() or 0
    
    from datetime import datetime
    now = datetime.utcnow()
    learning_due = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state == 'learning',
        SchedState.due_at <= now
    ).scalar() or 0
    
    review_due = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck.id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state == 'review',
        SchedState.due_at <= now
    ).scalar() or 0
    
    due_count = learning_due + review_due + new_count
    
    deck_dict = {
        "id": deck.id,
        "user_id": deck.user_id,
        "name": deck.name,
        "description": deck.description,
        "new_per_day": deck.new_per_day,
        "review_per_day": deck.review_per_day,
        "card_count": card_count,
        "due_count": due_count,
        "new_count": new_count,
        "learning_count": learning_due,
        "review_count": review_due,
        "created_at": deck.created_at,
        "updated_at": deck.updated_at
    }
    
    return DeckResponse(**deck_dict)


@router.delete("/{deck_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deck(
    deck_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a deck and all its cards.
    
    REQ-1: Delete deck requires confirmation and deletes all cards within.
    Note: Confirmation should be handled by frontend.
    """
    user = get_default_user(db)
    
    deck = db.query(Deck).filter(
        Deck.id == deck_id,
        Deck.user_id == user.id
    ).first()
    
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck {deck_id} not found"
        )
    
    # Delete deck (cascade will delete cards)
    db.delete(deck)
    db.commit()


@router.get("/{deck_id}/stats", response_model=DeckStats)
def get_deck_stats(
    deck_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed statistics for a deck.
    
    Returns card counts by state, average ease factor, and retention rate.
    """
    user = get_default_user(db)
    
    # Verify deck exists
    deck = db.query(Deck).filter(
        Deck.id == deck_id,
        Deck.user_id == user.id
    ).first()
    
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck {deck_id} not found"
        )
    
    from datetime import datetime
    from app.models.database import ReviewLog
    
    # Total cards
    total_cards = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck_id
    ).scalar() or 0
    
    # Suspended cards
    suspended_cards = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck_id,
        Card.suspended == True
    ).scalar() or 0
    
    # Count by state (joining with sched_states)
    new_cards = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck_id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id, isouter=True).filter(
        (SchedState.state == 'new') | (SchedState.state == None)
    ).scalar() or 0
    
    learning_cards = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck_id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state == 'learning'
    ).scalar() or 0
    
    review_cards = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck_id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state == 'review'
    ).scalar() or 0
    
    # Due today (learning + review due now)
    now = datetime.utcnow()
    due_today = db.query(func.count(Card.id)).filter(
        Card.deck_id == deck_id,
        Card.suspended == False
    ).join(SchedState, Card.id == SchedState.card_id).filter(
        SchedState.state.in_(['learning', 'review']),
        SchedState.due_at <= now
    ).scalar() or 0
    
    # Average ease factor (for review cards only)
    avg_ease = db.query(func.avg(SchedState.ease_factor)).join(
        Card, Card.id == SchedState.card_id
    ).filter(
        Card.deck_id == deck_id,
        SchedState.state == 'review'
    ).scalar() or 2.5
    
    # Retention rate (Good+Easy / Total reviews today)
    today = datetime.utcnow().date()
    total_reviews_today = db.query(func.count(ReviewLog.id)).join(
        Card, Card.id == ReviewLog.card_id
    ).filter(
        Card.deck_id == deck_id,
        func.date(ReviewLog.reviewed_at) == today
    ).scalar() or 0
    
    successful_reviews = db.query(func.count(ReviewLog.id)).join(
        Card, Card.id == ReviewLog.card_id
    ).filter(
        Card.deck_id == deck_id,
        func.date(ReviewLog.reviewed_at) == today,
        ReviewLog.rating.in_(['good', 'easy'])
    ).scalar() or 0
    
    retention_rate = (successful_reviews / total_reviews_today * 100) if total_reviews_today > 0 else 0.0
    
    return DeckStats(
        deck_id=deck.id,
        deck_name=deck.name,
        total_cards=total_cards,
        new_cards=new_cards,
        learning_cards=learning_cards,
        review_cards=review_cards,
        suspended_cards=suspended_cards,
        due_today=due_today,
        average_ease=float(avg_ease),
        retention_rate=round(retention_rate, 1)
    )
    
    return None
