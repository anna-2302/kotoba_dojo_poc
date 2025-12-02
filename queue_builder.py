"""
Queue Builder Service
Implements REQ-6: Daily Queue and Limits from PRD.

Builds structured review sessions based on:
- New cards (up to new_per_day limit, randomized within deck)
- Learning cards (unlimited, due cards only) 
- Review cards (up to review_per_day limit, randomized within deck)
"""
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple, NamedTuple
from dataclasses import dataclass
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, text
import random

from app.models.database import Card, SchedState, User, Deck, DailyCounter, DailyDeckCounter, UserSettings
from deck_counter_helpers import get_deck_usage_today


@dataclass
class CardStub:
    """Minimal card info for session queue."""
    id: int
    deck_id: int
    front_preview: str
    state: str
    tags: List[str]
    due_at: Optional[datetime]
    created_at: datetime


@dataclass
class SessionSections:
    """Structured session with three sections."""
    new: List[CardStub]
    learning: List[CardStub]
    review: List[CardStub]


@dataclass
class DeckLimits:
    """Per-deck limit tracking."""
    new_cap: int
    review_cap: int
    new_used: int
    review_used: int


@dataclass
class SessionMeta:
    """Session metadata and applied limits."""
    total_new: int
    total_learning: int
    total_review: int
    deck_order: List[str]
    global_limits: Dict[str, int]
    per_deck_limits: Dict[int, DeckLimits]


# PRD line 92: Default daily limits
DEFAULT_NEW_PER_DAY = 15
DEFAULT_REVIEW_PER_DAY = 200


def get_global_limits(db: Session, user_id: int) -> Dict[str, int]:
    """
    Get global daily limits from user settings.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        Dict with "new" and "review" global limits
    """
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == user_id
    ).first()
    
    # Phase 4 PRD: New defaults are 12 new, 150 review
    default_new = 12
    default_review = 150
    
    return {
        "new": settings.new_per_day if settings and settings.new_per_day else default_new,
        "review": settings.review_per_day if settings and settings.review_per_day else default_review
    }


def get_deck_limits_map(db: Session, user_id: int, deck_ids: List[int], global_limits: Dict[str, int]) -> Dict[int, DeckLimits]:
    """
    Build per-deck limit tracking map.
    
    Args:
        db: Database session
        user_id: User ID
        deck_ids: List of deck IDs
        global_limits: Global limits dict
        
    Returns:
        Dict mapping deck_id -> DeckLimits
    """
    decks = db.query(Deck).filter(
        Deck.id.in_(deck_ids),
        Deck.user_id == user_id
    ).all()
    
    limits_map = {}
    for deck in decks:
        limits_map[deck.id] = DeckLimits(
            new_cap=deck.new_per_day if deck.new_per_day is not None else global_limits["new"],
            review_cap=deck.review_per_day if deck.review_per_day is not None else global_limits["review"],
            new_used=0,
            review_used=0
        )
    
    return limits_map


def build_card_pools_by_deck(
    db: Session, 
    user_id: int, 
    deck_ids: List[int],
    now: datetime
) -> Tuple[Dict[int, List[Card]], Dict[int, List[Card]], Dict[int, List[Card]]]:
    """
    Build randomized card pools by deck for each section.
    
    Args:
        db: Database session
        user_id: User ID
        deck_ids: List of deck IDs to include
        now: Current timestamp
        
    Returns:
        Tuple of (new_pools, learning_pools, review_pools)
    """
    new_pools = {}
    learning_pools = {}
    review_pools = {}
    
    for deck_id in deck_ids:
        # Build New pool (cards with no SchedState or state='new')
        new_cards = db.query(Card).outerjoin(SchedState).filter(
            Card.user_id == user_id,
            Card.deck_id == deck_id,
            Card.suspended == False,
            (SchedState.state == "new") | (SchedState.state == None)
        ).order_by(text("RANDOM()")).all()
        new_pools[deck_id] = new_cards
        
        # Build Learning pool (due Learning cards)
        learning_cards = db.query(Card).join(SchedState).filter(
            Card.user_id == user_id,
            Card.deck_id == deck_id,
            Card.suspended == False,
            SchedState.state == "learning",
            SchedState.due_at <= now
        ).order_by(text("RANDOM()")).all()
        learning_pools[deck_id] = learning_cards
        
        # Build Review pool (due Review cards)
        review_cards = db.query(Card).join(SchedState).filter(
            Card.user_id == user_id,
            Card.deck_id == deck_id,
            Card.suspended == False,
            SchedState.state == "review",
            SchedState.due_at <= now
        ).order_by(text("RANDOM()")).all()
        review_pools[deck_id] = review_cards
    
    return new_pools, learning_pools, review_pools


