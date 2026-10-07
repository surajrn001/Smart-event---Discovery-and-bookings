from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database import get_db
from app.models import Event
from app.schemas import EventResponse, EventCreate

router = APIRouter(prefix="/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def get_events(
    category: Optional[str] = Query(None, description="Filter by category (Music, Tech, Sports, Business)"),
    search: Optional[str] = Query(None, description="Search by title, location or description"),
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
        
    return query.order_by(Event.event_date.asc()).all()

@router.get("/{event_id}", response_model=EventResponse)
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID {event_id} was not found"
        )
    return event

@router.get("/meta/categories")
def get_categories():
    return ["Music", "Tech", "Sports", "Business"]
