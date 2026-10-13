from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, asc
from typing import List, Optional
from datetime import datetime
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

def populate_rating_info(event: Event, db: Session):
    """Compute and attach average_rating and total_reviews to event instance."""
    reviews = db.query(Review).filter(Review.event_id == event.id).all()
    count = len(reviews)
    event.total_reviews = count
    event.average_rating = round(sum(r.rating for r in reviews) / count, 1) if count > 0 else 0.0

@router.get("", response_model=List[EventResponse])
def get_events(
    category: Optional[str] = Query(None, description="Filter by category (Music, Tech, Sports, Business)"),
    search: Optional[str] = Query(None, description="Search by title or description"),
    location: Optional[str] = Query(None, description="Filter by location or city"),
    start_date: Optional[datetime] = Query(None, description="Filter events on or after start_date"),
    end_date: Optional[datetime] = Query(None, description="Filter events on or before end_date"),
    sort_by: Optional[str] = Query("date_asc", description="Sort by: date_asc, date_desc, popularity, price_asc, price_desc, rating"),
    status: Optional[str] = Query(None, description="Filter by event_status (UPCOMING, ONGOING, COMPLETED, CANCELLED)"),
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    
    # 1. Category Filter
    if category and category.lower() != "all":
        query = query.filter(Event.category.ilike(f"%{category.strip()}%"))
        
    # 2. Search by event name or description
    if search and search.strip():
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Event.title.ilike(search_fmt),
                Event.description.ilike(search_fmt),
                Event.location.ilike(search_fmt)
            )
        )

    # 3. Location filter (City / Venue)
    if location and location.lower() != "all" and location.strip():
        query = query.filter(Event.location.ilike(f"%{location.strip()}%"))

    # 4. Date Range Filter
    if start_date:
        query = query.filter(Event.event_date >= start_date)
    if end_date:
        query = query.filter(Event.event_date <= end_date)

    # 5. Status Filter
    if status and status.lower() != "all":
        query = query.filter(Event.event_status.ilike(status))

    # 6. Sorting
    if sort_by == "date_desc":
        query = query.order_by(desc(Event.event_date))
    elif sort_by == "price_asc":
        query = query.order_by(asc(Event.ticket_price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Event.ticket_price))
    elif sort_by == "popularity":
        # Popularity: fewer remaining seats (more sold) or higher booked count
        query = query.order_by(asc(Event.available_seats))
    else:  # default: date_asc
        query = query.order_by(asc(Event.event_date))
        
    events = query.all()
    
    # Compute display status and ratings
    for evt in events:
        auto_update_event_status(evt)
        populate_rating_info(evt, db)

    # If sorted by rating, re-sort in-memory
    if sort_by == "rating":
        events.sort(key=lambda e: (e.average_rating or 0.0, e.total_reviews or 0), reverse=True)

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
    populate_rating_info(event, db)
    return event

@router.get("/meta/categories")
def get_categories():
    return ["Music", "Tech", "Sports", "Business", "Comedy", "Theatre"]

@router.get("/meta/cities")
def get_popular_cities():
    return ["All Cities", "Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai"]

