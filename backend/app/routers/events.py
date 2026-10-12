from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Optional
from datetime import datetime, date
from app.database import get_db
from app.models import Event, Review, Booking
from app.schemas import EventResponse

router = APIRouter(prefix="/events", tags=["Events"])

def auto_update_event_status(event: Event):
    """Lifecycle helper: sync event status based on date if not CANCELLED."""
    if event.event_status == "CANCELLED":
        return
    now = datetime.utcnow()
    if event.event_date < now:
        event.event_status = "COMPLETED"
    elif event.event_date.date() == now.date():
        event.event_status = "ONGOING"
    else:
        event.event_status = "UPCOMING"

def enrich_event_metrics(evt: Event, db: Session):
    """Attach average ratings, review count, and display status."""
    auto_update_event_status(evt)
    reviews = db.query(Review).filter(Review.event_id == evt.id).all()
    if reviews:
        evt.total_reviews = len(reviews)
        evt.average_rating = round(sum(r.rating for r in reviews) / len(reviews), 1)
    else:
        evt.total_reviews = 0
        evt.average_rating = 0.0

@router.get("", response_model=List[EventResponse])
def get_events(
    category: Optional[str] = Query(None, description="Filter by category (Music, Tech, Sports, Business)"),
    search: Optional[str] = Query(None, description="Search by title, location or description"),
    location: Optional[str] = Query(None, description="Filter by city or venue location"),
    status: Optional[str] = Query(None, description="Filter by event_status (UPCOMING, ONGOING, COMPLETED, CANCELLED)"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    sort_by: Optional[str] = Query("date_asc", description="Sort by: date_asc, date_desc, price_asc, price_desc, popularity, rating"),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    
    # Category filter
    if category and category.lower() != "all":
        query = query.filter(Event.category.ilike(category))
        
    # Search filter
    if search and search.strip():
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Event.title.ilike(search_fmt),
                Event.description.ilike(search_fmt),
                Event.location.ilike(search_fmt)
            )
        )

    # Location filter
    if location and location.strip():
        loc_fmt = f"%{location.strip()}%"
        query = query.filter(Event.location.ilike(loc_fmt))

    # Status filter
    if status and status.lower() != "all":
        query = query.filter(Event.event_status.ilike(status))

    # Date range filters
    if start_date:
        try:
            s_dt = datetime.strptime(start_date, "%Y-%m-%d")
            query = query.filter(Event.event_date >= s_dt)
        except ValueError:
            pass

    if end_date:
        try:
            e_dt = datetime.strptime(end_date, "%Y-%m-%d").replace(hour=23, minute=59, second=59)
            query = query.filter(Event.event_date <= e_dt)
        except ValueError:
            pass

    # Basic DB-level sorting
    if sort_by == "date_desc":
        query = query.order_by(Event.event_date.desc())
    elif sort_by == "price_asc":
        query = query.order_by(Event.ticket_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Event.ticket_price.desc())
    else:
        query = query.order_by(Event.event_date.asc())

    events = query.all()
    
    # Enrich with in-memory ratings and status
    for evt in events:
        enrich_event_metrics(evt, db)

    # In-memory sorting for popularity or rating
    if sort_by == "rating":
        events.sort(key=lambda x: (x.average_rating or 0.0, x.total_reviews or 0), reverse=True)
    elif sort_by == "popularity":
        def get_tickets_sold(e):
            bookings = db.query(Booking).filter(Booking.event_id == e.id, Booking.booking_status == "CONFIRMED").all()
            return sum(b.ticket_quantity for b in bookings)
        events.sort(key=get_tickets_sold, reverse=True)

    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} was not found"
        )
    enrich_event_metrics(event, db)
    return event

@router.get("/meta/categories")
def get_categories():
    return ["Music", "Tech", "Sports", "Business"]
