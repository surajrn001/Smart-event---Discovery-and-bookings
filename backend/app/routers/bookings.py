import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import User, Event, Booking, Ticket, Notification, Coupon, Payment
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
    # 1. Fetch Event with validation
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

    # 3. Calculate base total price
    total_price = round(event.ticket_price * booking_in.ticket_quantity, 2)
    discount_amount = 0.0
    final_amount = total_price
    coupon_obj = None

    # 4. Process coupon if provided
    if booking_in.coupon_code and booking_in.coupon_code.strip():
        code_clean = booking_in.coupon_code.strip().upper()
        coupon = db.query(Coupon).filter(Coupon.coupon_code == code_clean).first()
        if coupon and coupon.is_active:
            # Check expiry & usage
            not_expired = coupon.expiry_date is None or coupon.expiry_date >= datetime.utcnow()
            within_limit = coupon.used_count < coupon.usage_limit
            min_met = total_price >= coupon.minimum_booking_amount

            if not_expired and within_limit and min_met:
                if coupon.discount_type.upper() == "PERCENTAGE":
                    discount_amount = round((coupon.discount_value / 100.0) * total_price, 2)
                else:
                    discount_amount = round(min(coupon.discount_value, total_price), 2)
                
                final_amount = max(0.0, round(total_price - discount_amount, 2))
                coupon.used_count += 1
                coupon_obj = coupon

    # 5. Determine payment status simulation
    payment_status = (booking_in.simulate_status or "SUCCESS").upper()
    booking_status = "CONFIRMED" if payment_status == "SUCCESS" else "FAILED"

    # 6. Create Booking record
    booking = Booking(
        user_id=current_user.id,
        event_id=event.id,
        ticket_quantity=booking_in.ticket_quantity,
        total_price=total_price,
        coupon_id=coupon_obj.id if coupon_obj else None,
        discount_amount=discount_amount,
        final_amount=final_amount,
        booking_status=booking_status
    )
    db.add(booking)
    db.flush()

    # 7. Create Payment record
    txn_id = f"TXN_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6].upper()}"
    payment = Payment(
        booking_id=booking.id,
        payment_method=(booking_in.payment_method or "CARD").upper(),
        payment_status=payment_status,
        transaction_id=txn_id,
        amount=final_amount
    )
    db.add(payment)

    # 8. Handle payment success vs failure
    if payment_status == "SUCCESS":
        # Deduct seats atomically
        event.available_seats -= booking_in.ticket_quantity

        # Generate digital Tickets & QR Passes
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

        # In-app notifications for payment & booking
        db.add(Notification(
            user_id=current_user.id,
            title="Payment Successful",
            message=f"Payment of ₹{final_amount:.2f} received. Transaction ID: {txn_id}.",
            type="PAYMENT",
            is_read=False
        ))
        db.add(Notification(
            user_id=current_user.id,
            title="Booking Confirmed",
            message=f"You booked {booking_in.ticket_quantity} ticket(s) for '{event.title}'. Digital passes are ready.",
            type="BOOKING",
            is_read=False
        ))
    else:
        # Payment Failed notification
        db.add(Notification(
            user_id=current_user.id,
            title="Payment Failed",
            message=f"Transaction {txn_id} for ₹{final_amount:.2f} failed. You can retry your booking.",
            type="PAYMENT",
            is_read=False
        ))

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
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    if booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to view this booking"
        )
    return booking
