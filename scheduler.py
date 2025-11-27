"""
SM-2 Scheduler Service
Implements REQ-4: Spaced-Repetition Scheduler from PRD.

Based on SuperMemo SM-2 algorithm with modifications:
- Learning steps: 10 minutes, 1 day
- Review intervals: I1=1 day, I2=6 days, then I(n) = round(I(n-1) * EF)
- Ease factor: initial 2.5, range [1.3, 3.0]
"""
from datetime import datetime, timedelta
from typing import Tuple, Literal
from sqlalchemy.orm import Session

from app.models.database import Card, SchedState, ReviewLog, DailyCounter

# PRD lines 62-65: Default learning steps
LEARNING_STEPS_MINUTES = [10, 1440]  # 10 minutes, 1 day (1440 minutes)

# PRD lines 64-65: Initial intervals for review state
REVIEW_INTERVAL_1 = 1.0  # days
REVIEW_INTERVAL_6 = 6.0  # days

# PRD line 63: Ease factor constraints
EF_INITIAL = 2.5
EF_MIN = 1.3
EF_MAX = 3.0

# PRD line 66: Lapse multiplier
LAPSE_MULTIPLIER = 0.5

# PRD line 68: Easy bonus multiplier
EASY_BONUS = 1.3

Rating = Literal["again", "good", "easy"]


def calculate_next_state(
    sched_state: SchedState,
    rating: Rating,
    now: datetime
) -> Tuple[str, datetime, float, float, int]:
    """
    Calculate next scheduling state based on current state and rating.
    
    PRD REQ-4 implementation (lines 58-73).
    
    Args:
        sched_state: Current scheduling state
        rating: User rating ("again", "good", "easy")
        now: Current timestamp
        
    Returns:
        Tuple of (new_state, due_at, interval_days, ease_factor, learning_step)
    """
    state = sched_state.state
    interval = sched_state.interval_days
    ef = sched_state.ease_factor
    step = sched_state.learning_step
    
    # NEW STATE
    if state == "new":
        if rating == "again":
            # Start learning, step 0
            return (
                "learning",
                now + timedelta(minutes=LEARNING_STEPS_MINUTES[0]),
                0.0,
                ef,
                0
            )
        elif rating == "good":
            # Start learning, step 0
            return (
                "learning",
                now + timedelta(minutes=LEARNING_STEPS_MINUTES[0]),
                0.0,
                ef,
                0
            )
        else:  # easy
            # Graduate immediately to review with I1
            # PRD line 68: Easy from new → graduate to Review
            return (
                "review",
                now + timedelta(days=REVIEW_INTERVAL_1),
                REVIEW_INTERVAL_1,
                min(EF_MAX, ef + 0.15),
                0
            )
    
    # LEARNING STATE
    elif state == "learning":
        if rating == "again":
            # PRD line 66: Reset to first step
            return (
                "learning",
                now + timedelta(minutes=LEARNING_STEPS_MINUTES[0]),
                0.0,
                ef,
                0
            )
        elif rating == "good":
            # PRD line 67: Advance step or graduate
            next_step = step + 1
            if next_step < len(LEARNING_STEPS_MINUTES):
                # Advance to next learning step
                return (
                    "learning",
                    now + timedelta(minutes=LEARNING_STEPS_MINUTES[next_step]),
                    0.0,
                    ef,
                    next_step
                )
            else:
                # Graduate to review with I1
                return (
                    "review",
                    now + timedelta(days=REVIEW_INTERVAL_1),
                    REVIEW_INTERVAL_1,
                    ef,
                    0
                )
        else:  # easy
            # PRD line 68: Graduate immediately
            return (
                "review",
                now + timedelta(days=REVIEW_INTERVAL_1),
                REVIEW_INTERVAL_1,
                min(EF_MAX, ef + 0.15),
                0
            )
    
    # REVIEW STATE
    elif state == "review":
        if rating == "again":
            # PRD line 66: Lapse - reduce interval and EF
            new_interval = max(1.0, round(interval * LAPSE_MULTIPLIER))
            new_ef = max(EF_MIN, ef - 0.2)
            return (
                "review",
                now + timedelta(days=new_interval),
                new_interval,
                new_ef,
                0
            )
        elif rating == "good":
            # PRD line 67: Standard SM-2 progression
            if interval < REVIEW_INTERVAL_6:
                # First review: use I2 = 6 days
                new_interval = REVIEW_INTERVAL_6
            else:
                # Subsequent reviews: I(n) = round(I(n-1) * EF)
                new_interval = round(interval * ef)
            
            return (
                "review",
                now + timedelta(days=new_interval),
                float(new_interval),
                ef,
                0
            )
        else:  # easy
            # PRD line 68: Bonus multiplier and EF boost
            if interval < REVIEW_INTERVAL_6:
                new_interval = round(REVIEW_INTERVAL_6 * EASY_BONUS)
            else:
                new_interval = round(interval * ef * EASY_BONUS)
            
            new_ef = min(EF_MAX, ef + 0.15)
            return (
                "review",
                now + timedelta(days=new_interval),
                float(new_interval),
                new_ef,
                0
            )
    
    # Fallback (shouldn't happen)
    return (state, sched_state.due_at, interval, ef, step)


