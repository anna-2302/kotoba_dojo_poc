#!/usr/bin/env python
"""Quick check of database contents."""
import sys
sys.path.insert(0, 'server')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.database import User, Deck, Card, SchedState

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()
try:
    users = db.query(User).count()
    decks = db.query(Deck).count()
    cards = db.query(Card).count()
    scheds = db.query(SchedState).count()
    
    print(f"Database contents:")
    print(f"  Users: {users}")
    print(f"  Decks: {decks}")
    print(f"  Cards: {cards}")
    print(f"  Sched States: {scheds}")
    
    if decks > 0:
        print(f"\nDecks:")
        for deck in db.query(Deck).all():
            card_count = db.query(Card).filter(Card.deck_id == deck.id).count()
            print(f"  - {deck.name} ({card_count} cards)")
finally:
    db.close()
