
from fastapi import Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Question
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

templates = Jinja2Templates(directory="templates")

######################################################################################################################################################





app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




#######################################################################################################################################################






app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "name": "Tanjiro"})

@app.get("/test", response_class=HTMLResponse)
async def testPage(request: Request):
    return templates.TemplateResponse("BIOtest.html", {"request": request})



def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/questions/{subject}")
def get_questions(subject: str, db: Session = Depends(get_db)):
    return db.query(Question).filter(Question.Subject == subject).all()

######################################################################################################################################

@app.get("/quiz")
def show_questions(request: Request, db: Session = Depends(get_db)):
    questions = db.query(Question).all()
    return templates.TemplateResponse("qstesting.html", {
        "request": request,
        "questions": questions
    })