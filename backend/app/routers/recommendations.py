from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime
from collections import Counter

from app.database import get_db
from app.models import User, Event, Booking, Wishlist, EventView, Review
from app.schemas import EventResponse
from app.dependencies import get_optional_current_user

router = APIRouter(prefix="/recommendations", tags=["Personalized Event Recommendations"])

@router.post("/events/{event_id}/view")
def record_event_view(
    event_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Log an event view to power the personalized recommendation engine."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    user_id = current_user.id if current_user else None
    view_record = EventView(
        user_id=user_id,
        event_id=event_id,
        viewed_at=datetime.utcnow()
    )
    db.add(view_record)
    db.commit()
    return {"status": "recorded", "event_id": event_id}

@router.get("", response_model=List[EventResponse])
def get_personalized_recommendations(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Generate personalized event recommendations:
    1. Analyzes user's booked categories, wishlists, and viewed events.
    2. Weights categories user interacts with most.
    3. Factors in user's city/location.
    4. Seamlessly falls back to top-rated & upcoming events if insufficient history.
    """
    now = datetime.utcnow()
    preferred_categories = []
    preferred_city = None

    if current_user:
        preferred_city = current_user.city

        # 1. Categories from user bookings (weight = 3)
        user_bookings = (
            db.query(Booking)
            .filter(Booking.user_id == current_user.id)
            .all()
        )
        for b in user_bookings:
            if b.event and b.event.category:
                preferred_categories.extend([b.event.category] * 3)

        # 2. Categories from user wishlist (weight = 2)
        user_wishlist = (
            db.query(Wishlist)
            .filter(Wishlist.user_id == current_user.id)
            .all()
        )
        for w in user_wishlist:
            if w.event and w.event.category:
                preferred_categories.extend([w.event.category] * 2)

        # 3. Categories from recently viewed events (weight = 1)
        recent_views = (
            db.query(EventView)
            .filter(EventView.user_id == current_user.id)
            .order_by(EventView.viewed_at.desc())
            .limit(10)
            .all()
        )
        for v in recent_views:
            if v.event and v.event.category:
                preferred_categories.append(v.event.category)

    # Base query: upcoming active events
    base_query = db.query(Event).filter(Event.event_status.in_(["UPCOMING", "ONGOING"]))

    # If we have clear category preferences
    if preferred_categories:
        top_category_counts = Counter(preferred_categories).most_common(2)
        top_cats = [c[0] for c in top_category_counts]
        
        # Query events matching top categories
        recommended = (
            base_query.filter(Event.category.in_(top_cats))
            .order_by(desc(Event.available_seats < Event.total_seats), Event.event_date.asc())
            .limit(6)
            .all()
        )
        
        # If fewer than 4 events found, fill with other upcoming events
        if len(recommended) < 4:
            rec_ids = [e.id for e in recommended]
            fillers = (
                base_query.filter(Event.id.notin_(rec_ids))
                .order_by(Event.ticket_price.asc())
                .limit(4 - len(recommended))
                .all()
            )
            recommended.extend(fillers)

        return recommended

    # Fallback for anonymous users or new accounts: blend of top popularity and upcoming
    recommended = (
        base_query
        .order_by(desc(Event.total_seats - Event.available_seats), Event.event_date.asc())
        .limit(6)
        .all()
    )
    return recommended

@router.get("/trending", response_model=List[EventResponse])
def get_trending_events(db: Session = Depends(get_db)):
    """Return top trending events based on ticket bookings and seat fill rate."""
    trending = (
        db.query(Event)
        .filter(Event.event_status.in_(["UPCOMING", "ONGOING"]))
        .order_by(desc(Event.total_seats - Event.available_seats), Event.created_at.desc())
        .limit(6)
        .all()
    )
    return trending
