import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import User, Event, Booking, Ticket, Notification, Coupon
from app.schemas import BookingCreate, BookingResponse
from app.dependencies import get_current_user
from app.services_qr import generate_qr_code
from app.websocket_manager import seat_manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
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
    discount_amount = 0.0
    final_amount = total_price
    coupon_id = None

    # Validate coupon and apply promotional discount
    if booking_in.coupon_code:
        code = booking_in.coupon_code.strip().upper()
        now = datetime.utcnow()
        coupon = db.query(Coupon).filter(Coupon.coupon_code == code).first()
        if coupon and coupon.is_active and coupon.expiry_date > now and coupon.times_used < coupon.usage_limit:
            if total_price >= coupon.minimum_booking_amount:
                coupon_id = coupon.id
                if coupon.discount_type == "PERCENTAGE":
                    discount_amount = round(total_price * (coupon.discount_value / 100.0), 2)
                else:  # FIXED
                    discount_amount = round(min(coupon.discount_value, total_price), 2)
                final_amount = round(max(0.0, total_price - discount_amount), 2)
                coupon.times_used += 1

    # 4. Atomic seat deduction
    event.available_seats -= booking_in.ticket_quantity

    # 5. Create Booking record
    booking = Booking(
        user_id=current_user.id,
        event_id=event.id,
        coupon_id=coupon_id,
        ticket_quantity=booking_in.ticket_quantity,
        total_price=total_price,
        discount_amount=discount_amount,
        final_amount=final_amount,
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
        message=f"You booked {booking_in.ticket_quantity} ticket(s) for '{event.title}'. Amount: ₹{final_amount:.2f}. Digital passes are ready.",
        notification_type="BOOKING",
        type="BOOKING",
        is_read=False
    )
    db.add(notification)

    # 8. Commit entire transaction
    db.commit()
    
    # Broadcast live seat availability update to connected WebSocket clients
    try:
        await seat_manager.broadcast_seat_update(
            event_id=event.id,
            available_seats=event.available_seats,
            total_seats=event.total_seats,
            event_status=event.event_status
        )
    except Exception as e:
        print(f"WebSocket broadcast notice: {e}")

    # Reload booking to guarantee all relationships (tickets, event) are fully loaded
    full_booking = (
        db.query(Booking)
        .filter(Booking.id == booking.id)
        .first()
    )
    _ = full_booking.tickets
    _ = full_booking.event

    return full_booking


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
    for b in bookings:
        if b.final_amount is None:
            b.final_amount = b.total_price or 0.0
        if b.discount_amount is None:
            b.discount_amount = 0.0
        # If any booking lacks tickets, dynamically generate them
        if not b.tickets:
            for _ in range(b.ticket_quantity or 1):
                suffix = uuid.uuid4().hex[:8].upper()
                t_code = f"SE-{b.event_id}-{b.id}-{suffix}"
                q_url = generate_qr_code(
                    ticket_code=t_code,
                    verification_data={
                        "booking_id": b.id,
                        "event_title": b.event.title if b.event else "Event",
                        "user_name": current_user.username
                    }
                )
                t_obj = Ticket(
                    booking_id=b.id,
                    ticket_code=t_code,
                    qr_code_url=q_url,
                    is_used=False
                )
                db.add(t_obj)
            db.commit()
            db.refresh(b)
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
    if booking.final_amount is None:
        booking.final_amount = booking.total_price or 0.0
    if booking.discount_amount is None:
        booking.discount_amount = 0.0
    if not booking.tickets:
        for _ in range(booking.ticket_quantity or 1):
            suffix = uuid.uuid4().hex[:8].upper()
            t_code = f"SE-{booking.event_id}-{booking.id}-{suffix}"
            q_url = generate_qr_code(
                ticket_code=t_code,
                verification_data={
                    "booking_id": booking.id,
                    "event_title": booking.event.title if booking.event else "Event",
                    "user_name": current_user.username
                }
            )
            t_obj = Ticket(
                booking_id=booking.id,
                ticket_code=t_code,
                qr_code_url=q_url,
                is_used=False
            )
            db.add(t_obj)
        db.commit()
        db.refresh(booking)
    return booking
