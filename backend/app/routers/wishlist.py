from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Event, Wishlist
from app.schemas import WishlistResponse, WishlistToggleResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist & Saved Events"])

@router.get("", response_model=List[WishlistResponse])
def get_user_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all events saved in user's wishlist."""
    items = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .all()
    )
    return items

@router.get("/ids", response_model=List[int])
def get_user_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return list of event IDs in user's wishlist for instant bookmark checking."""
    items = (
        db.query(Wishlist.event_id)
        .filter(Wishlist.user_id == current_user.id)
        .all()
    )
    return [item[0] for item in items]

@router.post("/{event_id}", response_model=WishlistToggleResponse)
def toggle_wishlist_item(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle event bookmark in user's wishlist (adds if not present, removes if present)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id, Wishlist.event_id == event_id)
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(
            event_id=event_id,
            is_wishlisted=False,
            message="Event removed from your wishlist"
        )
    else:
        new_item = Wishlist(
            user_id=current_user.id,
            event_id=event_id
        )
        db.add(new_item)
        db.commit()
        return WishlistToggleResponse(
            event_id=event_id,
            is_wishlisted=True,
            message="Event saved to your wishlist"
        )

@router.delete("/{event_id}", response_model=WishlistToggleResponse)
def remove_from_wishlist(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove an event specifically from user's wishlist."""
    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == current_user.id, Wishlist.event_id == event_id)
        .first()
    )
    if not existing:
        return WishlistToggleResponse(
            event_id=event_id,
            is_wishlisted=False,
            message="Event was not in your wishlist"
        )

    db.delete(existing)
    db.commit()
    return WishlistToggleResponse(
        event_id=event_id,
        is_wishlisted=False,
        message="Event removed from your wishlist"
    )