def round_robin_allocate(
    deck_names: List[str],
    deck_pools: Dict[int, List[Card]],
    deck_id_map: Dict[str, int],
    deck_limits: Optional[Dict[int, DeckLimits]] = None,
    global_remaining: Optional[int] = None,
    section_type: str = "new"
) -> List[Card]:
    """
    Round-robin allocation across decks.
    
    Args:
        deck_names: Ordered list of deck names (alphabetical)
        deck_pools: Dict mapping deck_id -> List[Card]
        deck_id_map: Dict mapping deck_name -> deck_id
        deck_limits: Optional per-deck limit tracking
        global_remaining: Optional global limit remaining
        section_type: "new" or "review" (for limit checking)
        
    Returns:
        List of allocated cards in round-robin order
    """
    result = []
    
    while True:
        progress_made = False
        
        for deck_name in deck_names:
            deck_id = deck_id_map[deck_name]
            pool = deck_pools.get(deck_id, [])
            
            if not pool:
                continue  # Deck exhausted
            
            # Check deck limits
            if deck_limits:
                limit_obj = deck_limits.get(deck_id)
                if limit_obj:
                    if section_type == "new" and limit_obj.new_used >= limit_obj.new_cap:
                        continue
                    elif section_type == "review" and limit_obj.review_used >= limit_obj.review_cap:
                        continue
            
            # Check global limit
            if global_remaining is not None and global_remaining <= 0:
                break
            
            # Take one card from this deck
            card = pool.pop(0)
            result.append(card)
            progress_made = True
            
            # Update limits
            if deck_limits and deck_id in deck_limits:
                if section_type == "new":
                    deck_limits[deck_id].new_used += 1
                elif section_type == "review":
                    deck_limits[deck_id].review_used += 1
            
            if global_remaining is not None:
                global_remaining -= 1
                if global_remaining == 0:
                    break
        
        if not progress_made or (global_remaining is not None and global_remaining <= 0):
            break
    
    return result


def card_to_stub(card: Card) -> CardStub:
    """
    Convert Card to CardStub for session queue.
    
    Args:
        card: Card object
        
    Returns:
        CardStub with minimal info
    """
    tags = [tag.name for tag in card.tags] if card.tags else []
    front_preview = card.front[:100] + "..." if len(card.front) > 100 else card.front
    
    state = "new"
    due_at = None
    if card.sched_state:
        state = card.sched_state.state
        due_at = card.sched_state.due_at
    
    return CardStub(
        id=card.id,
        deck_id=card.deck_id,
        front_preview=front_preview,
        state=state,
        tags=tags,
        due_at=due_at,
        created_at=card.created_at
    )


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
    
    # Convert date to datetime at midnight for database query
    today_dt = datetime.combine(today, datetime.min.time())
    
    counter = db.query(DailyCounter).filter(
        DailyCounter.user_id == user_id,
        func.date(DailyCounter.date) == today
    ).first()
    
    if not counter:
        counter = DailyCounter(
            user_id=user_id,
            date=today_dt,
            reviews_done=0,
            introduced_new=0,
            again_count=0,
            good_count=0,
            easy_count=0,
            introduced_new_per_deck={},
            reviews_done_per_deck={}
        )
        db.add(counter)
        db.flush()  # Use flush instead of commit to keep transaction open
    
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


