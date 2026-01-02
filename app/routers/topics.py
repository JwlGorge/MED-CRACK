from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import random
from ..database import get_db
from ..models import Topics, BiologyQuestion, PhysicsQuestion, ChemistryQuestion, Student, Attempt
from ..dependencies import get_current_user

router = APIRouter(tags=["Topics"])

class ImportantTopic(BaseModel):
  id: str
  name: str
  subject:str
  priority: int

class getTopics(BaseModel):
    id: str
    name: str
    difficulty: str
    questionCount: int
    subject: str
    description: str

class GetQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct: Optional[int] = 0
    toughness: Optional[str] = None
    subject: str

@router.get("/important", response_model=List[ImportantTopic])
def get_important_topics(db: Session = Depends(get_db)):
    try:
        result = db.query(Topics).filter(Topics.importance > 3).all()
        important_topics = [
            ImportantTopic(
                id=str(data.id),
                name=str(data.topic),
                subject=str(data.subject) if data.subject else "Unknown",
                priority=int(data.importance)
            )
            for data in result
        ]
        important_topics.sort(key=lambda x: x.priority, reverse=True)
        random.shuffle(important_topics)
        return important_topics[:8]
    except Exception as e:
        print(f"Error fetching important topics: {e}")
        return []

@router.get("/topic", response_model=List[getTopics])
def get_topics(db: Session = Depends(get_db)):
    try:
        topics = db.query(Topics).all()
        def map_imp(importance):
            if importance == 1: return "Easy"
            elif importance == 2: return "Medium"
            elif importance == 3: return "Hard"
            else: return "Medium"

        topics_data = [
            getTopics(
                id=str(topic.id),
                name=topic.topic,
                difficulty=map_imp(topic.importance),
                questionCount=123,
                subject=topic.subject or "Unknown",
                description=topic.description or ""
            )
            for topic in topics
        ]
        random.shuffle(topics_data)
        return topics_data
    except Exception:
        return []

@router.get("/questions/{topic}", response_model=List[GetQuestion])
def get_subject_questions(topic: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        user = db.query(Student).filter(Student.username == current_user['sub']).first()
        attempted_ids = []
        if user:
            subject_name = ""
            if topic.startswith("B"): subject_name = "Biology"
            elif topic.startswith("P"): subject_name = "Physics"
            elif topic.startswith("C"): subject_name = "Chemistry"
            
            attempts = db.query(Attempt).filter(Attempt.user_id == user.id, Attempt.subject == subject_name).all()
            attempted_ids = [a.question_id for a in attempts]

        questions_data: List[GetQuestion] = []

        # Biology
        bio_q = db.query(BiologyQuestion).filter(BiologyQuestion.topic == topic).filter(BiologyQuestion.id.notin_(attempted_ids)).all()
        for q in bio_q:
            questions_data.append(GetQuestion(id=q.id, question=q.Question, options=[q.Option_1, q.Option_2, q.Option_3, q.Option_4], correct=q.Correct_option or 0, toughness=q.Toughness, subject="Biology"))

        # Physics
        phy_q = db.query(PhysicsQuestion).filter(PhysicsQuestion.topic == topic).filter(PhysicsQuestion.id.notin_(attempted_ids)).all()
        for q in phy_q:
            questions_data.append(GetQuestion(id=q.id, question=q.Question, options=[q.Option_1, q.Option_2, q.Option_3, q.Option_4], correct=q.Correct_option or 0, toughness=q.Toughness, subject="Physics"))

        # Chemistry
        chem_q = db.query(ChemistryQuestion).filter(ChemistryQuestion.topic == topic).filter(ChemistryQuestion.id.notin_(attempted_ids)).all()
        for q in chem_q:
             questions_data.append(GetQuestion(id=q.id, question=q.Question, options=[q.Option_1, q.Option_2, q.Option_3, q.Option_4], correct=q.Correct_option or 0, toughness=q.Toughness, subject="Chemistry"))

        if not questions_data:
            # If all attempted or none exist, maybe return attempted ones to practice? 
            # Or currently just raise 404
            raise HTTPException(status_code=404, detail="No new questions found")

        return questions_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
