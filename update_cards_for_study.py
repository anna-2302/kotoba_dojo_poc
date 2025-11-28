#!/usr/bin/env python
"""
Update existing cards to create a varied study queue.
Creates cards in different states (new, learning, review) with varied due dates.
"""
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add server to path
sys.path.insert(0, 'server')

from app.core.config import settings
from app.models.database import Card, SchedState, ReviewLog, DailyCounter

# Database connection
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_cards_for_study():
    """Update cards to create a realistic study queue."""
    db = SessionLocal()
    
    try:
        # Get all cards with their scheduling states
        cards = db.query(Card).join(SchedState).all()
        
        if not cards:
            print("No cards found in database. Please import starter decks first.")
            return
        
        print(f"Found {len(cards)} cards. Updating scheduling states...")
        
        now = datetime.utcnow()
        updated_count = 0
        
        # Distribution plan:
        # - 20% new cards (due now, ready to learn)
        # - 30% learning cards (some due, some future)
        # - 50% review cards (various intervals, some due)
        
        total_cards = len(cards)
        new_count = int(total_cards * 0.20)
        learning_count = int(total_cards * 0.30)
        
        for i, card in enumerate(cards):
            sched = card.sched_state
            
            if i < new_count:
                # New cards - due immediately
                sched.state = 'new'
                sched.due_at = now - timedelta(hours=1)  # Slightly in past
                sched.interval_days = 0.0
                sched.ease_factor = 2.5
                sched.learning_step = 0
                sched.lapses = 0
                updated_count += 1
                
            elif i < new_count + learning_count:
                # Learning cards - mix of due and not due
                sched.state = 'learning'
                sched.ease_factor = 2.5
                sched.lapses = 0
                
                # Half due now, half due later
                if i % 2 == 0:
                    # Due now or recently
                    sched.due_at = now - timedelta(minutes=(i % 60))
                    sched.learning_step = 0  # First step (10 min)
                    sched.interval_days = 0.0069  # 10 minutes in days
                else:
                    # Due later today or tomorrow
                    hours_ahead = (i % 24) + 1
                    sched.due_at = now + timedelta(hours=hours_ahead)
                    sched.learning_step = 1  # Second step (1 day)
                    sched.interval_days = 1.0
                
                updated_count += 1
                
            else:
                # Review cards - various intervals
                sched.state = 'review'
                sched.learning_step = 0  # Not relevant for review cards
                
                # Vary ease factors (2.0 to 2.8)
                sched.ease_factor = 2.0 + (i % 9) * 0.1
                
                # Vary intervals (2 to 30 days)
                interval_days = 2 + (i % 29)
                sched.interval_days = float(interval_days)
                
                # Vary lapses (0 to 3)
                sched.lapses = i % 4
                
                # Mix of due dates
                offset = i % 10
                if offset < 4:
                    # 40% overdue (past few days)
                    days_ago = offset + 1
                    sched.due_at = now - timedelta(days=days_ago, hours=(i % 12))
                elif offset < 7:
                    # 30% due today
                    sched.due_at = now - timedelta(minutes=(i % 60))
                else:
                    # 30% future reviews
                    days_ahead = (offset - 6) * 2
                    sched.due_at = now + timedelta(days=days_ahead)
                
                updated_count += 1
        
        # Reset daily counters to allow new cards
        counter = db.query(DailyCounter).filter(DailyCounter.user_id == 1).first()
        if counter:
            counter.new_today = 0
            counter.review_today = 0
            counter.date = now.date()
            print("Reset daily counters")
        
        db.commit()
        
        # Print summary
        print(f"\n✓ Successfully updated {updated_count} cards!")
        print("\nCard distribution:")
        print(f"  - New cards (due now): ~{new_count}")
        print(f"  - Learning cards: ~{learning_count}")
        print(f"  - Review cards: ~{total_cards - new_count - learning_count}")
        
        # Count actually due cards
        due_new = db.query(SchedState).filter(
            SchedState.user_id == 1,
            SchedState.state == 'new',
            SchedState.due_at <= now
        ).count()
        
        due_learning = db.query(SchedState).filter(
            SchedState.user_id == 1,
            SchedState.state == 'learning',
            SchedState.due_at <= now
        ).count()
        
        due_review = db.query(SchedState).filter(
            SchedState.user_id == 1,
            SchedState.state == 'review',
            SchedState.due_at <= now
        ).count()
        
        print(f"\nCards due now:")
        print(f"  - New: {due_new}")
        print(f"  - Learning: {due_learning}")
        print(f"  - Review: {due_review}")
        print(f"  - Total due: {due_new + due_learning + due_review}")
        
        print("\nYou should now see cards on your dashboard! 🎉")
        
    except Exception as e:
        print(f"Error updating cards: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_cards_for_study()
