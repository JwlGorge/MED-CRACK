from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import random
from ..database import get_db
from ..models import Student, Attempt, ReportedError, Weakarea

# ... (imports)

class QuizSubmissionRequest(BaseModel):
    quizId: str
    difficulty: str
    questionsCount: int
    correctCount: int
    timeSpent: int
    results: List[QuestionResult]
    mistakes: Optional[List[QuestionResult]] = []

@router.post("/quiz/submit")
def submit_quiz(submission: QuizSubmissionRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        user = db.query(Student).filter(Student.username == current_user['sub']).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        user.noofquestioncompleted = (user.noofquestioncompleted or 0) + submission.questionsCount
        user.duration = (user.duration or 0) + submission.timeSpent
        
        diff = submission.difficulty.lower()
        if diff == "easy": user.easy_solved = (user.easy_solved or 0) + submission.correctCount
        elif diff == "medium": user.medium_solved = (user.medium_solved or 0) + submission.correctCount
        elif diff == "hard": user.hard_solved = (user.hard_solved or 0) + submission.correctCount
            
        xp_gain = submission.correctCount * 10 
        if diff == "medium": xp_gain *= 2
        if diff == "hard": xp_gain *= 3
        
        user.experience_points = (user.experience_points or 0) + xp_gain
        while user.experience_points >= (user.next_level_points or 1000):
            user.experience_points -= (user.next_level_points or 1000)
            user.next_level_points = int((user.next_level_points or 1000) * 1.5)
            
        # Record attempts
        for result in submission.results:
            if result.isCorrect:
                attempt = Attempt(
                    user_id=user.id,
                    quiz_id=submission.quizId,
                    question_id=int(result.questionId) if result.questionId.isdigit() else 0,
                    subject=result.subject,
                    is_correct=result.isCorrect,
                    submitted_at=datetime.utcnow()
                )
                db.add(attempt)

        # Record Weak Areas (Mistakes)
        for mistake in submission.mistakes:
            # Avoid duplicates if desired, or just log every mistake
            weak_entry = Weakarea(
                user_id=user.id,
                subject=mistake.subject,
                question_id=int(mistake.questionId) if mistake.questionId.isdigit() else 0
            )
            db.add(weak_entry)
        
        db.commit()
        db.refresh(user)
        return {"message": "Submission recorded", "xp_earned": xp_gain}
    except Exception as e:
        db.rollback()
        print(f"Error submitting quiz: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

class ReportErrorRequest(BaseModel):
    questionId: str
    subject: str = "Unknown"
    quizId: str = "Unknown"

@router.post("/report-error")
def report_error(report: ReportErrorRequest, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        user = db.query(Student).filter(Student.username == current_user['sub']).first()
        if not user: raise HTTPException(status_code=404, detail="User not found")
            
        new_report = ReportedError(
            user_id=user.id,
            question_id=report.questionId,
            subject=report.subject,
            quiz_id=report.quizId,
            timestamp=int(datetime.utcnow().timestamp())
        )
        db.add(new_report)
        db.commit()
        return {"message": "Error reported successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

class DistributionItem(BaseModel):
    attempts: str
    count: int
    percentage: float

class TimeComparisonItem(BaseModel):
    range: str
    count: int
    percentage: float

class AnalyticsData(BaseModel):
    rank: int
    totalSubmissions: int
    attemptDistribution: List[DistributionItem]
    timeComparison: List[TimeComparisonItem]

@router.get("/analytics/{quiz_id}", response_model=AnalyticsData)
def get_analytics(quiz_id: str, db: Session = Depends(get_db)):
    total_submissions = random.randint(100, 5000)
    rank = random.randint(1, total_submissions // 2)
    
    attempts_data = [{"attempts": "1st", "weight": 40}, {"attempts": "2nd", "weight": 25}, {"attempts": "3rd", "weight": 15}, {"attempts": "4th", "weight": 10}, {"attempts": "5th", "weight": 5}, {"attempts": "6+", "weight": 5}]
    
    dist_items = []
    for item in attempts_data:
        count = max(0, int(total_submissions * (item["weight"] / 100)) + random.randint(-10, 10))
        dist_items.append(DistributionItem(attempts=item["attempts"], count=count, percentage=0.0))
    total_count = sum(d.count for d in dist_items)
    for d in dist_items: d.percentage = round((d.count / total_count) * 100, 1) if total_count else 0

    time_ranges = ["0-10 min", "10-20 min", "20-30 min", "30-40 min", "40+ min"]
    time_weights = [10, 20, 40, 20, 10]
    time_items = []
    for r, w in zip(time_ranges, time_weights):
        count = max(0, int(total_submissions * (w / 100)) + random.randint(-10, 10))
        time_items.append(TimeComparisonItem(range=r, count=count, percentage=0.0))
    total_time_count = sum(t.count for t in time_items)
    for t in time_items: t.percentage = round((t.count / total_time_count) * 100, 1) if total_time_count else 0

    return AnalyticsData(rank=rank, totalSubmissions=total_count, attemptDistribution=dist_items, timeComparison=time_items)
