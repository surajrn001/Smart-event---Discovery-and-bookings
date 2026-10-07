import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Event, Booking, Ticket, Notification
from app.schemas import BookingCreate, BookingResponse
from app.dependencies import get_current_user
from app.services_qr import generate_qr_code

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_in: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch Event with row lock / validation
    event = db.query(Event).filter(Event.id == booking_in.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )

    # 2. Validate seat availability
    if event.available_seats < booking_in.ticket_quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Sold out or insufficient tickets! Only {event.available_seats} seat(s) remaining."
        )

    # 3. Calculate total price
    total_price = round(event.ticket_price * booking_in.ticket_quantity, 2)

    # 4. Atomic seat deduction
    event.available_seats -= booking_in.ticket_quantity

    # 5. Create Booking record
    booking = Booking(
        user_id=current_user.id,
        event_id=event.id,
        ticket_quantity=booking_in.ticket_quantity,
        total_price=total_price,
        booking_status="CONFIRMED"
    )
    db.add(booking)
    db.flush()  # Populates booking.id

    # 6. Generate digital Tickets & QR Codes
    created_tickets = []
    for i in range(booking_in.ticket_quantity):
        unique_suffix = uuid.uuid4().hex[:8].upper()
        ticket_code = f"SE-{event.id}-{booking.id}-{unique_suffix}"
        
        qr_url = generate_qr_code(
            ticket_code=ticket_code,
            verification_data={
                "booking_id": booking.id,
                "event_title": event.title,
                "user_name": current_user.username
            }
        )
        
        ticket = Ticket(
            booking_id=booking.id,
            ticket_code=ticket_code,
            qr_code_url=qr_url,
            is_used=False
        )
        db.add(ticket)
        created_tickets.append(ticket)

    # 7. Create in-app Notification for confirmation
    notification = Notification(
        user_id=current_user.id,
        title="Booking Confirmed",
        message=f"You booked {booking_in.ticket_quantity} ticket(s) for '{event.title}'. Your digital ticket is ready.",
        type="BOOKING",
        is_read=False
    )
    db.add(notification)

    # 8. Commit entire transaction
    db.commit()
    db.refresh(booking)

    return booking

@router.get("", response_model=List[BookingResponse])
def get_user_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bookings = (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.created_at.desc())
        .all()
    )
    return bookings

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_detail(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = (
        db.query(Booking)
        .filter(Booking.id == booking_id, Booking.user_id == current_user.id)
        .first()
    )
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or unauthorized access"
        )
    return booking
