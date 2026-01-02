from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Student, Topics
from ..dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["Users"])

@router.get("/user/profile")
def get_user_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user = db.query(Student).filter(Student.username == current_user['sub']).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "username": user.username,
        "displayName": user.username,
        "rank": user.rank or 0,
        "badgeLevel": user.badge or "Rookie",
        "experiencePoints": user.experience_points or 0,
        "nextLevelPoints": user.next_level_points or 1000,
        "activeDays": user.streak or 0,
        "totalSubmissions": user.noofquestioncompleted or 0,
        "problemStats": {
            "easy": {"solved": user.easy_solved or 0, "total": 100},
            "medium": {"solved": user.medium_solved or 0, "total": 100},
            "hard": {"solved": user.hard_solved or 0, "total": 100}
        },
        "stats": {
            "discussions": 0,
            "reputation": 0
        },
        "acceptance": 0
    }

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    active_users = 103 # Mock for now
    totalquestions = 3500 # Mock or count
    
    # Ideally: count = db.query(Student).count() etc.
    return {
        "subjectStats": [],
        "totalQuestions": totalquestions,
        "activeUsers": active_users
    }
