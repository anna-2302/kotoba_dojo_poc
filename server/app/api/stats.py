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


class SessionStatsResponse(BaseModel):
    """Phase 4 session-based statistics."""
    total_sessions: int
    average_completion_rate: float
    section_completions: dict
    daily_sessions: list[dict]
    performance_trends: dict
    

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


@router.get("/sessions", response_model=SessionStatsResponse)
def get_session_stats(
    days: Optional[int] = 30,
    db: Session = Depends(get_db)
):
    """
    Get Phase 4 session-based statistics.
    
    Args:
        days: Number of days to look back (default 30)
    
    Returns:
        Session completion rates, section breakdowns, daily counts
    """
    user = get_default_user(db)
    cutoff_date = datetime.now() - timedelta(days=days)
    
    # Get all reviews for the period
    reviews = db.query(ReviewLog).filter(
        and_(
            ReviewLog.user_id == user.id,
            ReviewLog.reviewed_at >= cutoff_date
        )
    ).all()
    
    # Get daily counters for the period
    daily_counters = db.query(DailyCounter).filter(
        and_(
            DailyCounter.user_id == user.id,
            DailyCounter.date >= cutoff_date.date()
        )
    ).all()
    
    # Calculate session-based metrics
    total_sessions = len(daily_counters)  # Approximate: one session per day with activity
    total_cards_reviewed = sum(counter.reviews_done for counter in daily_counters)
    avg_session_size = total_cards_reviewed / total_sessions if total_sessions > 0 else 0
    
    # Calculate completion rate (assume 100% for completed sessions)
    completion_rate = 100.0 if total_sessions > 0 else 0.0
    
    # Section breakdown (aggregate from all reviews)
    section_breakdown = {
        "new": 0,
        "learning": 0, 
        "review": 0
    }
    
    # Approximate section breakdown based on card states during reviews
    for review in reviews:
        # This is a simplified approximation since we don't track session sections in ReviewLog yet
        # In a full implementation, we'd track session_section in ReviewLog
        if hasattr(review, 'card_state'):
            if review.card_state == 'new':
                section_breakdown["new"] += 1
            elif review.card_state == 'learning':
                section_breakdown["learning"] += 1
            else:
                section_breakdown["review"] += 1
        else:
            # Default to review section for existing data
            section_breakdown["review"] += 1
    
    # Daily session counts
    daily_session_counts = {}
    for counter in daily_counters:
        date_str = counter.date.strftime('%Y-%m-%d')
        daily_session_counts[date_str] = {
            "sessions": 1 if counter.reviews_done > 0 else 0,
            "cards_reviewed": counter.reviews_done,
            "new_cards": counter.introduced_new
        }
    
    # Session success rates by section (approximated)
    section_success_rates = {}
    for section, count in section_breakdown.items():
        if count > 0:
            # Calculate success rate for this section (Good + Easy ratings)
            section_reviews = [r for r in reviews if r.rating in ['good', 'easy']]
            success_count = len(section_reviews)
            section_success_rates[section] = {
                "total": count,
                "successful": success_count,
                "rate": (success_count / count * 100) if count > 0 else 0.0
            }
        else:
            section_success_rates[section] = {
                "total": 0,
                "successful": 0,
                "rate": 0.0
            }
    
    # Convert daily_session_counts to list of dicts for frontend
    daily_sessions_list = []
    for date_str, data in daily_session_counts.items():
        daily_sessions_list.append({
            "date": date_str,
            "session_count": data["sessions"],
            "cards_reviewed": data["cards_reviewed"],
            "completion_rate": 100.0 if data["cards_reviewed"] > 0 else 0.0
        })
    
    # Performance trends calculations
    total_ratings = len(reviews)
    if total_ratings > 0:
        again_count = len([r for r in reviews if r.rating == 'again'])
        good_count = len([r for r in reviews if r.rating == 'good'])
        easy_count = len([r for r in reviews if r.rating == 'easy'])
        
        again_pct = (again_count / total_ratings) * 100
        good_pct = (good_count / total_ratings) * 100
        easy_pct = (easy_count / total_ratings) * 100
        
        # Simple trend calculation (comparing recent vs older reviews)
        recent_reviews = [r for r in reviews if r.timestamp >= datetime.now() - timedelta(days=7)]
        if len(recent_reviews) > 0:
            recent_success_rate = len([r for r in recent_reviews if r.rating in ['good', 'easy']]) / len(recent_reviews)
            older_reviews = [r for r in reviews if r.timestamp < datetime.now() - timedelta(days=7)]
            if len(older_reviews) > 0:
                older_success_rate = len([r for r in older_reviews if r.rating in ['good', 'easy']]) / len(older_reviews)
                if recent_success_rate > older_success_rate + 0.05:
                    trend = 'improving'
                elif recent_success_rate < older_success_rate - 0.05:
                    trend = 'declining'
                else:
                    trend = 'stable'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
    else:
        again_pct = good_pct = easy_pct = 0.0
        trend = 'stable'

    # Section completions data
    section_completions = {
        "new_section_completions": section_breakdown.get("new", 0),
        "learning_section_completions": section_breakdown.get("learning", 0),
        "review_section_completions": section_breakdown.get("review", 0),
        "total_section_attempts": sum(section_breakdown.values())
    }

    # Performance trends data
    performance_trends = {
        "again_percentage": round(again_pct, 1),
        "good_percentage": round(good_pct, 1),
        "easy_percentage": round(easy_pct, 1),
        "improvement_trend": trend
    }

    return SessionStatsResponse(
        total_sessions=total_sessions,
        average_completion_rate=round(completion_rate, 1),
        section_completions=section_completions,
        daily_sessions=daily_sessions_list,
        performance_trends=performance_trends
    )
