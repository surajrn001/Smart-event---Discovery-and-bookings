from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import (
    auth, events, bookings, tickets, notifications,
    organizer, admin, payments, coupons, reviews,
    wishlist, recommendations, updates, chatbot
)
from app.websocket_manager import seat_manager
from app.seed import seed_events_if_empty
from app.migration import run_db_migrations

# Run SQLite schema migrations for existing databases
run_db_migrations()

# Create all database tables
Base.metadata.create_all(bind=engine)

# Auto seed database on startup
with SessionLocal() as db:
    seed_events_if_empty(db)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SmartEvent – Multi-Role Event Discovery, Organizer Management, Payments, Reviews & Admin Analytics API"
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
app.include_router(organizer.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(payments.router, prefix=settings.API_V1_STR)
app.include_router(coupons.router, prefix=settings.API_V1_STR)
app.include_router(reviews.router, prefix=settings.API_V1_STR)
app.include_router(wishlist.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(updates.router, prefix=settings.API_V1_STR)
app.include_router(chatbot.router, prefix=settings.API_V1_STR)

# Real-Time WebSocket for live seat availability broadcasts
@app.websocket("/ws/events/{event_id}")
async def websocket_event_seats(websocket: WebSocket, event_id: int):
    await seat_manager.connect(event_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        seat_manager.disconnect(event_id, websocket)
    except Exception:
        seat_manager.disconnect(event_id, websocket)


@app.get("/")
def root():
    return {
        "message": "Welcome to SmartEvent API",
        "docs": "/docs",
        "version": settings.VERSION
    }
