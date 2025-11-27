"""
Statistics API endpoints.
Provides daily stats, retention rates, and study streaks.
"""
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.db.session import get_db
from app.models.database import User, Card, ReviewLog, DailyCounter
from pydantic import BaseModel

router = APIRouter()


class TodayStatsResponse(BaseModel):
    """Daily statistics response."""
    reviewed_today: int
    new_cards_today: int
    retention_rate: float
    study_streak: int
    total_reviews: int
    

def get_default_user(db: Session) -> User:
    """Get default user for POC (single-user assumption)."""
    user = db.query(User).filter(User.username == "default_user").first()
    if not user:
        raise HTTPException(
            status_code=500,
            detail="Default user not found. Run migrations."
        )
    return user


@router.get("/today", response_model=TodayStatsResponse)
def get_today_stats(db: Session = Depends(get_db)):
    """
    Get today's study statistics.
    
    Returns:
    - reviewed_today: Number of cards reviewed today
    - new_cards_today: Number of new cards studied today
    - retention_rate: Percentage of cards rated Good or Easy today
    - study_streak: Current consecutive days of study
    - total_reviews: Total reviews across all time
    """
    user = get_default_user(db)
    
    # Get today's date range
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Get today's DailyCounter (the source of truth for today's activity)
    daily_counter = db.query(DailyCounter).filter(
        and_(
            DailyCounter.user_id == user.id,
            DailyCounter.date == today_start
        )
    ).first()
    
    # If no counter exists yet, return zeros
    if not daily_counter:
        reviewed_count = 0
        new_cards_today = 0
        retention_rate = 0.0
    else:
        reviewed_count = daily_counter.reviews_done
        new_cards_today = daily_counter.introduced_new
        
        # Calculate retention rate from today's ratings
        total_ratings = daily_counter.again_count + daily_counter.good_count + daily_counter.easy_count
        if total_ratings > 0:
            successful_reviews = daily_counter.good_count + daily_counter.easy_count
            retention_rate = (successful_reviews / total_ratings) * 100
        else:
            retention_rate = 0.0
    
    # Calculate study streak
    streak = _calculate_study_streak(db, user.id, today_start)
    
    # Get total reviews all time
    total_reviews = db.query(ReviewLog).filter(
        ReviewLog.user_id == user.id
    ).count()
    
    return TodayStatsResponse(
        reviewed_today=reviewed_count,
        new_cards_today=new_cards_today,
        retention_rate=round(retention_rate, 1),
        study_streak=streak,
        total_reviews=total_reviews
    )


def _calculate_study_streak(db: Session, user_id: int, today_start: datetime) -> int:
    """Calculate consecutive days of study."""
    streak = 0
    check_date = today_start
    
    # Check backwards from today
    while True:
        day_start = check_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # Check if user reviewed any cards on this day
        has_reviews = db.query(ReviewLog).filter(
            and_(
                ReviewLog.user_id == user_id,
                ReviewLog.reviewed_at >= day_start,
                ReviewLog.reviewed_at < day_end
            )
        ).first() is not None
        
        if has_reviews:
            streak += 1
            check_date = check_date - timedelta(days=1)
        else:
            # Streak broken
            break
        
        # Limit streak check to 365 days max
        if streak >= 365:
            break
    
    return streak


@router.get("/retention")
def get_retention_stats(
    days: Optional[int] = 30,
    db: Session = Depends(get_db)
):
    """
    Get retention statistics over time.
    
    Args:
        days: Number of days to look back (default 30)
    
    Returns:
        Daily retention rates for the specified period
    """
    user = get_default_user(db)
    
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get reviews for the period
    reviews = db.query(ReviewLog).filter(
        and_(
            ReviewLog.user_id == user.id,
            ReviewLog.reviewed_at >= cutoff_date
        )
    ).all()
    
    # Group by date and calculate daily retention
    daily_stats = {}
    for review in reviews:
        date_key = review.reviewed_at.date()
        if date_key not in daily_stats:
            daily_stats[date_key] = {"total": 0, "successful": 0}
        
        daily_stats[date_key]["total"] += 1
        if review.rating in ['good', 'easy']:
            daily_stats[date_key]["successful"] += 1
    
    # Calculate retention rates
    result = []
    for date, stats in sorted(daily_stats.items()):
        retention = (stats["successful"] / stats["total"] * 100) if stats["total"] > 0 else 0
        result.append({
            "date": str(date),
            "retention_rate": round(retention, 1),
            "total_reviews": stats["total"]
        })
    
    return {"period_days": days, "daily_stats": result}
