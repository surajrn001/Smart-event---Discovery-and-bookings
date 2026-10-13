import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Booking, Payment, Notification
from app.schemas import PaymentProcessRequest, PaymentResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/process", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def process_payment(
    req: PaymentProcessRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Verify booking exists and belongs to the user
    booking = db.query(Booking).filter(
        Booking.id == req.booking_id,
        Booking.user_id == current_user.id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking record not found or unauthorized access"
        )

    # 2. Amount to pay (final_amount if coupon discount was applied, else total_price)
    payable_amount = booking.final_amount if (booking.final_amount and booking.final_amount > 0) else booking.total_price

    # 3. Simulate or process payment transaction
    # Transaction reference format: TXN-BMS-<hex>
    txn_id = f"TXN-BMS-{uuid.uuid4().hex[:12].upper()}"

    is_success = (req.simulate_status.upper() != "FAILED")
    payment_status_str = "SUCCESS" if is_success else "FAILED"

    payment = Payment(
        booking_id=booking.id,
        payment_method=req.payment_method.upper(),
        payment_status=payment_status_str,
        transaction_id=txn_id,
        amount=payable_amount,
        created_at=datetime.utcnow()
    )
    db.add(payment)

    # 4. Update booking status and send notification
    if is_success:
        booking.booking_status = "CONFIRMED"
        event_title = booking.event.title if booking.event else f"Event #{booking.event_id}"
        
        # Payment success notification
        notif = Notification(
            user_id=current_user.id,
            title="Payment Received",
            message=f"₹{payable_amount:.2f} paid successfully for '{event_title}' via {req.payment_method.upper()}. Txn ID: {txn_id}.",
            notification_type="PAYMENT",
            type="PAYMENT",
            is_read=False
        )
        db.add(notif)
    else:
        booking.booking_status = "PAYMENT_FAILED"
        notif = Notification(
            user_id=current_user.id,
            title="Payment Failed",
            message=f"Payment of ₹{payable_amount:.2f} failed for booking #{booking.id}. Please retry payment.",
            notification_type="PAYMENT",
            type="PAYMENT",
            is_read=False
        )
        db.add(notif)

    db.commit()
    db.refresh(payment)
    return payment

@router.get("/booking/{booking_id}", response_model=PaymentResponse)
def get_payment_for_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = (
        db.query(Payment)
        .join(Booking)
        .filter(Payment.booking_id == booking_id, Booking.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .first()
    )
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment record found for this booking"
        )
    return payment
