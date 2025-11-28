"""
Tests for deck stats endpoint.
Testing Phase 4.1 Task 1: Backend API Enhancement.
"""
import pytest
from fastapi.testclient import TestClient
from server.app.main import app
from server.tests.conftest import db, client, test_user
from server.app.models.database import Deck, Card, SchedState
from datetime import datetime, timedelta


def test_list_decks_includes_learning_and_review_counts(client, test_user, db):
    """Test that list decks endpoint includes learning_count and review_count."""
    
    # Create a test deck
    deck = Deck(
        user_id=test_user.id,
        name="Test Deck",
        description="Test deck for stats"
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    
    # Create cards with different states
    now = datetime.utcnow()
    past = now - timedelta(minutes=30)
    
    # New card (no sched state)
    new_card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="New card",
        back="Back"
    )
    db.add(new_card)
    
    # Learning card (due now)
    learning_card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="Learning card",
        back="Back"
    )
    db.add(learning_card)
    db.commit()
    db.refresh(learning_card)
    
    learning_state = SchedState(
        card_id=learning_card.id,
        state='learning',
        due_at=past,  # Due now
        interval_days=0,
        ease_factor=2.5,
        repetition=0,
        lapses=0,
        learning_step_index=0
    )
    db.add(learning_state)
    
    # Review card (due now)
    review_card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="Review card",
        back="Back"
    )
    db.add(review_card)
    db.commit()
    db.refresh(review_card)
    
    review_state = SchedState(
        card_id=review_card.id,
        state='review',
        due_at=past,  # Due now
        interval_days=1,
        ease_factor=2.5,
        repetition=1,
        lapses=0
    )
    db.add(review_state)
    
    # Review card (not due yet)
    future_review_card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="Future review card",
        back="Back"
    )
    db.add(future_review_card)
    db.commit()
    db.refresh(future_review_card)
    
    future_review_state = SchedState(
        card_id=future_review_card.id,
        state='review',
        due_at=now + timedelta(days=1),  # Due tomorrow
        interval_days=2,
        ease_factor=2.5,
        repetition=2,
        lapses=0
    )
    db.add(future_review_state)
    
    db.commit()
    
    # Test the list decks endpoint
    response = client.get("/api/decks")
    assert response.status_code == 200
    
    data = response.json()
    assert "decks" in data
    assert len(data["decks"]) == 1
    
    deck_data = data["decks"][0]
    
    # Verify the new fields are present
    assert "learning_count" in deck_data
    assert "review_count" in deck_data
    
    # Verify the counts are correct
    assert deck_data["new_count"] == 1  # One new card
    assert deck_data["learning_count"] == 1  # One learning card due now
    assert deck_data["review_count"] == 1  # One review card due now (not the future one)
    assert deck_data["card_count"] == 4  # Total cards
    assert deck_data["due_count"] == 3  # new + learning + review due now


def test_get_single_deck_includes_learning_and_review_counts(client, test_user, db):
    """Test that get single deck endpoint includes learning_count and review_count."""
    
    # Create a test deck with cards
    deck = Deck(
        user_id=test_user.id,
        name="Single Test Deck",
        description="Test single deck stats"
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    
    # Create a learning card
    learning_card = Card(
        user_id=test_user.id,
        deck_id=deck.id,
        front="Learning card",
        back="Back"
    )
    db.add(learning_card)
    db.commit()
    db.refresh(learning_card)
    
    learning_state = SchedState(
        card_id=learning_card.id,
        state='learning',
        due_at=datetime.utcnow() - timedelta(minutes=5),  # Due now
        interval_days=0,
        ease_factor=2.5,
        repetition=0,
        lapses=0,
        learning_step_index=0
    )
    db.add(learning_state)
    db.commit()
    
    # Test the single deck endpoint
    response = client.get(f"/api/decks/{deck.id}")
    assert response.status_code == 200
    
    deck_data = response.json()
    
    # Verify the new fields are present
    assert "learning_count" in deck_data
    assert "review_count" in deck_data
    
    # Verify the counts
    assert deck_data["learning_count"] == 1
    assert deck_data["review_count"] == 0
    assert deck_data["new_count"] == 0
    assert deck_data["card_count"] == 1


def test_update_deck_includes_learning_and_review_counts(client, test_user, db):
    """Test that update deck endpoint includes learning_count and review_count."""
    
    # Create a test deck
    deck = Deck(
        user_id=test_user.id,
        name="Update Test Deck"
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    
    # Update the deck
    response = client.put(f"/api/decks/{deck.id}", json={
        "name": "Updated Deck Name"
    })
    assert response.status_code == 200
    
    deck_data = response.json()
    
    # Verify the new fields are present (even if zero)
    assert "learning_count" in deck_data
    assert "review_count" in deck_data
    assert deck_data["learning_count"] == 0
    assert deck_data["review_count"] == 0
    assert deck_data["name"] == "Updated Deck Name"