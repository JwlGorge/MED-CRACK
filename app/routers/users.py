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
        
    # Dynamic Rank Calculation
    all_students = db.query(Student).all()
    student_scores = []
    for s in all_students:
        score = calculate_user_score(s)
        student_scores.append({'username': s.username, 'score': score})
    
    # Sort descending
    student_scores.sort(key=lambda x: x['score'], reverse=True)
    
    # Find current user rank (1-based)
    rank = next((i + 1 for i, s in enumerate(student_scores) if s['username'] == user.username), 0)

    # Re-save rank to DB if needed, or just return it
    if user.rank != rank:
        user.rank = rank
        db.commit()

    return {
        "username": user.username,
        "displayName": user.username,
        "rank": rank,
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
            "reputation": int(calculate_user_score(user)) # Use score as reputation for now
        },
        "acceptance": 0 # Calculated on frontend usually, or here: (solved/attempts)*100
    }

def calculate_user_score(user: Student) -> float:
    # 1. Total Solved
    total_solved = (user.easy_solved or 0) + (user.medium_solved or 0) + (user.hard_solved or 0)
    
    # 2. Acceptance Ratio (0.0 to 1.0)
    attempts = user.noofquestioncompleted or 1 # avoid zero div
    if attempts < total_solved: attempts = total_solved # safety
    acceptance_ratio = total_solved / attempts if attempts > 0 else 0
    
    # 3. Average Time (lower is better)
    # user.duration is total seconds
    # we want points for SPEED. 
    # Let's say baseline is 60s per question.
    # Score += (TotalSolved * 10) 
    # Score += (Acceptance * 500)
    # Score += (Streak * 20)
    # Penalty: Time. 
    # Alternative: Score = (Solved * 20) * (Acceptance^2) + (Streak * 5)
    
    score = (total_solved * 25) * (acceptance_ratio) + ((user.streak or 0) * 10)
    
    # Time Bonus: if avg time < 45s, small bonus
    avg_time = (user.duration or 0) / attempts if attempts > 0 else 60
    if avg_time < 30: score += 50
    elif avg_time < 60: score += 20
    
    return round(score, 1)

@router.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    students = db.query(Student).all()
    leaderboard_data = []
    
    for s in students:
        total_solved = (s.easy_solved or 0) + (s.medium_solved or 0) + (s.hard_solved or 0)
        attempts = s.noofquestioncompleted or 1
        if attempts < total_solved: attempts = total_solved
        accuracy = (total_solved / attempts * 100) if attempts > 0 else 0
        avg_time = (s.duration or 0) / attempts if attempts > 0 else 0
        
        score = calculate_user_score(s)
        
        leaderboard_data.append({
            "username": s.username,
            "displayName": s.username, # nickname if available
            "score": score,
            "solved": total_solved,
            "accuracy": round(accuracy, 1),
            "avgTime": round(avg_time, 1)
        })
    
    # Sort by score descending
    leaderboard_data.sort(key=lambda x: x['score'], reverse=True)
    
    # Assign ranks
    for i, data in enumerate(leaderboard_data):
        data['rank'] = i + 1
        
    return leaderboard_data

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    active_users = db.query(Student).count() # Real count
    # Approximate total questions from tables if needed, or constant
    return {
        "subjectStats": [],
        "totalQuestions": 3500,
        "activeUsers": active_users
    }
