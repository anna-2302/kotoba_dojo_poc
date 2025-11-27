"""
Card CRUD API endpoints.
Implements REQ-2: Cards and REQ-7: Suspend/Unsuspend from PRD.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from datetime import datetime

from app.db.session import get_db
from app.models.database import Card, Deck, Tag, User, SchedState
from app.schemas.schemas import (
    CardCreate,
    CardUpdate,
    CardResponse,
    CardListResponse,
    CardBrowseFilter,
    TagResponse
)

router = APIRouter()


def get_default_user(db: Session) -> User:
    """Get default user for POC (single-user assumption)."""
    user = db.query(User).filter(User.username == "default_user").first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default user not found. Run migrations."
        )
    return user


def build_card_response(card: Card, db: Session) -> CardResponse:
    """Build a CardResponse with all related data."""
    # Get deck name
    deck_name = card.deck.name if card.deck else ""
    
    # Get tags
    tag_responses = [
        TagResponse(
            id=tag.id,
            user_id=tag.user_id,
            name=tag.name,
            card_count=0,  # Not calculating for performance
            created_at=tag.created_at
        )
        for tag in card.tags
    ]
    
    # Get scheduling state if exists
    sched_state = card.sched_state
    state = sched_state.state if sched_state else "new"
    due_at = sched_state.due_at if sched_state else None
    interval_days = sched_state.interval_days if sched_state else None
    
    return CardResponse(
        id=card.id,
        user_id=card.user_id,
        deck_id=card.deck_id,
        deck_name=deck_name,
        front=card.front,
        back=card.back,
        notes=card.notes,
        suspended=card.suspended,
        tags=tag_responses,
        state=state,
        due_at=due_at,
        interval_days=interval_days,
        created_at=card.created_at,
        updated_at=card.updated_at
    )


@router.get("/", response_model=CardListResponse)
def list_cards(
    deck_ids: Optional[List[int]] = Query(None),
    tag_ids: Optional[List[int]] = Query(None),
    state: Optional[str] = Query(None),
    suspended: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """
    List and search cards with filters.
    
    REQ-2: Browse cards with filtering.
    REQ-8: Browse/search with filters.
    """
    user = get_default_user(db)
    
    # Base query
    query = db.query(Card).filter(Card.user_id == user.id)
    
    # Apply filters
    if deck_ids:
        query = query.filter(Card.deck_id.in_(deck_ids))
    
    if suspended is not None:
        query = query.filter(Card.suspended == suspended)
    
    # Filter by state (requires join with sched_states)
    if state:
        query = query.join(SchedState, Card.id == SchedState.card_id)
        query = query.filter(SchedState.state == state)
    
    # Filter by tags (requires join with card_tags and tags)
    if tag_ids:
        from app.models.database import card_tags
        query = query.join(card_tags, Card.id == card_tags.c.card_id)
        query = query.filter(card_tags.c.tag_id.in_(tag_ids))
    
    # Search in front/back
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Card.front.ilike(search_pattern),
                Card.back.ilike(search_pattern),
                Card.notes.ilike(search_pattern)
            )
        )
    
    # Count total before pagination
    total = query.count()
    
    # Apply sorting
    if sort_order.lower() == "asc":
        query = query.order_by(getattr(Card, sort_by).asc())
    else:
        query = query.order_by(getattr(Card, sort_by).desc())
    
    # Apply pagination
    offset = (page - 1) * page_size
    cards = query.offset(offset).limit(page_size).all()
    
    # Build responses
    card_responses = [build_card_response(card, db) for card in cards]
    
    return CardListResponse(
        cards=card_responses,
        total=total,
        page=page,
        page_size=page_size,
        has_more=(offset + page_size) < total
    )


@router.post("/", response_model=CardResponse, status_code=status.HTTP_201_CREATED)
def create_card(
    card_in: CardCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new card.
    
    REQ-2: User can create a card with front/back; assign to deck.
    """
    user = get_default_user(db)
    
    # Verify deck exists and belongs to user
    deck = db.query(Deck).filter(
        Deck.id == card_in.deck_id,
        Deck.user_id == user.id
    ).first()
    
    if not deck:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Deck {card_in.deck_id} not found"
        )
    
    # Create card
    card = Card(
        user_id=user.id,
        deck_id=card_in.deck_id,
        front=card_in.front,
        back=card_in.back,
        notes=card_in.notes,
        suspended=False
    )
    
    # Add tags if provided
    if card_in.tag_ids:
        tags = db.query(Tag).filter(
            Tag.id.in_(card_in.tag_ids),
            Tag.user_id == user.id
        ).all()
        card.tags = tags
    
    db.add(card)
    db.commit()
    db.refresh(card)
    
    # Create initial scheduling state
    sched_state = SchedState(
        card_id=card.id,
        user_id=user.id,
        state='new',
        due_at=datetime.utcnow(),
        interval_days=0.0,
        ease_factor=2.5,
        learning_step=0,
        lapses=0,
        version=0
    )
    db.add(sched_state)
    db.commit()
    db.refresh(card)
    
    return build_card_response(card, db)


@router.get("/{card_id}", response_model=CardResponse)
def get_card(
    card_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific card by ID.
    
    REQ-2: View card details.
    """
    user = get_default_user(db)
    
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.user_id == user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card {card_id} not found"
        )
    
    return build_card_response(card, db)


@router.put("/{card_id}", response_model=CardResponse)
def update_card(
    card_id: int,
    card_in: CardUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a card.
    
    REQ-2: User can edit card text later.
    Move card to another deck.
    """
    user = get_default_user(db)
    
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.user_id == user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card {card_id} not found"
        )
    
    # If moving to different deck, verify it exists
    if card_in.deck_id is not None and card_in.deck_id != card.deck_id:
        deck = db.query(Deck).filter(
            Deck.id == card_in.deck_id,
            Deck.user_id == user.id
        ).first()
        
        if not deck:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Deck {card_in.deck_id} not found"
            )
    
    # Update basic fields
    update_data = card_in.model_dump(exclude_unset=True, exclude={'tag_ids'})
    for field, value in update_data.items():
        setattr(card, field, value)
    
    # Update tags if provided
    if card_in.tag_ids is not None:
        tags = db.query(Tag).filter(
            Tag.id.in_(card_in.tag_ids),
            Tag.user_id == user.id
        ).all()
        card.tags = tags
    
    db.commit()
    db.refresh(card)
    
    return build_card_response(card, db)


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a card.
    
    REQ-2: Deleting a card removes it from scheduling and lists.
    """
    user = get_default_user(db)
    
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.user_id == user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card {card_id} not found"
        )
    
    # Delete card (cascade will delete sched_state and review_logs)
    db.delete(card)
    db.commit()
    
    return None


@router.patch("/{card_id}/suspend", response_model=CardResponse)
def toggle_suspend(
    card_id: int,
    suspend: bool = Query(..., description="True to suspend, False to unsuspend"),
    db: Session = Depends(get_db)
):
    """
    Suspend or unsuspend a card.
    
    REQ-7: Suspend/unsuspend cards.
    Suspended cards are excluded from review queues.
    """
    user = get_default_user(db)
    
    card = db.query(Card).filter(
        Card.id == card_id,
        Card.user_id == user.id
    ).first()
    
    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card {card_id} not found"
        )
    
    card.suspended = suspend
    db.commit()
    db.refresh(card)
    
    return build_card_response(card, db)
