from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Student
from ..dependencies import hash_password, verify_password, create_access_token

router = APIRouter(tags=["Auth"])

class AuthRequest(BaseModel):
    username: str
    password: str

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(request: AuthRequest, db: Session = Depends(get_db)):
    try:
        existing_user = db.query(Student).filter(Student.username == request.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")

        hashed_pw = hash_password(request.password)
        new_user = Student(username=request.username, password=hashed_pw)
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return {"message": "User created successfully", "user_id": new_user.id}
    except Exception as e:
        db.rollback()
        print(f"Error during signup: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.post("/login")
def login(request: AuthRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(Student).filter(Student.username == request.username).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(request.password, user.password):
            raise HTTPException(status_code=401, detail="Incorrect password")

        token = create_access_token(data={"sub": user.username})
        return {
            "message": "Login successful",
            "user_id": user.id,
            "access_token": token,
            "token_type": "bearer"
        }
    except Exception as e:
        print(f"Error during login: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
