"""
Prebuilt deck import service.
Imports sample N4 vocabulary and kanji decks.
Implements REQ-12 from PRD (Prebuilt N4 Decks).
"""
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.database import User, Deck, Card, Tag, SchedState, card_tags
from app.db.seed_data import get_all_sample_data


def import_prebuilt_decks(db: Session, user_id: int = 1) -> dict:
    """
    Import prebuilt N4 vocabulary and kanji decks.
    
    Creates multiple themed decks:
    - JLPT N4 Vocabulary (30 cards) - Core vocabulary
    - JLPT N4 Kanji (20 cards) - Essential kanji
    - JLPT N4 Numbers & Counters (15 cards) - Numbers and counter words
    - JLPT N4 Food & Dining (20 cards) - Food, drinks, and dining
    - JLPT N4 Transportation (15 cards) - Travel and transportation
    - JLPT N4 Colors & Descriptions (12 cards) - Colors and descriptive words
    - JLPT N4 Weather & Seasons (12 cards) - Weather and seasons
    - JLPT N4 Family (15 cards) - Family relationships
    - JLPT N4 Adverbs (100 cards) - Time, frequency, manner, and degree adverbs
    
    Idempotent: Can be run multiple times safely.
    
    Args:
        db: Database session
        user_id: User ID (default 1 for POC)
        
    Returns:
        dict: Import statistics
    """
    # Get sample data
    sample_data = get_all_sample_data()
    
    # Define deck configurations
    deck_configs = [
        {
            "name": "JLPT N4 Vocabulary",
            "description": "Core JLPT N4 vocabulary covering common nouns, verbs, and adjectives",
            "data_key": "vocab"
        },
        {
            "name": "JLPT N4 Kanji",
            "description": "Essential JLPT N4 kanji characters with readings and common usage",
            "data_key": "kanji"
        },
        {
            "name": "JLPT N4 Numbers & Counters",
            "description": "Numbers and counter words for counting people, objects, and frequency",
            "data_key": "numbers"
        },
        {
            "name": "JLPT N4 Food & Dining",
            "description": "Food, drinks, meals, and dining vocabulary",
            "data_key": "food"
        },
        {
            "name": "JLPT N4 Transportation",
            "description": "Transportation methods, places, and travel-related vocabulary",
            "data_key": "transport"
        },
        {
            "name": "JLPT N4 Colors & Descriptions",
            "description": "Colors and descriptive adjectives for appearance",
            "data_key": "colors"
        },
        {
            "name": "JLPT N4 Weather & Seasons",
            "description": "Weather conditions, seasons, and temperature vocabulary",
            "data_key": "weather"
        },
        {
            "name": "JLPT N4 Family",
            "description": "Family members and relationship vocabulary with humble/polite forms",
            "data_key": "family"
        },
        {
            "name": "JLPT N4 Adverbs",
            "description": "Essential adverbs for time, frequency, manner, degree, and state expressions",
            "data_key": "adverbs"
        }
    ]
    
    # Check if any decks already exist
    existing_decks = {}
    for config in deck_configs:
        existing_deck = db.query(Deck).filter(
            Deck.user_id == user_id,
            Deck.name == config["name"]
        ).first()
        if existing_deck:
            existing_decks[config["name"]] = existing_deck
    
    # If all decks exist, return early
    if len(existing_decks) == len(deck_configs):
        return {
            "status": "already_imported",
            "message": "All prebuilt decks already exist",
            "decks": [{"name": name, "id": deck.id, "exists": True, "card_count": _count_cards(db, deck.id)} 
                      for name, deck in existing_decks.items()],
            "total_cards": sum(_count_cards(db, deck.id) for deck in existing_decks.values())
        }
    
    # Ensure user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, username="default_user", timezone="UTC")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Import all decks
    imported_decks = []
    total_cards = 0
    
    for config in deck_configs:
        # Skip if deck already exists
        if config["name"] in existing_decks:
            existing = existing_decks[config["name"]]
            card_count = _count_cards(db, existing.id)
            imported_decks.append({
                "name": config["name"],
                "id": existing.id,
                "cards": card_count,
                "exists": True
            })
            total_cards += card_count
            continue
        
        # Create deck
        deck = Deck(
            user_id=user_id,
            name=config["name"],
            description=config["description"]
        )
        db.add(deck)
        db.flush()  # Get deck ID
        
        # Import cards for this deck
        cards_count = _import_cards(
            db, user_id, deck.id, sample_data[config["data_key"]]
        )
        
        imported_decks.append({
            "name": config["name"],
            "id": deck.id,
            "cards": cards_count,
            "exists": False
        })
        total_cards += cards_count
    
    db.commit()
    
    new_decks_count = sum(1 for d in imported_decks if not d.get("exists", False))
    
    return {
        "status": "success",
        "message": f"Successfully imported {new_decks_count} new decks ({len(existing_decks)} already existed)",
        "decks": imported_decks,
        "total_cards": total_cards
    }


