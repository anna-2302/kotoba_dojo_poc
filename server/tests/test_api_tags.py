"""
Integration tests for Tag API endpoints.
Tests REQ-3: Tags CRUD operations.
"""
import pytest
from fastapi import status


def test_create_tag(client, test_user):
    """Test creating a tag (REQ-3)."""
    response = client.post(
        "/api/tags/",
        json={"name": "noun"}
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "noun"
    assert data["card_count"] == 0
    assert "id" in data
    assert "created_at" in data


def test_create_duplicate_tag(client, test_user):
    """Test creating a duplicate tag fails (REQ-3)."""
    # Create tag
    client.post("/api/tags/", json={"name": "noun"})
    
    # Try to create again
    response = client.post("/api/tags/", json={"name": "noun"})
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"].lower()


def test_list_tags_empty(client, test_user):
    """Test listing tags when none exist."""
    response = client.get("/api/tags/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 0
    assert data["tags"] == []


def test_list_tags(client, test_user):
    """Test listing tags (REQ-3)."""
    # Create tags
    client.post("/api/tags/", json={"name": "noun"})
    client.post("/api/tags/", json={"name": "verb"})
    client.post("/api/tags/", json={"name": "jlpt-n5"})
    
    response = client.get("/api/tags/")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 3
    assert len(data["tags"]) == 3
    
    tag_names = [t["name"] for t in data["tags"]]
    assert "noun" in tag_names
    assert "verb" in tag_names
    assert "jlpt-n5" in tag_names


def test_get_tag(client, test_user):
    """Test getting a specific tag."""
    # Create tag
    create_response = client.post(
        "/api/tags/",
        json={"name": "test-tag"}
    )
    tag_id = create_response.json()["id"]
    
    # Get tag
    response = client.get(f"/api/tags/{tag_id}")
    
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == tag_id
    assert data["name"] == "test-tag"
    assert data["card_count"] == 0


def test_get_tag_not_found(client, test_user):
    """Test getting a non-existent tag."""
    response = client.get("/api/tags/999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_tag_card_count(client, test_user):
    """Test that tag shows correct card count (REQ-3)."""
    # Create tag
    tag = client.post("/api/tags/", json={"name": "test-tag"}).json()
    
    # Create deck
    deck = client.post("/api/decks/", json={"name": "Test Deck"}).json()
    
    # Initially 0 cards
    response = client.get(f"/api/tags/{tag['id']}")
    assert response.json()["card_count"] == 0
    
    # Create cards with tag
    client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "Card 1",
            "back": "Back 1",
            "tag_ids": [tag["id"]]
        }
    )
    client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "Card 2",
            "back": "Back 2",
            "tag_ids": [tag["id"]]
        }
    )
    
    # Check count updated
    response = client.get(f"/api/tags/{tag['id']}")
    assert response.json()["card_count"] == 2


def test_delete_tag(client, test_user):
    """Test deleting a tag (REQ-3)."""
    # Create tag
    tag = client.post("/api/tags/", json={"name": "to-delete"}).json()
    
    # Delete tag
    response = client.delete(f"/api/tags/{tag['id']}")
    
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify it's gone
    get_response = client.get(f"/api/tags/{tag['id']}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND


def test_delete_tag_removes_from_cards(client, test_user):
    """Test that deleting a tag removes it from cards (REQ-3)."""
    # Create tag
    tag = client.post("/api/tags/", json={"name": "test-tag"}).json()
    
    # Create deck and card with tag
    deck = client.post("/api/decks/", json={"name": "Test Deck"}).json()
    card = client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "Card",
            "back": "Back",
            "tag_ids": [tag["id"]]
        }
    ).json()
    
    # Verify card has tag
    assert len(card["tags"]) == 1
    
    # Delete tag
    client.delete(f"/api/tags/{tag['id']}")
    
    # Verify tag removed from card
    card_response = client.get(f"/api/cards/{card['id']}")
    card_data = card_response.json()
    assert len(card_data["tags"]) == 0


def test_delete_tag_not_found(client, test_user):
    """Test deleting a non-existent tag."""
    response = client.delete("/api/tags/999")
    
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_multiple_tags_on_card(client, test_user):
    """Test that a card can have multiple tags (REQ-3)."""
    # Create tags
    tag1 = client.post("/api/tags/", json={"name": "noun"}).json()
    tag2 = client.post("/api/tags/", json={"name": "jlpt-n5"}).json()
    tag3 = client.post("/api/tags/", json={"name": "basic"}).json()
    
    # Create deck and card with multiple tags
    deck = client.post("/api/decks/", json={"name": "Test Deck"}).json()
    card = client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "本",
            "back": "book",
            "tag_ids": [tag1["id"], tag2["id"], tag3["id"]]
        }
    ).json()
    
    # Verify all tags present
    assert len(card["tags"]) == 3
    tag_names = [t["name"] for t in card["tags"]]
    assert "noun" in tag_names
    assert "jlpt-n5" in tag_names
    assert "basic" in tag_names


def test_filter_cards_by_tag(client, test_user):
    """Test filtering cards by tag (REQ-3)."""
    # Create tags
    tag1 = client.post("/api/tags/", json={"name": "noun"}).json()
    tag2 = client.post("/api/tags/", json={"name": "verb"}).json()
    
    # Create deck
    deck = client.post("/api/decks/", json={"name": "Test Deck"}).json()
    
    # Create cards with different tags
    client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "Card 1",
            "back": "Back 1",
            "tag_ids": [tag1["id"]]
        }
    )
    client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "Card 2",
            "back": "Back 2",
            "tag_ids": [tag1["id"]]
        }
    )
    client.post(
        "/api/cards/",
        json={
            "deck_id": deck["id"],
            "front": "Card 3",
            "back": "Back 3",
            "tag_ids": [tag2["id"]]
        }
    )
    
    # Filter by tag1 (noun)
    response = client.get(f"/api/cards/?tag_ids={tag1['id']}")
    data = response.json()
    assert data["total"] == 2
    
    # Filter by tag2 (verb)
    response = client.get(f"/api/cards/?tag_ids={tag2['id']}")
    data = response.json()
    assert data["total"] == 1