def process_rating(
    db: Session,
    card: Card,
    rating: Rating,
    user_id: int,
    now: datetime = None
) -> SchedState:
    """
    Process a card rating and update scheduling state.
    
    PRD REQ-4, REQ-9 implementation.
    
    Args:
        db: Database session
        card: Card being reviewed
        rating: User rating
        user_id: User ID
        now: Current timestamp (for testing)
        
    Returns:
        Updated SchedState
    """
    if now is None:
        now = datetime.utcnow()
    
    # Get current sched state
    sched_state = card.sched_state
    if not sched_state:
        raise ValueError(f"Card {card.id} has no scheduling state")
    
    old_state = sched_state.state
    old_interval = sched_state.interval_days
    old_ef = sched_state.ease_factor
    
    # Calculate new state
    new_state, due_at, interval, ef, step = calculate_next_state(
        sched_state, rating, now
    )
    
    # Update sched_state
    sched_state.state = new_state
    sched_state.due_at = due_at
    sched_state.interval_days = interval
    sched_state.ease_factor = ef
    sched_state.learning_step = step
    sched_state.version += 1
    
    # Track lapses
    if rating == "again" and old_state == "review":
        sched_state.lapses += 1
    
    # Create review log (PRD lines 456-463)
    review_log = ReviewLog(
        card_id=card.id,
        user_id=user_id,
        rating=rating,
        state_before=old_state,
        state_after=new_state,
        interval_before=old_interval,
        interval_after=interval,
        ease_factor_before=old_ef,
        ease_factor_after=ef,
        reviewed_at=now
    )
    db.add(review_log)
    
    # Update daily counters (PRD lines 459-463)
    today = now.date()
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
    
    # Track if this is a new card introduction
    if old_state == "new":
        counter.introduced_new += 1
    
    # Increment review counts
    counter.reviews_done += 1
    if rating == "again":
        counter.again_count += 1
    elif rating == "good":
        counter.good_count += 1
    else:  # easy
        counter.easy_count += 1
    
    db.commit()
    db.refresh(sched_state)
    
    return sched_state


def get_next_review_times(
    current_state: str,
    interval: float,
    ef: float,
    step: int,
    now: datetime = None
) -> dict:
    """
    Preview next review times for each rating option.
    
    Useful for UI to show "Again: 10m, Good: 1d, Easy: 6d"
    
    Args:
        current_state: Current card state
        interval: Current interval in days
        ef: Current ease factor
        step: Current learning step
        now: Current timestamp
        
    Returns:
        Dict with keys "again", "good", "easy" -> datetime
    """
    if now is None:
        now = datetime.utcnow()
    
    # Create a temporary sched_state-like object
    class TempState:
        def __init__(self):
            self.state = current_state
            self.interval_days = interval
            self.ease_factor = ef
            self.learning_step = step
            self.due_at = now
    
    temp = TempState()
    
    results = {}
    for rating in ["again", "good", "easy"]:
        _, due_at, _, _, _ = calculate_next_state(temp, rating, now)
        results[rating] = due_at
    
    return results
