"""
Tests for Import API endpoints.
Tests REQ-12 (Prebuilt N4 Decks).
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import Base, get_db
from app.models.database import User, Deck, Card, Tag

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_import.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(scope="function")
def setup_database():
    """Create test database before each test."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_import_status_before_import(setup_database):
    """Test that import status shows not imported initially."""
    response = client.get("/api/import/status")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["imported"] is False
    assert data["vocab_deck_exists"] is False
    assert data["kanji_deck_exists"] is False
    assert data["total_cards"] == 0


def test_import_prebuilt_decks(setup_database):
    """Test importing prebuilt decks successfully."""
    response = client.post("/api/import/prebuilt")
    
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] == "success"
    assert data["vocab_deck_id"] is not None
    assert data["kanji_deck_id"] is not None
    assert data["vocab_cards"] == 30
    assert data["kanji_cards"] == 20
    assert data["total_cards"] == 50


def test_import_creates_decks(setup_database):
    """Test that import creates both decks in database."""
    # Import decks
    client.post("/api/import/prebuilt")
    
    # Verify decks exist
    db = TestingSessionLocal()
    try:
        vocab_deck = db.query(Deck).filter(Deck.name == "JLPT N4 Vocabulary").first()
        kanji_deck = db.query(Deck).filter(Deck.name == "JLPT N4 Kanji").first()
        
        assert vocab_deck is not None
        assert kanji_deck is not None
        assert vocab_deck.user_id == 1
        assert kanji_deck.user_id == 1
    finally:
        db.close()


def test_import_creates_cards(setup_database):
    """Test that import creates all cards with correct data."""
    # Import decks
    response = client.post("/api/import/prebuilt")
    data = response.json()
    
    # Verify cards exist
    db = TestingSessionLocal()
    try:
        vocab_cards = db.query(Card).filter(Card.deck_id == data["vocab_deck_id"]).all()
        kanji_cards = db.query(Card).filter(Card.deck_id == data["kanji_deck_id"]).all()
        
        assert len(vocab_cards) == 30
        assert len(kanji_cards) == 20
        
        # Check sample card has content
        sample_card = vocab_cards[0]
        assert sample_card.front != ""
        assert sample_card.back != ""
        assert sample_card.suspended is False
    finally:
        db.close()


def test_import_creates_tags(setup_database):
    """Test that import creates tags and associates them with cards."""
    # Import decks
    client.post("/api/import/prebuilt")
    
    # Verify tags exist
    db = TestingSessionLocal()
    try:
        tags = db.query(Tag).all()
        
        # Should have multiple tags (noun, verb, adjective, kanji, etc.)
        assert len(tags) > 0
        
        # Check specific expected tags
        tag_names = [tag.name for tag in tags]
        assert "n4" in tag_names
        assert "verb" in tag_names or "noun" in tag_names
        assert "kanji" in tag_names
    finally:
        db.close()


def test_import_creates_scheduling_states(setup_database):
    """Test that import initializes scheduling states for all cards."""
    # Import decks
    response = client.post("/api/import/prebuilt")
    
    # Verify scheduling states exist
    db = TestingSessionLocal()
    try:
        from app.models.database import SchedState
        
        # Count scheduling states
        sched_count = db.query(SchedState).count()
        
        # Should have one for each card (50 total)
        assert sched_count == 50
        
        # Check a sample state
        sample_state = db.query(SchedState).first()
        assert sample_state.state == "new"
        assert sample_state.ease_factor == 2.5
        assert sample_state.interval_days == 0.0
    finally:
        db.close()


def test_import_is_idempotent(setup_database):
    """Test that importing twice doesn't create duplicates."""
    # First import
    response1 = client.post("/api/import/prebuilt")
    assert response1.status_code == 200
    assert response1.json()["status"] == "success"
    
    # Second import
    response2 = client.post("/api/import/prebuilt")
    assert response2.status_code == 200
    data2 = response2.json()
    
    # Should indicate already imported
    assert data2["status"] == "already_imported"
    assert data2["cards_imported"] == 0
    
    # Verify no duplicate decks
    db = TestingSessionLocal()
    try:
        deck_count = db.query(Deck).count()
        assert deck_count == 2  # Still only 2 decks
    finally:
        db.close()


def test_import_status_after_import(setup_database):
    """Test that import status correctly reflects imported state."""
    # Import decks
    client.post("/api/import/prebuilt")
    
    # Check status
    response = client.get("/api/import/status")
    assert response.status_code == 200
    data = response.json()
    
    assert data["imported"] is True
    assert data["vocab_deck_exists"] is True
    assert data["kanji_deck_exists"] is True
    assert data["vocab_card_count"] == 30
    assert data["kanji_card_count"] == 20
    assert data["total_cards"] == 50


def test_import_cards_have_correct_structure(setup_database):
    """Test that imported cards have the expected structure."""
    # Import decks
    response = client.post("/api/import/prebuilt")
    data = response.json()
    
    # Get a card and verify structure
    db = TestingSessionLocal()
    try:
        card = db.query(Card).filter(Card.deck_id == data["vocab_deck_id"]).first()
        
        assert card.front is not None
        assert card.back is not None
        assert card.user_id == 1
        assert card.suspended is False
        
        # Check if card has tags
        assert len(card.tags) > 0
        
        # Check if card has scheduling state
        assert card.sched_state is not None
    finally:
        db.close()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
