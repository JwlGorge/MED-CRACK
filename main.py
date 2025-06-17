# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Question

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/questions/{subject}")
def get_questions(subject: str, db: Session = Depends(get_db)):
    return db.query(Question).filter(Question.Subject == subject).all()
