"""
Unit tests for database models.
Tests REQ-1 (Decks), REQ-2 (Cards), REQ-3 (Tags), REQ-4 (SchedStates)
"""
import pytest
from datetime import datetime, timedelta
from app.models.database import User, Deck, Card, Tag, SchedState, ReviewLog, DailyCounter


def test_create_user(db):
    """Test creating a user."""
    user = User(username="new_user", timezone="America/New_York")
    db.add(user)
    db.commit()
    db.refresh(user)
    
    assert user.id is not None
    assert user.username == "new_user"
    assert user.timezone == "America/New_York"
    assert user.created_at is not None


def test_create_deck(db, test_user):
    """Test creating a deck (REQ-1)."""
    deck = Deck(
        user_id=test_user.id,
        name="JLPT N5 Vocabulary",
        description="Basic vocabulary for N5"
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    
    assert deck.id is not None
    assert deck.name == "JLPT N5 Vocabulary"
    assert deck.user_id == test_user.id


def test_create_card(db, test_user):
    """Test creating a card (REQ-2)."""
    # Create deck first
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    # Create card
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="こんにちは",
        back="Hello",
        notes="Common greeting"
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    
    assert card.id is not None
    assert card.front == "こんにちは"
    assert card.back == "Hello"
    assert card.suspended is False


def test_create_tag(db, test_user):
    """Test creating a tag (REQ-3)."""
    tag = Tag(user_id=test_user.id, name="noun")
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    assert tag.id is not None
    assert tag.name == "noun"


def test_card_tags_relationship(db, test_user):
    """Test many-to-many relationship between cards and tags (REQ-3)."""
    # Create deck
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    # Create tags
    tag1 = Tag(user_id=test_user.id, name="noun")
    tag2 = Tag(user_id=test_user.id, name="jlpt-n5")
    db.add_all([tag1, tag2])
    db.commit()
    
    # Create card with tags
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="本",
        back="book"
    )
    card.tags = [tag1, tag2]
    db.add(card)
    db.commit()
    db.refresh(card)
    
    assert len(card.tags) == 2
    assert tag1 in card.tags
    assert tag2 in card.tags


def test_create_sched_state(db, test_user):
    """Test creating scheduling state (REQ-4)."""
    # Create deck and card
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="テスト",
        back="test"
    )
    db.add(card)
    db.commit()
    
    # Create sched state
    sched = SchedState(
        card_id=card.id,
        user_id=test_user.id,
        state="new",
        due_at=datetime.utcnow(),
        interval_days=0.0,
        ease_factor=2.5,
        learning_step=0,
        lapses=0,
        version=0
    )
    db.add(sched)
    db.commit()
    db.refresh(sched)
    
    assert sched.id is not None
    assert sched.state == "new"
    assert sched.ease_factor == 2.5
    assert sched.interval_days == 0.0


def test_ease_factor_constraint(db, test_user):
    """Test that ease factor is constrained between 1.3 and 3.0 (REQ-4)."""
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="test",
        back="test"
    )
    db.add(card)
    db.commit()
    
    # Try to create with ease factor below minimum
    sched = SchedState(
        card_id=card.id,
        user_id=test_user.id,
        state="review",
        due_at=datetime.utcnow(),
        ease_factor=1.0,  # Below minimum
    )
    db.add(sched)
    
    # This should raise an error when committing
    with pytest.raises(Exception):
        db.commit()
    
    db.rollback()


def test_card_suspended(db, test_user):
    """Test card suspension (REQ-7)."""
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="suspended card",
        back="back",
        suspended=True
    )
    db.add(card)
    db.commit()
    
    assert card.suspended is True


def test_cascade_delete_deck(db, test_user):
    """Test that deleting a deck deletes its cards (REQ-1)."""
    # Create deck with card
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="test",
        back="test"
    )
    db.add(card)
    db.commit()
    
    card_id = card.id
    
    # Delete deck
    db.delete(deck)
    db.commit()
    
    # Card should be deleted too
    deleted_card = db.query(Card).filter(Card.id == card_id).first()
    assert deleted_card is None


def test_review_log(db, test_user):
    """Test creating a review log (REQ-9)."""
    deck = Deck(user_id=test_user.id, name="Test Deck")
    db.add(deck)
    db.commit()
    
    card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="test",
        back="test"
    )
    db.add(card)
    db.commit()
    
    log = ReviewLog(
        card_id=card.id,
        user_id=test_user.id,
        rating="good",
        state_before="new",
        state_after="learning",
        time_taken_ms=5000,
        interval_before=0.0,
        interval_after=1.0,
        ease_factor_before=2.5,
        ease_factor_after=2.5
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    
    assert log.id is not None
    assert log.rating == "good"
    assert log.state_after == "learning"


def test_daily_counter(db, test_user):
    """Test daily counter (REQ-6)."""
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    counter = DailyCounter(
        user_id=test_user.id,
        date=today,
        introduced_new=5,
        reviews_done=20,
        again_count=3,
        good_count=15,
        easy_count=2
    )
    db.add(counter)
    db.commit()
    db.refresh(counter)
    
    assert counter.id is not None
    assert counter.introduced_new == 5
    assert counter.reviews_done == 20
