"""
Queue Builder Service
Implements REQ-6: Daily Queue and Limits from PRD.

Builds today's review queue based on:
- Due learning cards (unlimited, highest priority)
- Due review cards (up to review_per_day limit)
- New cards (up to new_per_day limit)
"""
from datetime import datetime, date
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from app.models.database import Card, SchedState, User, Deck, DailyCounter, UserSettings


# PRD line 92: Default daily limits
DEFAULT_NEW_PER_DAY = 15
DEFAULT_REVIEW_PER_DAY = 200


def get_daily_limits(db: Session, user_id: int, deck_ids: Optional[List[int]] = None) -> Dict[str, int]:
    """
    Get daily limits for the user.
    
    PRD REQ-6 (lines 91-96): Default limits from user settings.
    If deck_ids specified, use per-deck limits (if set) instead of global.
    
    Args:
        db: Database session
        user_id: User ID
        deck_ids: Optional list of deck IDs to get limits for
        
    Returns:
        Dict with "new_per_day" and "review_per_day"
    """
    # Get user default limits
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == user_id
    ).first()
    
    default_new = settings.new_per_day if settings else DEFAULT_NEW_PER_DAY
    default_review = settings.review_per_day if settings else DEFAULT_REVIEW_PER_DAY
    
    # If specific decks requested, check for per-deck overrides
    if deck_ids:
        decks = db.query(Deck).filter(
            Deck.id.in_(deck_ids),
            Deck.user_id == user_id
        ).all()
        
        # Aggregate deck limits (sum of all deck limits, or use defaults)
        total_new = 0
        total_review = 0
        
        for deck in decks:
            # Use deck-specific limit if set, otherwise use default
            total_new += deck.new_per_day if deck.new_per_day is not None else default_new
            total_review += deck.review_per_day if deck.review_per_day is not None else default_review
        
        return {
            "new_per_day": total_new,
            "review_per_day": total_review
        }
    
    # No specific decks, use global defaults
    return {
        "new_per_day": default_new or DEFAULT_NEW_PER_DAY,
        "review_per_day": default_review or DEFAULT_REVIEW_PER_DAY
    }


def get_today_counter(db: Session, user_id: int, today: date = None) -> DailyCounter:
    """
    Get or create today's daily counter.
    
    Args:
        db: Database session
        user_id: User ID
        today: Today's date (for testing)
        
    Returns:
        DailyCounter for today
    """
    if today is None:
        today = datetime.utcnow().date()
    
    counter = db.query(DailyCounter).filter(
        DailyCounter.user_id == user_id,
        DailyCounter.date == today
    ).first()
    
    if not counter:
        counter = DailyCounter(
            user_id=user_id,
            date=today,
            reviews_done=0,
            introduced_new=0,
            again_count=0,
            good_count=0,
            easy_count=0
        )
        db.add(counter)
        db.commit()
        db.refresh(counter)
    
    return counter


def get_queue_counts(
    db: Session,
    user_id: int,
    deck_ids: Optional[List[int]] = None,
    now: datetime = None
) -> Dict[str, int]:
    """
    Get counts for today's queue by category.
    
    PRD REQ-6 (line 93): Show counts for Learning/Review/New.
    
    Args:
        db: Database session
        user_id: User ID
        deck_ids: Optional list of deck IDs to filter
        now: Current timestamp (for testing)
        
    Returns:
        Dict with "learning", "review", "new" counts
    """
    if now is None:
        now = datetime.utcnow()
    
    # Base query: non-suspended cards
    base_query = db.query(Card).filter(
        Card.user_id == user_id,
        Card.suspended == False
    )
    
    if deck_ids:
        base_query = base_query.filter(Card.deck_id.in_(deck_ids))
    
    # Count learning cards due now
    learning_count = base_query.join(SchedState).filter(
        SchedState.state == "learning",
        SchedState.due_at <= now
    ).count()
    
    # Count review cards due now
    review_count = base_query.join(SchedState).filter(
        SchedState.state == "review",
        SchedState.due_at <= now
    ).count()
    
    # Count new cards (no state or state='new')
    new_count = base_query.outerjoin(SchedState).filter(
        (SchedState.state == "new") | (SchedState.state == None)
    ).count()
    
    return {
        "learning": learning_count,
        "review": review_count,
        "new": new_count
    }


