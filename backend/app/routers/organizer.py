from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import User, Event, Booking, Notification
from app.schemas import (
    EventCreate,
    EventUpdate,
    EventResponse,
    BookingResponse,
    OrganizerAnalyticsSummary,
    OrganizerEventStats,
)
from app.dependencies import require_roles

router = APIRouter(prefix="/organizer", tags=["Organizer Management"])

# Only ORGANIZER and ADMIN can access organizer endpoints
org_guard = require_roles(["ORGANIZER", "ADMIN"])

@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """Create a new event owned by the current organizer."""
    event = Event(
        organizer_id=current_user.id,
        title=event_in.title,
        description=event_in.description,
        category=event_in.category,
        location=event_in.location,
        event_date=event_in.event_date,
        ticket_price=event_in.ticket_price,
        total_seats=event_in.total_seats,
        available_seats=event_in.total_seats,
        banner_image=event_in.banner_image,
        event_status="UPCOMING"
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/events", response_model=List[EventResponse])
def get_organizer_events(
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """List all events created by the current organizer."""
    # If ADMIN, show all; if ORGANIZER, show own
    query = db.query(Event)
    if current_user.role == "ORGANIZER":
        query = query.filter(Event.organizer_id == current_user.id)
    return query.order_by(Event.created_at.desc()).all()

@router.get("/events/{event_id}", response_model=EventResponse)
def get_organizer_event_detail(
    event_id: int,
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """Get single event detail verifying organizer ownership."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role == "ORGANIZER" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this event")
    return event

@router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """Update event details with ownership validation and attendee notification."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role == "ORGANIZER" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit events you created")

    update_data = event_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(event, field, val)

    # Notify all attendees who booked this event
    bookings = db.query(Booking).filter(Booking.event_id == event.id).all()
    for b in bookings:
        notif = Notification(
            user_id=b.user_id,
            title="Event Updated",
            message=f"Details for '{event.title}' were updated by the organizer.",
            type="EVENT",
            is_read=False
        )
        db.add(notif)

    db.commit()
    db.refresh(event)
    return event

@router.patch("/events/{event_id}/cancel", response_model=EventResponse)
def cancel_event(
    event_id: int,
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """Cancel event and notify all ticket holders."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role == "ORGANIZER" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel events you created")

    event.event_status = "CANCELLED"

    # Notify all booked attendees
    bookings = db.query(Booking).filter(Booking.event_id == event.id).all()
    for b in bookings:
        b.booking_status = "CANCELLED"
        notif = Notification(
            user_id=b.user_id,
            title="Event Cancelled",
            message=f"Notice: '{event.title}' scheduled for {event.event_date.strftime('%d %b %Y')} has been cancelled.",
            type="EVENT",
            is_read=False
        )
        db.add(notif)

    db.commit()
    db.refresh(event)
    return event

@router.get("/events/{event_id}/bookings", response_model=List[BookingResponse])
def get_event_bookings(
    event_id: int,
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """Fetch all ticket bookings for a specific organizer event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if current_user.role == "ORGANIZER" and event.organizer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not own this event")

    bookings = (
        db.query(Booking)
        .filter(Booking.event_id == event_id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return bookings

@router.get("/analytics", response_model=OrganizerAnalyticsSummary)
def get_organizer_analytics(
    current_user: User = Depends(org_guard),
    db: Session = Depends(get_db)
):
    """Fetch comprehensive sales, revenue, and ticket statistics for the organizer."""
    query = db.query(Event)
    if current_user.role == "ORGANIZER":
        query = query.filter(Event.organizer_id == current_user.id)
    events = query.all()

    total_tickets_sold = 0
    total_revenue = 0.0
    total_bookings = 0
    stats_list = []

    for evt in events:
        evt_bookings = db.query(Booking).filter(
            Booking.event_id == evt.id,
            Booking.booking_status != "CANCELLED"
        ).all()

        evt_tickets_sold = sum(b.ticket_quantity for b in evt_bookings)
        evt_revenue = sum(b.total_price for b in evt_bookings)
        evt_booking_count = len(evt_bookings)

        total_tickets_sold += evt_tickets_sold
        total_revenue += evt_revenue
        total_bookings += evt_booking_count

        stats_list.append(OrganizerEventStats(
            event_id=evt.id,
            title=evt.title,
            category=evt.category,
            event_status=evt.event_status,
            total_seats=evt.total_seats,
            available_seats=evt.available_seats,
            tickets_sold=evt_tickets_sold,
            ticket_price=evt.ticket_price,
            total_revenue=round(evt_revenue, 2),
            booking_count=evt_booking_count
        ))

    return OrganizerAnalyticsSummary(
        total_events=len(events),
        total_tickets_sold=total_tickets_sold,
        total_revenue=round(total_revenue, 2),
        total_bookings=total_bookings,
        events_stats=stats_list
    )
