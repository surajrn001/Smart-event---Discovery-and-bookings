from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Event, Booking
from app.schemas import (
    UserResponse,
    EventResponse,
    BookingResponse,
    AdminPlatformOverview,
)
from app.dependencies import require_roles

router = APIRouter(prefix="/admin", tags=["Admin Portal & Platform Analytics"])

# Only ADMIN role can access admin portal
admin_guard = require_roles(["ADMIN"])

@router.get("/overview", response_model=AdminPlatformOverview)
def get_platform_overview(
    current_user: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    """High-level KPIs for administrator dashboard."""
    total_users = db.query(User).count()
    total_organizers = db.query(User).filter(User.role == "ORGANIZER").count()
    total_events = db.query(Event).count()
    active_events = db.query(Event).filter(Event.event_status.in_(["UPCOMING", "ONGOING"])).count()

    confirmed_bookings = db.query(Booking).filter(Booking.booking_status == "CONFIRMED").all()
    total_tickets_sold = sum(b.ticket_quantity for b in confirmed_bookings)
    total_revenue = sum(b.total_price for b in confirmed_bookings)
    total_bookings = len(confirmed_bookings)

    return AdminPlatformOverview(
        total_users=total_users,
        total_organizers=total_organizers,
        total_events=total_events,
        total_tickets_sold=total_tickets_sold,
        total_bookings=total_bookings,
        total_revenue=round(total_revenue, 2),
        active_events=active_events
    )

@router.get("/analytics/sales-trends")
def get_sales_trends(
    current_user: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    """Daily sales and booking counts for the last 14 days."""
    now = datetime.utcnow()
    trends = []

    for i in range(13, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        bookings_on_day = db.query(Booking).filter(
            func.date(Booking.created_at) == day_date,
            Booking.booking_status == "CONFIRMED"
        ).all()

        daily_tickets = sum(b.ticket_quantity for b in bookings_on_day)
        daily_revenue = sum(b.total_price for b in bookings_on_day)

        trends.append({
            "date": day_date.strftime("%d %b"),
            "tickets_sold": daily_tickets,
            "revenue": round(daily_revenue, 2),
            "booking_count": len(bookings_on_day)
        })

    return trends

@router.get("/analytics/popular-events")
def get_popular_events(
    current_user: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    """Top performing events ranked by tickets sold and revenue."""
    events = db.query(Event).all()
    ranked = []

    for evt in events:
        bookings = db.query(Booking).filter(
            Booking.event_id == evt.id,
            Booking.booking_status == "CONFIRMED"
        ).all()
        t_sold = sum(b.ticket_quantity for b in bookings)
        rev = sum(b.total_price for b in bookings)

        ranked.append({
            "id": evt.id,
            "title": evt.title,
            "category": evt.category,
            "ticket_price": evt.ticket_price,
            "tickets_sold": t_sold,
            "revenue": round(rev, 2),
            "event_status": evt.event_status,
        })

    ranked.sort(key=lambda x: x["tickets_sold"], reverse=True)
    return ranked

@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    current_user: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    """List all registered platform users with roles."""
    return db.query(User).order_by(User.created_at.desc()).all()

@router.get("/events", response_model=List[EventResponse])
def get_all_events(
    current_user: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    """List all platform events with statuses."""
    return db.query(Event).order_by(Event.created_at.desc()).all()

@router.get("/bookings", response_model=List[BookingResponse])
def get_all_bookings(
    current_user: User = Depends(admin_guard),
    db: Session = Depends(get_db)
):
    """List all bookings made across the platform."""
    return db.query(Booking).order_by(Booking.created_at.desc()).all()