def build_queue(
    db: Session,
    user_id: int,
    deck_ids: Optional[List[int]] = None,
    now: datetime = None
) -> List[Card]:
    """
    Build today's review queue respecting daily limits.
    
    PRD REQ-6 implementation (lines 69-73, 469-479):
    Queue priorities:
    1. Due learning steps (unlimited)
    2. Due reviews (up to review_per_day limit)
    3. New cards (up to new_per_day limit)
    
    Args:
        db: Database session
        user_id: User ID
        deck_ids: Optional list of deck IDs to filter
        now: Current timestamp (for testing)
        
    Returns:
        List of Card objects in queue order
    """
    if now is None:
        now = datetime.utcnow()
    
    today = now.date()
    limits = get_daily_limits(db, user_id, deck_ids)
    counter = get_today_counter(db, user_id, today)
    
    queue = []
    
    # Base query
    base_query = db.query(Card).filter(
        Card.user_id == user_id,
        Card.suspended == False
    )
    
    if deck_ids:
        base_query = base_query.filter(Card.deck_id.in_(deck_ids))
    
    # 1. Learning cards due now (PRD line 70: unlimited, prioritized)
    learning_cards = base_query.join(SchedState).filter(
        SchedState.state == "learning",
        SchedState.due_at <= now
    ).order_by(SchedState.due_at.asc()).all()
    
    queue.extend(learning_cards)
    
    # 2. Review cards due now (PRD line 70-71: up to review_per_day limit)
    reviews_remaining = limits["review_per_day"] - counter.reviews_done
    if reviews_remaining > 0:
        # Subtract learning cards from reviews_remaining since they count as reviews
        reviews_remaining -= len(learning_cards)
        
        if reviews_remaining > 0:
            review_cards = base_query.join(SchedState).filter(
                SchedState.state == "review",
                SchedState.due_at <= now
            ).order_by(SchedState.due_at.asc()).limit(reviews_remaining).all()
            
            queue.extend(review_cards)
    
    # 3. New cards (PRD line 71: up to new_per_day limit)
    new_remaining = limits["new_per_day"] - counter.introduced_new
    if new_remaining > 0:
        new_cards = base_query.outerjoin(SchedState).filter(
            (SchedState.state == "new") | (SchedState.state == None)
        ).order_by(Card.created_at.asc()).limit(new_remaining).all()
        
        queue.extend(new_cards)
    
    return queue


def get_next_card(
    db: Session,
    user_id: int,
    deck_ids: Optional[List[int]] = None,
    now: datetime = None
) -> Optional[Card]:
    """
    Get the next card to review from the queue.
    
    Args:
        db: Database session
        user_id: User ID
        deck_ids: Optional list of deck IDs to filter
        now: Current timestamp (for testing)
        
    Returns:
        Next Card to review, or None if queue is empty
    """
    queue = build_queue(db, user_id, deck_ids, now)
    return queue[0] if queue else None


def get_queue_stats(
    db: Session,
    user_id: int,
    now: datetime = None
) -> Dict:
    """
    Get comprehensive queue statistics.
    
    PRD REQ-9: Basic stats for display.
    
    Args:
        db: Database session
        user_id: User ID
        now: Current timestamp
        
    Returns:
        Dict with queue stats and daily progress
    """
    if now is None:
        now = datetime.utcnow()
    
    today = now.date()
    limits = get_daily_limits(db, user_id)
    counter = get_today_counter(db, user_id, today)
    counts = get_queue_counts(db, user_id, None, now)
    
    # Calculate available slots
    reviews_remaining = max(0, limits["review_per_day"] - counter.reviews_done)
    new_remaining = max(0, limits["new_per_day"] - counter.introduced_new)
    
    # Total cards in today's queue
    total_due = (
        counts["learning"] +
        min(counts["review"], reviews_remaining) +
        min(counts["new"], new_remaining)
    )
    
    return {
        "due_counts": counts,
        "limits": limits,
        "today": {
            "reviews_done": counter.reviews_done,
            "introduced_new": counter.introduced_new,
            "again_count": counter.again_count,
            "good_count": counter.good_count,
            "easy_count": counter.easy_count,
            "date": counter.date.isoformat()
        },
        "remaining": {
            "reviews": reviews_remaining,
            "new": new_remaining
        },
        "total_due": total_due
    }
