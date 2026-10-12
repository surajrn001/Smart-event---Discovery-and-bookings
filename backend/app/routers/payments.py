import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import User, Event, Booking, Payment, Ticket, Notification
from app.schemas import PaymentCreate, PaymentResponse
from app.dependencies import get_current_user
from app.services_qr import generate_qr_code

router = APIRouter(prefix="/payments", tags=["Payment System"])

@router.post("/process", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def process_payment(
    payment_in: PaymentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process ticket payment with simulation support."""
    booking = db.query(Booking).filter(Booking.id == payment_in.booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking record not found"
        )

    # Check ownership
    if booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to pay for this booking"
        )

    # If already paid
    if booking.booking_status == "CONFIRMED" and booking.payment and booking.payment.payment_status == "SUCCESS":
        return booking.payment

    event = db.query(Event).filter(Event.id == booking.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    amount_to_pay = booking.final_amount if booking.final_amount is not None else booking.total_price
    simulate_status = (payment_in.simulate_status or "SUCCESS").upper()

    # Generate transaction reference
    txn_id = f"TXN_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:6].upper()}"

    # Check if payment already exists
    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()
    if not payment:
        payment = Payment(
            booking_id=booking.id,
            payment_method=payment_in.payment_method.upper(),
            payment_status=simulate_status,
            transaction_id=txn_id,
            amount=amount_to_pay
        )
        db.add(payment)
    else:
        payment.payment_method = payment_in.payment_method.upper()
        payment.payment_status = simulate_status
        payment.transaction_id = txn_id
        payment.amount = amount_to_pay

    if simulate_status == "SUCCESS":
        booking.booking_status = "CONFIRMED"

        # Generate tickets & QR passes if not yet generated
        existing_tickets = db.query(Ticket).filter(Ticket.booking_id == booking.id).all()
        if not existing_tickets:
            # Check seat inventory first
            if event.available_seats < booking.ticket_quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Only {event.available_seats} seat(s) available. Cannot complete booking."
                )
            event.available_seats -= booking.ticket_quantity

            for i in range(booking.ticket_quantity):
                suffix = uuid.uuid4().hex[:8].upper()
                ticket_code = f"SE-{event.id}-{booking.id}-{suffix}"
                qr_url = generate_qr_code(
                    ticket_code=ticket_code,
                    verification_data={
                        "booking_id": booking.id,
                        "event_title": event.title,
                        "user_name": current_user.username
                    }
                )
                t = Ticket(
                    booking_id=booking.id,
                    ticket_code=ticket_code,
                    qr_code_url=qr_url,
                    is_used=False
                )
                db.add(t)

        # Create notifications
        db.add(Notification(
            user_id=current_user.id,
            title="Payment Successful",
            message=f"Payment of ₹{amount_to_pay:.2f} completed via {payment_in.payment_method.upper()}. Transaction ID: {txn_id}",
            type="PAYMENT",
            is_read=False
        ))
        db.add(Notification(
            user_id=current_user.id,
            title="Booking Confirmed",
            message=f"Confirmed! Your {booking.ticket_quantity} pass(es) for '{event.title}' are ready.",
            type="BOOKING",
            is_read=False
        ))

    else:
        booking.booking_status = "FAILED"
        db.add(Notification(
            user_id=current_user.id,
            title="Payment Failed",
            message=f"Transaction {txn_id} of ₹{amount_to_pay:.2f} failed. You can retry anytime.",
            type="PAYMENT",
            is_read=False
        ))

    db.commit()
    db.refresh(payment)
    return payment

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking and booking.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Unauthorized")

    return payment

@router.get("/booking/{booking_id}", response_model=PaymentResponse)
def get_booking_payment(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.booking_id == booking_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="No payment found for this booking")
    return payment
