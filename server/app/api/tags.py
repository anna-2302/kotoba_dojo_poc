"""
Tag CRUD API endpoints.
Implements REQ-3: Tags from PRD.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.database import Tag, User
from app.schemas.schemas import (
    TagCreate,
    TagResponse,
    TagListResponse
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


@router.get("/", response_model=TagListResponse)
def list_tags(
    db: Session = Depends(get_db)
):
    """
    List all tags for the user.
    
    REQ-3: Show all tags with card counts.
    """
    user = get_default_user(db)
    
    # Get tags with card counts
    tags = db.query(Tag).filter(Tag.user_id == user.id).all()
    
    tag_responses = []
    for tag in tags:
        # Count cards with this tag
        card_count = len(tag.cards)
        
        tag_responses.append(
            TagResponse(
                id=tag.id,
                user_id=tag.user_id,
                name=tag.name,
                card_count=card_count,
                created_at=tag.created_at
            )
        )
    
    return TagListResponse(
        tags=tag_responses,
        total=len(tag_responses)
    )


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_in: TagCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new tag.
    
    REQ-3: Add tags for categorizing cards.
    """
    user = get_default_user(db)
    
    # Check if tag already exists for this user
    existing_tag = db.query(Tag).filter(
        Tag.user_id == user.id,
        Tag.name == tag_in.name
    ).first()
    
    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tag '{tag_in.name}' already exists"
        )
    
    # Create tag
    tag = Tag(
        user_id=user.id,
        name=tag_in.name
    )
    
    db.add(tag)
    db.commit()
    db.refresh(tag)
    
    return TagResponse(
        id=tag.id,
        user_id=tag.user_id,
        name=tag.name,
        card_count=0,
        created_at=tag.created_at
    )


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(
    tag_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific tag by ID.
    
    REQ-3: View tag details with card count.
    """
    user = get_default_user(db)
    
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == user.id
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag {tag_id} not found"
        )
    
    card_count = len(tag.cards)
    
    return TagResponse(
        id=tag.id,
        user_id=tag.user_id,
        name=tag.name,
        card_count=card_count,
        created_at=tag.created_at
    )


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a tag.
    
    REQ-3: Remove tags.
    Note: This removes the tag from all cards (cascade).
    """
    user = get_default_user(db)
    
    tag = db.query(Tag).filter(
        Tag.id == tag_id,
        Tag.user_id == user.id
    ).first()
    
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tag {tag_id} not found"
        )
    
    # Delete tag (cascade will remove from card_tags)
    db.delete(tag)
    db.commit()
    
    return None
