from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import auth, events, bookings, tickets, notifications
from app.seed import seed_events_if_empty

# Create all database tables
Base.metadata.create_all(bind=engine)

# Auto seed database on startup
with SessionLocal() as db:
    seed_events_if_empty(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartEvent – Event Discovery and Digital Ticket Booking API"
)

# Configure CORS for Vite React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static folder for QR code images and assets
os.makedirs(settings.STATIC_DIR, exist_ok=True)
os.makedirs(settings.QR_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(events.router, prefix=settings.API_V1_STR)
app.include_router(bookings.router, prefix=settings.API_V1_STR)
app.include_router(tickets.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to SmartEvent API",
        "docs": "/docs",
        "version": settings.VERSION
    }
