# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from .models import Base

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment or .env file")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Checks connection liveness before usage
    pool_recycle=300,    # Recycle connections every 5 minutes
    pool_size=10,        # Maximum number of connections to keep
    max_overflow=20      # Extra connections allowed when pool is full
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Error creating tables: {e}")