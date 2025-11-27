"""
Integration tests for Deck API endpoints.
Tests REQ-1: Decks CRUD operations.
"""
import pytest
from fastapi import status


def test_create_deck(client, test_user):
    """Test creating a deck (REQ-1)."""
    response = client.post(
        "/api/decks/",
        json={
            "name": "JLPT N5 Vocabulary",
            "description": "Basic Japanese vocabulary",
            "new_per_day": 20,
            "review_per_day": 150
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "JLPT N5 Vocabulary"
    assert data["description"] == "Basic Japanese vocabulary"
    assert data["new_per_day"] == 20
    assert data["review_per_day"] == 150
    assert data["card_count"] == 0
    assert data["due_count"] == 0
    assert data["new_count"] == 0
    assert "id" in data
    assert "created_at" in data


def test_create_deck_minimal(client, test_user):
    """Test creating a deck with minimal fields."""
    response = client.post(
        "/api/decks/",
        json={"name": "Test Deck"}
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Test Deck"
    assert data["description"] is None
    assert data["new_per_day"] is None
    assert data["review_per_day"] is None


def test_list_decks_empty(client, test_user):
    """Test listing decks when none exist."""
    response = client.get("/api/decks/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 0
    assert data["decks"] == []


def test_list_decks(client, test_user):
    """Test listing multiple decks."""
    # Create decks
    client.post("/api/decks/", json={"name": "Deck 1"})
    client.post("/api/decks/", json={"name": "Deck 2"})
    client.post("/api/decks/", json={"name": "Deck 3"})
    
    response = client.get("/api/decks/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 3
    assert len(data["decks"]) == 3
    
    deck_names = [d["name"] for d in data["decks"]]
    assert "Deck 1" in deck_names
    assert "Deck 2" in deck_names
    assert "Deck 3" in deck_names


def test_get_deck(client, test_user):
    """Test getting a specific deck."""
    # Create deck
    create_response = client.post(
        "/api/decks/",
        json={"name": "Test Deck", "description": "Description"}
    )
    deck_id = create_response.json()["id"]
    
    # Get deck
    response = client.get(f"/api/decks/{deck_id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == deck_id
    assert data["name"] == "Test Deck"
    assert data["description"] == "Description"


def test_get_deck_not_found(client, test_user):
    """Test getting a non-existent deck."""
    response = client.get("/api/decks/999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "not found" in response.json()["detail"].lower()


def test_update_deck(client, test_user):
    """Test updating a deck (REQ-1: rename deck)."""
    # Create deck
    create_response = client.post(
        "/api/decks/",
        json={"name": "Original Name", "description": "Original"}
    )
    deck_id = create_response.json()["id"]
    
    # Update deck
    response = client.put(
        f"/api/decks/{deck_id}",
        json={
            "name": "Updated Name",
            "description": "Updated description",
            "new_per_day": 25
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Name"
    assert data["description"] == "Updated description"
    assert data["new_per_day"] == 25


def test_update_deck_partial(client, test_user):
    """Test partial update of a deck."""
    # Create deck
    create_response = client.post(
        "/api/decks/",
        json={"name": "Original", "description": "Description"}
    )
    deck_id = create_response.json()["id"]
    
    # Update only name
    response = client.put(
        f"/api/decks/{deck_id}",
        json={"name": "New Name"}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "New Name"
    assert data["description"] == "Description"  # Unchanged


def test_update_deck_not_found(client, test_user):
    """Test updating a non-existent deck."""
    response = client.put(
        "/api/decks/999",
        json={"name": "New Name"}
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_deck(client, test_user):
    """Test deleting a deck (REQ-1)."""
    # Create deck
    create_response = client.post(
        "/api/decks/",
        json={"name": "To Delete"}
    )
    deck_id = create_response.json()["id"]
    
    # Delete deck
    response = client.delete(f"/api/decks/{deck_id}")
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's gone
    get_response = client.get(f"/api/decks/{deck_id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_deck_not_found(client, test_user):
    """Test deleting a non-existent deck."""
    response = client.delete("/api/decks/999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_deck_cascades_to_cards(client, test_user, db):
    """Test that deleting a deck deletes its cards (REQ-1)."""
    from app.models.database import Deck, Card
    
    # Create deck
    create_response = client.post(
        "/api/decks/",
        json={"name": "Test Deck"}
    )
    deck_id = create_response.json()["id"]
    
    # Create card in deck
    card_response = client.post(
        "/api/cards/",
        json={
            "deck_id": deck_id,
            "front": "Test front",
            "back": "Test back"
        }
    )
    card_id = card_response.json()["id"]
    
    # Delete deck
    client.delete(f"/api/decks/{deck_id}")
    
    # Verify card is also deleted
    card_check = db.query(Card).filter(Card.id == card_id).first()
    assert card_check is None


def test_deck_card_counts(client, test_user):
    """Test that deck shows correct card counts (REQ-1)."""
    # Create deck
    create_response = client.post(
        "/api/decks/",
        json={"name": "Test Deck"}
    )
    deck_id = create_response.json()["id"]
    
    # Initially no cards
    response = client.get(f"/api/decks/{deck_id}")
    assert response.json()["card_count"] == 0
    
    # Add cards
    client.post(
        "/api/cards/",
        json={"deck_id": deck_id, "front": "Card 1", "back": "Back 1"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": deck_id, "front": "Card 2", "back": "Back 2"}
    )
    
    # Check count updated
    response = client.get(f"/api/decks/{deck_id}")
    assert response.json()["card_count"] == 2
