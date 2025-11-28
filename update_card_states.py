"""
Update card states in the database for testing.
Mark some cards as 'learning' and some as 'review' state.
"""
import sys
sys.path.insert(0, 'server')

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.database import Card, SchedState, User

def update_card_states():
    db: Session = SessionLocal()
    
    try:
        # Get the default user
        user = db.query(User).filter(User.username == "default_user").first()
        if not user:
            print("No default_user found!")
            return
        
        # Get all cards
        cards = db.query(Card).all()
        
        if len(cards) == 0:
            print("No cards found in database!")
            return
        
        print(f"Found {len(cards)} cards")
        
        # Update first 10 cards to learning state
        learning_count = 0
        for i, card in enumerate(cards[:10]):
            sched_state = db.query(SchedState).filter(
                SchedState.card_id == card.id,
                SchedState.user_id == user.id
            ).first()
            
            if sched_state:
                sched_state.state = 'learning'
                sched_state.learning_step = 0
                sched_state.interval_days = 0.0069  # 10 minutes in days
                sched_state.ease_factor = 2.5
                sched_state.due_at = datetime.utcnow() - timedelta(minutes=5)  # Due 5 minutes ago
                learning_count += 1
                print(f"  Card {card.id} ({card.front[:30]}) -> learning")
        
        # Update next 15 cards to review state
        review_count = 0
        for card in cards[10:25]:
            sched_state = db.query(SchedState).filter(
                SchedState.card_id == card.id,
                SchedState.user_id == user.id
            ).first()
            
            if sched_state:
                sched_state.state = 'review'
                sched_state.learning_step = 0
                sched_state.interval_days = 3.0  # 3 day interval
                sched_state.ease_factor = 2.5
                sched_state.due_at = datetime.utcnow() - timedelta(hours=2)  # Due 2 hours ago
                review_count += 1
                print(f"  Card {card.id} ({card.front[:30]}) -> review")
        
        # Keep remaining cards as 'new'
        new_count = len(cards) - learning_count - review_count
        
        db.commit()
        
        print(f"\n✓ Successfully updated card states:")
        print(f"  - Learning: {learning_count} cards")
        print(f"  - Review: {review_count} cards")
        print(f"  - New: {new_count} cards")
        print(f"\nAll due cards are ready for review session!")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_card_states()
