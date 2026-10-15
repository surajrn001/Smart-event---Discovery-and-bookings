from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import User, Event, EventUpdate, Booking, Notification
from app.schemas import EventUpdateCreate, EventUpdateResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["Live Event Updates & Announcements"])

@router.get("/{event_id}/updates", response_model=List[EventUpdateResponse])
def get_event_updates(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve all real-time announcements and updates for a specific event."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    updates = (
        db.query(EventUpdate)
        .filter(EventUpdate.event_id == event_id)
        .order_by(EventUpdate.created_at.desc())
        .all()
    )
    return updates

@router.post("/{event_id}/updates", response_model=EventUpdateResponse, status_code=status.HTTP_201_CREATED)
def create_event_update(
    event_id: int,
    update_in: EventUpdateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Post an announcement for an event. Authorized for event organizer or admin."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # Authorization: user must be the event organizer or an admin
    if current_user.role != "ADMIN" and event.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event organizer or platform administrator can publish live event announcements."
        )

    update = EventUpdate(
        event_id=event.id,
        message=update_in.message.strip(),
        created_at=datetime.utcnow()
    )
    db.add(update)

    # Notify all attendees who booked tickets for this event
    attendee_bookings = (
        db.query(Booking)
        .filter(Booking.event_id == event.id, Booking.booking_status == "CONFIRMED")
        .all()
    )
    attendee_user_ids = {b.user_id for b in attendee_bookings}
    for uid in attendee_user_ids:
        notif = Notification(
            user_id=uid,
            title=f"Live Update: {event.title}",
            message=update_in.message.strip(),
            notification_type="EVENT",
            type="EVENT",
            is_read=False
        )
        db.add(notif)

    db.commit()
    db.refresh(update)
    return update
