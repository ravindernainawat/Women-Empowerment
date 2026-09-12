"""
WEIS API — FastAPI application entrypoint.
Run locally with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db

# Creates tables if they don't exist yet. For anything beyond local dev,
# switch to Alembic migrations instead of relying on this.
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not connect to database to create tables: {e}")

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for the Women Empowerment & Inclusion System (WEIS)",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
def root():
    return {"service": settings.APP_NAME, "status": "running", "env": settings.ENV}


@app.get("/health/db", tags=["Health"])
def db_health_check(db: Session = Depends(get_db)):
    """Confirms the API can reach MySQL using the configured DATABASE_URL."""
    db.execute(text("SELECT 1"))
    return {"database": "connected"}


# Routers for users, skills, assessments, recommendations, mentorship,
# and safety reports get registered here as they're built, e.g.:
# from app.routers import users
# app.include_router(users.router, prefix="/users", tags=["Users"])
