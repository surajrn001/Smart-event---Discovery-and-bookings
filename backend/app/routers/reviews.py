from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Event, Booking, Review
from app.schemas import (
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
    EventReviewsSummary,
)
from app.dependencies import get_current_user

router = APIRouter(tags=["Event Feedback & Ratings"])

@router.get("/events/{event_id}/reviews", response_model=EventReviewsSummary)
def get_event_reviews(
    event_id: int,
    db: Session = Depends(get_db)
):
    """Fetch all ratings and reviews for an event with average calculation."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    reviews = (
        db.query(Review)
        .filter(Review.event_id == event_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    review_responses = []
    total_score = 0
    for r in reviews:
        total_score += r.rating
        review_responses.append(ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            event_id=r.event_id,
            rating=r.rating,
            review_text=r.review_text,
            created_at=r.created_at,
            username=r.user.username if r.user else "Anonymous"
        ))

    total_count = len(reviews)
    avg_rating = round(total_score / total_count, 1) if total_count > 0 else 0.0

    return EventReviewsSummary(
        event_id=event_id,
        average_rating=avg_rating,
        total_reviews=total_count,
        reviews=review_responses
    )

@router.post("/events/{event_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    event_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a rating and review for an event. Verified attendees only."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Rule: Only users who booked and confirmed can review
    confirmed_booking = (
        db.query(Booking)
        .filter(
            Booking.event_id == event_id,
            Booking.user_id == current_user.id,
            Booking.booking_status == "CONFIRMED"
        )
        .first()
    )
    if not confirmed_booking:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified ticket holders who booked this event can submit a review."
        )

    # Check for existing review by this user
    existing_review = (
        db.query(Review)
        .filter(Review.event_id == event_id, Review.user_id == current_user.id)
        .first()
    )
    if existing_review:
        # Update existing review
        existing_review.rating = review_in.rating
        existing_review.review_text = review_in.review_text
        db.commit()
        db.refresh(existing_review)
        return ReviewResponse(
            id=existing_review.id,
            user_id=existing_review.user_id,
            event_id=existing_review.event_id,
            rating=existing_review.rating,
            review_text=existing_review.review_text,
            created_at=existing_review.created_at,
            username=current_user.username
        )

    new_review = Review(
        user_id=current_user.id,
        event_id=event_id,
        rating=review_in.rating,
        review_text=review_in.review_text
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return ReviewResponse(
        id=new_review.id,
        user_id=new_review.user_id,
        event_id=new_review.event_id,
        rating=new_review.rating,
        review_text=new_review.review_text,
        created_at=new_review.created_at,
        username=current_user.username
    )

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_in: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Edit an existing review owned by the current user."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You can only edit your own review")

    if review_in.rating is not None:
        review.rating = review_in.rating
    if review_in.review_text is not None:
        review.review_text = review_in.review_text

    db.commit()
    db.refresh(review)
    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        event_id=review.event_id,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at,
        username=current_user.username
    )

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a review owned by the current user."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You can only delete your own review")

    db.delete(review)
    db.commit()
    return None
