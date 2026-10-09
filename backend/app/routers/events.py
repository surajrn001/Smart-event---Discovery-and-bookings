from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Event
from app.schemas import EventResponse

router = APIRouter(prefix="/events", tags=["Events"])

def auto_update_event_status(event: Event):
    """Lifecycle helper: sync event status based on date if not CANCELLED."""
    if event.event_status == "CANCELLED":
        return
    now = datetime.utcnow()
    # If event date is past
    if event.event_date < now:
        event.event_status = "COMPLETED"
    elif event.event_date.date() == now.date():
        event.event_status = "ONGOING"
    else:
        event.event_status = "UPCOMING"

@router.get("", response_model=List[EventResponse])
def get_events(
    category: Optional[str] = Query(None, description="Filter by category (Music, Tech, Sports, Business)"),
    search: Optional[str] = Query(None, description="Search by title, location or description"),
    status: Optional[str] = Query(None, description="Filter by event_status (UPCOMING, ONGOING, COMPLETED, CANCELLED)"),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    
    if category and category.lower() != "all":
        query = query.filter(Event.category.ilike(category))
        
    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Event.title.ilike(search_fmt),
                Event.description.ilike(search_fmt),
                Event.location.ilike(search_fmt)
            )
        )

    if status and status.lower() != "all":
        query = query.filter(Event.event_status.ilike(status))
        
    events = query.order_by(Event.event_date.asc()).all()
    
    # Compute display status dynamically in memory
    for evt in events:
        auto_update_event_status(evt)

    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} was not found"
        )
    auto_update_event_status(event)
    return event

@router.get("/meta/categories")
def get_categories():
    return ["Music", "Tech", "Sports", "Business"]
