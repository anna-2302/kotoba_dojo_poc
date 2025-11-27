"""
Integration tests for Card API endpoints.
Tests REQ-2: Cards CRUD operations and REQ-7: Suspend/Unsuspend.
"""
import pytest
from fastapi import status


@pytest.fixture
def test_deck(client):
    """Create a test deck for card tests."""
    response = client.post(
        "/api/decks/",
        json={"name": "Test Deck"}
    )
    return response.json()


def test_create_card(client, test_user, test_deck):
    """Test creating a card (REQ-2)."""
    response = client.post(
        "/api/cards/",
        json={
            "deck_id": test_deck["id"],
            "front": "こんにちは",
            "back": "Hello",
            "notes": "Common greeting"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["front"] == "こんにちは"
    assert data["back"] == "Hello"
    assert data["notes"] == "Common greeting"
    assert data["deck_id"] == test_deck["id"]
    assert data["deck_name"] == "Test Deck"
    assert data["suspended"] is False
    assert data["state"] == "new"
    assert "id" in data


def test_create_card_minimal(client, test_user, test_deck):
    """Test creating a card with minimal fields."""
    response = client.post(
        "/api/cards/",
        json={
            "deck_id": test_deck["id"],
            "front": "Front",
            "back": "Back"
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["notes"] is None
    assert data["tags"] == []


def test_create_card_invalid_deck(client, test_user):
    """Test creating a card with invalid deck ID."""
    response = client.post(
        "/api/cards/",
        json={
            "deck_id": 999,
            "front": "Front",
            "back": "Back"
        }
    )
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_card_with_tags(client, test_user, test_deck):
    """Test creating a card with tags (REQ-3)."""
    # Create tags
    tag1_response = client.post("/api/tags/", json={"name": "noun"})
    tag2_response = client.post("/api/tags/", json={"name": "jlpt-n5"})
    
    tag1_id = tag1_response.json()["id"]
    tag2_id = tag2_response.json()["id"]
    
    # Create card with tags
    response = client.post(
        "/api/cards/",
        json={
            "deck_id": test_deck["id"],
            "front": "本",
            "back": "book",
            "tag_ids": [tag1_id, tag2_id]
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert len(data["tags"]) == 2
    tag_names = [t["name"] for t in data["tags"]]
    assert "noun" in tag_names
    assert "jlpt-n5" in tag_names


def test_list_cards_empty(client, test_user):
    """Test listing cards when none exist."""
    response = client.get("/api/cards/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 0
    assert data["cards"] == []
    assert data["page"] == 1
    assert data["has_more"] is False


def test_list_cards(client, test_user, test_deck):
    """Test listing cards."""
    # Create cards
    client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card 1", "back": "Back 1"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card 2", "back": "Back 2"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card 3", "back": "Back 3"}
    )
    
    response = client.get("/api/cards/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 3
    assert len(data["cards"]) == 3


def test_list_cards_pagination(client, test_user, test_deck):
    """Test card pagination (REQ-8)."""
    # Create 5 cards
    for i in range(5):
        client.post(
            "/api/cards/",
            json={"deck_id": test_deck["id"], "front": f"Card {i}", "back": f"Back {i}"}
        )
    
    # Get page 1 with 2 items
    response = client.get("/api/cards/?page=1&page_size=2")
    data = response.json()
    assert data["total"] == 5
    assert len(data["cards"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["has_more"] is True
    
    # Get page 2
    response = client.get("/api/cards/?page=2&page_size=2")
    data = response.json()
    assert len(data["cards"]) == 2
    assert data["page"] == 2
    assert data["has_more"] is True
    
    # Get page 3 (last page)
    response = client.get("/api/cards/?page=3&page_size=2")
    data = response.json()
    assert len(data["cards"]) == 1
    assert data["has_more"] is False


def test_list_cards_filter_by_deck(client, test_user):
    """Test filtering cards by deck (REQ-8)."""
    # Create two decks
    deck1 = client.post("/api/decks/", json={"name": "Deck 1"}).json()
    deck2 = client.post("/api/decks/", json={"name": "Deck 2"}).json()
    
    # Create cards in each deck
    client.post(
        "/api/cards/",
        json={"deck_id": deck1["id"], "front": "D1 Card 1", "back": "Back"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": deck1["id"], "front": "D1 Card 2", "back": "Back"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": deck2["id"], "front": "D2 Card 1", "back": "Back"}
    )
    
    # Filter by deck1
    response = client.get(f"/api/cards/?deck_ids={deck1['id']}")
    data = response.json()
    assert data["total"] == 2
    
    # Filter by deck2
    response = client.get(f"/api/cards/?deck_ids={deck2['id']}")
    data = response.json()
    assert data["total"] == 1


def test_list_cards_search(client, test_user, test_deck):
    """Test searching cards (REQ-8)."""
    # Create cards
    client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "こんにちは", "back": "Hello"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "さようなら", "back": "Goodbye"}
    )
    client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "ありがとう", "back": "Thank you"}
    )
    
    # Search for "Hello"
    response = client.get("/api/cards/?search=Hello")
    data = response.json()
    assert data["total"] == 1
    assert data["cards"][0]["back"] == "Hello"
    
    # Search for Japanese text
    response = client.get("/api/cards/?search=こんにちは")
    data = response.json()
    assert data["total"] == 1
    assert data["cards"][0]["front"] == "こんにちは"


def test_list_cards_filter_suspended(client, test_user, test_deck):
    """Test filtering by suspended status (REQ-7)."""
    # Create cards
    card1 = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card 1", "back": "Back 1"}
    ).json()
    card2 = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card 2", "back": "Back 2"}
    ).json()
    
    # Suspend one card
    client.patch(f"/api/cards/{card1['id']}/suspend?suspend=true")
    
    # Filter for non-suspended
    response = client.get("/api/cards/?suspended=false")
    data = response.json()
    assert data["total"] == 1
    assert data["cards"][0]["id"] == card2["id"]
    
    # Filter for suspended
    response = client.get("/api/cards/?suspended=true")
    data = response.json()
    assert data["total"] == 1
    assert data["cards"][0]["id"] == card1["id"]


def test_get_card(client, test_user, test_deck):
    """Test getting a specific card."""
    # Create card
    create_response = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Front", "back": "Back"}
    )
    card_id = create_response.json()["id"]
    
    # Get card
    response = client.get(f"/api/cards/{card_id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == card_id
    assert data["front"] == "Front"
    assert data["back"] == "Back"


def test_get_card_not_found(client, test_user):
    """Test getting a non-existent card."""
    response = client.get("/api/cards/999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_card(client, test_user, test_deck):
    """Test updating a card (REQ-2: edit card text)."""
    # Create card
    create_response = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Original", "back": "Original"}
    )
    card_id = create_response.json()["id"]
    
    # Update card
    response = client.put(
        f"/api/cards/{card_id}",
        json={
            "front": "Updated Front",
            "back": "Updated Back",
            "notes": "Added notes"
        }
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["front"] == "Updated Front"
    assert data["back"] == "Updated Back"
    assert data["notes"] == "Added notes"


def test_update_card_move_deck(client, test_user):
    """Test moving a card to another deck (REQ-2)."""
    # Create two decks
    deck1 = client.post("/api/decks/", json={"name": "Deck 1"}).json()
    deck2 = client.post("/api/decks/", json={"name": "Deck 2"}).json()
    
    # Create card in deck1
    card = client.post(
        "/api/cards/",
        json={"deck_id": deck1["id"], "front": "Card", "back": "Back"}
    ).json()
    
    # Move to deck2
    response = client.put(
        f"/api/cards/{card['id']}",
        json={"deck_id": deck2["id"]}
    )
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["deck_id"] == deck2["id"]
    assert data["deck_name"] == "Deck 2"


def test_update_card_tags(client, test_user, test_deck):
    """Test updating card tags (REQ-3)."""
    # Create tags
    tag1 = client.post("/api/tags/", json={"name": "tag1"}).json()
    tag2 = client.post("/api/tags/", json={"name": "tag2"}).json()
    tag3 = client.post("/api/tags/", json={"name": "tag3"}).json()
    
    # Create card with tag1
    card = client.post(
        "/api/cards/",
        json={
            "deck_id": test_deck["id"],
            "front": "Card",
            "back": "Back",
            "tag_ids": [tag1["id"]]
        }
    ).json()
    
    # Update to tag2 and tag3
    response = client.put(
        f"/api/cards/{card['id']}",
        json={"tag_ids": [tag2["id"], tag3["id"]]}
    )
    
    data = response.json()
    assert len(data["tags"]) == 2
    tag_names = [t["name"] for t in data["tags"]]
    assert "tag2" in tag_names
    assert "tag3" in tag_names
    assert "tag1" not in tag_names


def test_delete_card(client, test_user, test_deck):
    """Test deleting a card (REQ-2)."""
    # Create card
    card = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card", "back": "Back"}
    ).json()
    
    # Delete card
    response = client.delete(f"/api/cards/{card['id']}")
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's gone
    get_response = client.get(f"/api/cards/{card['id']}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_suspend_card(client, test_user, test_deck):
    """Test suspending a card (REQ-7)."""
    # Create card
    card = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card", "back": "Back"}
    ).json()
    
    assert card["suspended"] is False
    
    # Suspend card
    response = client.patch(f"/api/cards/{card['id']}/suspend?suspend=true")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["suspended"] is True


def test_unsuspend_card(client, test_user, test_deck):
    """Test unsuspending a card (REQ-7)."""
    # Create and suspend card
    card = client.post(
        "/api/cards/",
        json={"deck_id": test_deck["id"], "front": "Card", "back": "Back"}
    ).json()
    
    client.patch(f"/api/cards/{card['id']}/suspend?suspend=true")
    
    # Unsuspend card
    response = client.patch(f"/api/cards/{card['id']}/suspend?suspend=false")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["suspended"] is False


def test_suspend_card_not_found(client, test_user):
    """Test suspending a non-existent card."""
    response = client.patch("/api/cards/999/suspend?suspend=true")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND
