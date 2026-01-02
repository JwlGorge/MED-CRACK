from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from .routers import auth, users, topics, quiz
from .database import engine, Base

# Create tables if not exist (mostly for dev, in prod use migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MED-CRACK API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to specific domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(topics.router)
app.include_router(quiz.router)

# Mount static if needed (though next.js usually handles frontend)
# app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def read_root():
    return "<h1>MED-CRACK API is running</h1>"

@app.get("/health")
def health_check():
    return {"status": "ok"}
