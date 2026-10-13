from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Event, Booking, Review
from app.schemas import ReviewCreate, ReviewUpdate, ReviewResponse, EventReviewsSummary
from app.dependencies import get_current_user, get_optional_current_user

router = APIRouter(tags=["Reviews & Ratings"])

@router.get("/events/{event_id}/reviews", response_model=EventReviewsSummary)
def get_event_reviews(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    reviews = (
        db.query(Review)
        .filter(Review.event_id == event_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    total_reviews = len(reviews)
    avg_rating = round(sum(r.rating for r in reviews) / total_reviews, 1) if total_reviews > 0 else 0.0

    dist = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for r in reviews:
        dist[str(r.rating)] = dist.get(str(r.rating), 0) + 1

    review_responses = [
        ReviewResponse(
            id=r.id,
            user_id=r.user_id,
            event_id=r.event_id,
            username=r.user.username if r.user else "Anonymous",
            rating=r.rating,
            review_text=r.review_text,
            created_at=r.created_at
        )
        for r in reviews
    ]

    # Check eligibility for current user
    user_can_review = False
    user_review_resp = None

    if current_user:
        # User must have at least one confirmed booking for this event
        has_attended = db.query(Booking).filter(
            Booking.event_id == event_id,
            Booking.user_id == current_user.id,
            Booking.booking_status == "CONFIRMED"
        ).first() is not None
        user_can_review = has_attended

        # Check existing review
        my_rev = next((r for r in reviews if r.user_id == current_user.id), None)
        if my_rev:
            user_review_resp = ReviewResponse(
                id=my_rev.id,
                user_id=my_rev.user_id,
                event_id=my_rev.event_id,
                username=current_user.username,
                rating=my_rev.rating,
                review_text=my_rev.review_text,
                created_at=my_rev.created_at
            )

    return EventReviewsSummary(
        average_rating=avg_rating,
        total_reviews=total_reviews,
        rating_distribution=dist,
        reviews=review_responses,
        user_can_review=user_can_review,
        user_review=user_review_resp
    )

@router.post("/events/{event_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    event_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # 1. Rule: Only users who booked/attended the event can submit a review
    confirmed_booking = db.query(Booking).filter(
        Booking.event_id == event_id,
        Booking.user_id == current_user.id,
        Booking.booking_status == "CONFIRMED"
    ).first()

    if not confirmed_booking:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only verified ticket holders who attended this event can leave a review."
        )

    # 2. Check if user already submitted a review
    existing = db.query(Review).filter(
        Review.event_id == event_id,
        Review.user_id == current_user.id
    ).first()

    if existing:
        # Update existing
        existing.rating = review_in.rating
        existing.review_text = review_in.review_text
        db.commit()
        db.refresh(existing)
        return ReviewResponse(
            id=existing.id,
            user_id=existing.user_id,
            event_id=existing.event_id,
            username=current_user.username,
            rating=existing.rating,
            review_text=existing.review_text,
            created_at=existing.created_at
        )

    # 3. Create review
    review = Review(
        user_id=current_user.id,
        event_id=event_id,
        rating=review_in.rating,
        review_text=review_in.review_text,
        created_at=datetime.utcnow()
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        event_id=review.event_id,
        username=current_user.username,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at
    )

@router.put("/reviews/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    review_update: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own reviews")

    if review_update.rating is not None:
        review.rating = review_update.rating
    if review_update.review_text is not None:
        review.review_text = review_update.review_text

    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        user_id=review.user_id,
        event_id=review.event_id,
        username=current_user.username,
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at
    )

@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    if review.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You can only delete your own reviews")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"}