def build_session_queue(
    db: Session,
    user_id: int,
    scope: str = "all",  # "all" or "deck"
    deck_id: Optional[int] = None,
    now: datetime = None,
    today: date = None
) -> Tuple[SessionSections, SessionMeta]:
    """
    Build structured session queue with three sections (New -> Learning -> Review).
    
    Phase 4 PRD implementation:
    - All Decks: Uses global limits + per-deck caps, round-robin allocation
    - Specific Deck: Uses only that deck's limits, ignores global limits
    
    Args:
        db: Database session
        user_id: User ID
        scope: "all" for All Decks session, "deck" for Specific Deck
        deck_id: Required if scope="deck"
        now: Current timestamp
        today: Today's date
        
    Returns:
        Tuple of (SessionSections, SessionMeta)
    """
    if now is None:
        now = datetime.utcnow()
    if today is None:
        today = now.date()
    
    # Validate inputs
    if scope == "deck" and deck_id is None:
        raise ValueError("deck_id required for scope='deck'")
    
    # Get counter for today
    counter = get_today_counter(db, user_id, today)
    
    # Determine deck scope
    if scope == "deck":
        deck_ids = [deck_id]
        # Get deck info for specific deck session
        deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user_id).first()
        if not deck:
            raise ValueError(f"Deck {deck_id} not found")
        
        # For specific deck, use only deck limits (ignore global)
        global_limits = {"new": deck.new_per_day or 12, "review": deck.review_per_day or 150}
        deck_limits = None  # No per-deck limits needed for single deck
    else:
        # All Decks session
        deck_ids = [d.id for d in db.query(Deck).filter(Deck.user_id == user_id).all()]
        if not deck_ids:
            return SessionSections([], [], []), SessionMeta(0, 0, 0, [], {}, {})
        
        global_limits = get_global_limits(db, user_id)
        deck_limits = get_deck_limits_map(db, user_id, deck_ids, global_limits)
        
        # Phase 4: Get today's per-deck usage for All Decks sessions
        deck_usage = get_deck_usage_today(db, user_id, deck_ids, counter.date.date())
        
        # Apply per-deck usage to deck limits
        for deck_id, usage in deck_usage.items():
            if deck_id in deck_limits:
                deck_limits[deck_id].new_used = usage["introduced_new"]
                deck_limits[deck_id].review_used = usage["reviews_done"]
    
    # Get deck names for ordering (alphabetical)
    decks = db.query(Deck).filter(
        Deck.id.in_(deck_ids),
        Deck.user_id == user_id
    ).order_by(Deck.name).all()
    
    deck_names = [deck.name for deck in decks]
    deck_id_map = {deck.name: deck.id for deck in decks}
    
    # Build card pools by deck
    new_pools, learning_pools, review_pools = build_card_pools_by_deck(
        db, user_id, deck_ids, now
    )
    
    # Calculate remaining capacities
    if scope == "all":
        global_new_remaining = max(0, global_limits["new"] - counter.introduced_new)
        global_review_remaining = max(0, global_limits["review"] - counter.reviews_done)
    else:
        global_new_remaining = global_limits["new"]  # No global counter for specific deck
        global_review_remaining = global_limits["review"]
    
    # Round-robin allocation for each section
    
    # 1. New section
    new_cards = round_robin_allocate(
        deck_names, new_pools, deck_id_map, 
        deck_limits, global_new_remaining, "new"
    )
    
    # 2. Learning section (uncapped)
    learning_cards = round_robin_allocate(
        deck_names, learning_pools, deck_id_map,
        None, None, "learning"
    )
    
    # 3. Review section
    review_cards = round_robin_allocate(
        deck_names, review_pools, deck_id_map,
        deck_limits, global_review_remaining, "review"
    )
    
    # Convert to stubs
    sections = SessionSections(
        new=[card_to_stub(card) for card in new_cards],
        learning=[card_to_stub(card) for card in learning_cards],
        review=[card_to_stub(card) for card in review_cards]
    )
    
    # Build metadata
    meta = SessionMeta(
        total_new=len(new_cards),
        total_learning=len(learning_cards),
        total_review=len(review_cards),
        deck_order=deck_names,
        global_limits=global_limits,
        per_deck_limits=deck_limits or {}
    )
    
    return sections, meta


# Legacy function - kept for backward compatibility
def build_queue(
    db: Session,
    user_id: int,
    deck_ids: Optional[List[int]] = None,
    now: datetime = None
) -> List[Card]:
    """
    Legacy function - builds flat queue for backward compatibility.
    Use build_session_queue for new Phase 4 functionality.
    """
    if deck_ids and len(deck_ids) == 1:
        sections, _ = build_session_queue(db, user_id, "deck", deck_ids[0], now)
    else:
        sections, _ = build_session_queue(db, user_id, "all", None, now)
    
    # Flatten sections in order: New -> Learning -> Review
    all_cards = []
    
    # Convert stubs back to card IDs and fetch cards
    card_ids = [stub.id for stub in sections.new + sections.learning + sections.review]
    if card_ids:
        cards = db.query(Card).filter(Card.id.in_(card_ids)).all()
        card_map = {card.id: card for card in cards}
        all_cards = [card_map[card_id] for card_id in card_ids if card_id in card_map]
    
    return all_cards


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
    limits = get_global_limits(db, user_id)
    counter = get_today_counter(db, user_id, today)
    counts = get_queue_counts(db, user_id, None, now)
    
    # Calculate available slots
    reviews_remaining = max(0, limits["review"] - counter.reviews_done)
    new_remaining = max(0, limits["new"] - counter.introduced_new)
    
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
