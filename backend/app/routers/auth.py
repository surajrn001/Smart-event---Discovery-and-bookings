from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from app.security import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if username or email already exists
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    if db.query(User).filter(User.username == user_in.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )

    # Sanitize role (only USER or ORGANIZER can self-register, ADMIN is pre-seeded)
    role_to_set = "ORGANIZER" if user_in.role and user_in.role.upper() == "ORGANIZER" else "USER"

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        role=role_to_set
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=TokenResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

from app.models import User, Booking, Wishlist, Review, Event
from app.schemas import UserRegister, UserLogin, TokenResponse, UserResponse, UserProfileUpdate, UserActivitySummary
from app.security import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user
from datetime import datetime
from collections import Counter

@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user account profile information."""
    if profile_in.username and profile_in.username != current_user.username:
        # Check uniqueness
        existing = db.query(User).filter(User.username == profile_in.username).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )
        current_user.username = profile_in.username.strip()

    if profile_in.bio is not None:
        current_user.bio = profile_in.bio.strip()
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone.strip()
    if profile_in.city is not None:
        current_user.city = profile_in.city.strip()
    if profile_in.avatar_url is not None:
        current_user.avatar_url = profile_in.avatar_url.strip()

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/profile/summary", response_model=UserActivitySummary)
def get_user_activity_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compute activity metrics, booking summary, and preferences for current user."""
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    wishlist_count = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).count()
    reviews_count = db.query(Review).filter(Review.user_id == current_user.id).count()

    confirmed_bookings = [b for b in bookings if b.booking_status == "CONFIRMED"]
    total_bookings = len(confirmed_bookings)
    total_tickets = sum(b.ticket_quantity for b in confirmed_bookings)
    total_spent = sum((b.final_amount if b.final_amount and b.final_amount > 0 else b.total_price) for b in confirmed_bookings)

    now = datetime.utcnow()
    upcoming_events_count = sum(1 for b in confirmed_bookings if b.event and b.event.event_date >= now)

    # Favorite category
    categories = [b.event.category for b in confirmed_bookings if b.event and b.event.category]
    fav_cat = Counter(categories).most_common(1)[0][0] if categories else None

    return UserActivitySummary(
        total_bookings=total_bookings,
        total_tickets=total_tickets,
        total_spent=round(total_spent, 2),
        upcoming_events_count=upcoming_events_count,
        wishlist_count=wishlist_count,
        reviews_count=reviews_count,
        favorite_category=fav_cat
    )
