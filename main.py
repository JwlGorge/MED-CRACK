from fastapi import Depends, FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Question, student
from pydantic import BaseModel


app = FastAPI()

templates = Jinja2Templates(directory="templates")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Files Mount
app.mount("/static", StaticFiles(directory="static"), name="static")

# Dependency for DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Root Route
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "name": "Tanjiro"})

# Test Page Route
@app.get("/test", response_class=HTMLResponse)
async def testPage(request: Request):
    return templates.TemplateResponse("BIOtest.html", {"request": request})

# Signup Endpoint
class SignupRequest(BaseModel):
    username: str
    password: str
@app.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    username = request.username
    password = request.password

    existing_user = db.query(student).filter(student.username == username).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = student(username=username, password=password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully", "user_id": new_user.id}
# Login Endpoint
class SignupRequest(BaseModel):
    username: str
    password: str
@app.get("/login")
def login(request: SignupRequest, db: Session = Depends(get_db)):
    username = request.username
    password = request.password
    user = db.query(student).filter(student.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.password != password:
        raise HTTPException(status_code=401, detail="Incorrect password")

    return {"message": "Login successful", "user_id": user.id}

# Fetch Questions by Subject and Render Template
@app.get("/questions/{subject}", response_class=HTMLResponse)
def get_subject_questions(subject: str, request: Request, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.Subject == subject).all()
    # convert ORM to dict list
    questions_data = [{
        "question": q.Question,
        "options": [q.Option_1, q.Option_2, q.Option_3, q.Option_4],
        "correct": q.Correct_option
    } for q in questions]

    return templates.TemplateResponse("BIOtest.html", {
        "request": request,
        "questions": questions_data
    })

# Quiz Endpoint (All Questions)
@app.get("/quiz")
def show_questions(request: Request, db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return templates.TemplateResponse("qstesting.html", {
        "request": request,
        "questions": questions
    })
