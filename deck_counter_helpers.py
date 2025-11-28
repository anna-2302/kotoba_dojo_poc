"""
Phase 4 per-deck counter helper functions
"""
from datetime import datetime, date
from sqlalchemy.orm import Session


def get_today_deck_counter(db: Session, user_id: int, deck_id: int, today: date = None):
    """Get or create today's per-deck counter."""
    from app.models.database import DailyDeckCounter
    from sqlalchemy.exc import IntegrityError
    
    if today is None:
        today = datetime.utcnow().date()
    
    # Convert date to datetime at midnight
    today_dt = datetime.combine(today, datetime.min.time())
    
    counter = db.query(DailyDeckCounter).filter(
        DailyDeckCounter.user_id == user_id,
        DailyDeckCounter.deck_id == deck_id,
        DailyDeckCounter.date == today_dt
    ).first()
    
    if not counter:
        counter = DailyDeckCounter(
            user_id=user_id,
            deck_id=deck_id,
            date=today_dt,
            introduced_new=0,
            reviews_done=0
        )
        db.add(counter)
        try:
            db.flush()  # Use flush instead of commit to keep transaction open
        except IntegrityError:
            # Race condition: another request created it, rollback and query again
            db.rollback()
            counter = db.query(DailyDeckCounter).filter(
                DailyDeckCounter.user_id == user_id,
                DailyDeckCounter.deck_id == deck_id,
                DailyDeckCounter.date == today_dt
            ).first()
            if not counter:
                raise  # Should never happen, re-raise if it does
    
    return counter


def update_deck_counters(db: Session, user_id: int, deck_id: int, introduced_new: int = 0, reviews_done: int = 0, today: date = None):
    """Update per-deck counters after card reviews."""
    if today is None:
        today = datetime.utcnow().date()
    
    counter = get_today_deck_counter(db, user_id, deck_id, today)
    counter.introduced_new += introduced_new
    counter.reviews_done += reviews_done
    # No commit here - let the caller handle transaction


def get_deck_usage_today(db: Session, user_id: int, deck_ids: list, today: date = None) -> dict:
    """Get today's usage counts for multiple decks."""
    from app.models.database import DailyDeckCounter
    
    if today is None:
        today = datetime.utcnow().date()
    
    # Convert date to datetime at midnight
    today_dt = datetime.combine(today, datetime.min.time())
    
    counters = db.query(DailyDeckCounter).filter(
        DailyDeckCounter.user_id == user_id,
        DailyDeckCounter.deck_id.in_(deck_ids),
        DailyDeckCounter.date == today_dt
    ).all()
    
    usage = {}
    for counter in counters:
        usage[counter.deck_id] = {
            "introduced_new": counter.introduced_new,
            "reviews_done": counter.reviews_done
        }
    
    # Fill in missing decks with zero counts
    for deck_id in deck_ids:
        if deck_id not in usage:
            usage[deck_id] = {"introduced_new": 0, "reviews_done": 0}
    
    return usage