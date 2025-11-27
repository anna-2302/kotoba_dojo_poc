"""
Settings API endpoints.
Implements REQ-10 (Dark Mode) and REQ-11 (Music).
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.database import User, UserSettings
from app.schemas.schemas import UserSettingsResponse, UserSettingsUpdate

router = APIRouter()


def get_default_user(db: Session) -> User:
    """
    Get the default user (POC assumes single user).
    Creates user and settings if they don't exist.
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(id=1, username="default_user", timezone="UTC")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Ensure settings exist
    if not user.settings:
        settings = UserSettings(
            user_id=user.id,
            learning_steps="10,1440",  # 10 min, 1 day
            dark_mode=False,
            music_enabled=False,
            music_volume=0.5
        )
        db.add(settings)
        db.commit()
    
    return user


@router.get("", response_model=UserSettingsResponse)
async def get_settings(db: Session = Depends(get_db)):
    """
    Get user settings.
    
    Returns:
        UserSettingsResponse: Current user settings
    """
    user = get_default_user(db)
    
    if not user.settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    return user.settings


@router.put("", response_model=UserSettingsResponse)
async def update_settings(
    settings_update: UserSettingsUpdate,
    db: Session = Depends(get_db)
):
    """
    Update user settings.
    
    Args:
        settings_update: Settings fields to update
        
    Returns:
        UserSettingsResponse: Updated settings
    """
    user = get_default_user(db)
    
    if not user.settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    
    # Update only provided fields
    update_data = settings_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(user.settings, field, value)
    
    db.commit()
    db.refresh(user.settings)
    
    return user.settings
