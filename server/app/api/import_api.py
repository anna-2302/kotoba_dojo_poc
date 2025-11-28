"""
Import API endpoints.
Handles prebuilt deck imports.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.services.import_prebuilt import import_prebuilt_decks, check_import_status

router = APIRouter()


class DeckInfo(BaseModel):
    """Deck information model."""
    name: str
    id: int | None = None
    cards: int | None = None
    exists: bool | None = None
    card_count: int | None = None


class ImportResponse(BaseModel):
    """Response model for import operations."""
    status: str
    message: str
    decks: list[DeckInfo] = []
    total_cards: int = 0
    cards_imported: int | None = None  # For backwards compatibility


class ImportStatusResponse(BaseModel):
    """Response model for import status check."""
    imported: bool
    imported_count: int
    total_decks: int
    decks: list[DeckInfo]
    total_cards: int


@router.post("/prebuilt", response_model=ImportResponse)
async def import_prebuilt(db: Session = Depends(get_db)):
    """
    Import prebuilt JLPT N4 decks.
    
    Creates 9 themed decks:
    - JLPT N4 Vocabulary (30 cards)
    - JLPT N4 Kanji (20 cards)
    - JLPT N4 Numbers & Counters (15 cards)
    - JLPT N4 Food & Dining (20 cards)
    - JLPT N4 Transportation (15 cards)
    - JLPT N4 Colors & Descriptions (12 cards)
    - JLPT N4 Weather & Seasons (12 cards)
    - JLPT N4 Family (15 cards)
    - JLPT N4 Adverbs (100 cards)
    
    Total: 239 cards across 9 decks
    
    Idempotent: Can be called multiple times safely.
    
    Returns:
        ImportResponse: Import results with deck IDs and card counts
    """
    try:
        result = import_prebuilt_decks(db, user_id=1)
        return ImportResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to import prebuilt decks: {str(e)}"
        )


@router.get("/status", response_model=ImportStatusResponse)
async def get_import_status(db: Session = Depends(get_db)):
    """
    Check if prebuilt decks have been imported.
    
    Returns:
        ImportStatusResponse: Import status and card counts for all decks
    """
    try:
        status = check_import_status(db, user_id=1)
        return ImportStatusResponse(**status)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to check import status: {str(e)}"
        )