def _import_cards(db: Session, user_id: int, deck_id: int, cards_data: list) -> int:
    """
    Import cards with tags and scheduling states.
    
    Args:
        db: Database session
        user_id: User ID
        deck_id: Deck ID
        cards_data: List of card dictionaries
        
    Returns:
        int: Number of cards imported
    """
    cards_imported = 0
    now = datetime.utcnow()
    
    for card_data in cards_data:
        # Create card
        card = Card(
            user_id=user_id,
            deck_id=deck_id,
            front=card_data["front"],
            back=card_data["back"],
            notes=card_data.get("notes", ""),
            suspended=False
        )
        db.add(card)
        db.flush()  # Get card ID
        
        # Add tags
        tag_names = card_data.get("tags", [])
        for tag_name in tag_names:
            # Get or create tag
            tag = db.query(Tag).filter(
                Tag.user_id == user_id,
                Tag.name == tag_name
            ).first()
            
            if not tag:
                tag = Tag(user_id=user_id, name=tag_name)
                db.add(tag)
                db.flush()
            
            # Associate card with tag
            db.execute(
                card_tags.insert().values(
                    card_id=card.id,
                    tag_id=tag.id,
                    created_at=now
                )
            )
        
        # Initialize scheduling state (new card, due immediately)
        sched_state = SchedState(
            card_id=card.id,
            user_id=user_id,
            state="new",
            due_at=now,
            interval_days=0.0,
            ease_factor=2.5,
            learning_step=0,
            lapses=0,
            version=0
        )
        db.add(sched_state)
        
        cards_imported += 1
    
    return cards_imported


def _count_cards(db: Session, deck_id: int) -> int:
    """
    Count cards in a deck.
    
    Args:
        db: Database session
        deck_id: Deck ID
        
    Returns:
        int: Number of cards
    """
    return db.query(Card).filter(Card.deck_id == deck_id).count()


def check_import_status(db: Session, user_id: int = 1) -> dict:
    """
    Check if prebuilt decks have been imported.
    
    Args:
        db: Database session
        user_id: User ID (default 1 for POC)
        
    Returns:
        dict: Import status
    """
    deck_names = [
        "JLPT N4 Vocabulary",
        "JLPT N4 Kanji",
        "JLPT N4 Numbers & Counters",
        "JLPT N4 Food & Dining",
        "JLPT N4 Transportation",
        "JLPT N4 Colors & Descriptions",
        "JLPT N4 Weather & Seasons",
        "JLPT N4 Family",
        "JLPT N4 Adverbs"
    ]
    
    decks_info = []
    total_cards = 0
    
    for deck_name in deck_names:
        deck = db.query(Deck).filter(
            Deck.user_id == user_id,
            Deck.name == deck_name
        ).first()
        
        if deck:
            card_count = db.query(Card).filter(Card.deck_id == deck.id).count()
            decks_info.append({
                "name": deck_name,
                "id": deck.id,
                "exists": True,
                "card_count": card_count
            })
            total_cards += card_count
        else:
            decks_info.append({
                "name": deck_name,
                "id": None,
                "exists": False,
                "card_count": 0
            })
    
    imported_count = sum(1 for d in decks_info if d["exists"])
    
    return {
        "imported": imported_count > 0,
        "imported_count": imported_count,
        "total_decks": len(deck_names),
        "decks": decks_info,
        "total_cards": total_cards
    }
