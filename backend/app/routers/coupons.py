from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Coupon, User
from app.schemas import CouponValidateRequest, CouponValidateResponse, CouponResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/coupons", tags=["Coupons & Discounts"])

def calculate_discount(coupon: Coupon, booking_amount: float):
    """Compute discount amount and final payable price safely."""
    if coupon.discount_type == "PERCENTAGE":
        discount = round(booking_amount * (coupon.discount_value / 100.0), 2)
    else:  # FIXED
        discount = round(min(coupon.discount_value, booking_amount), 2)
    
    final_amount = round(max(0.0, booking_amount - discount), 2)
    return discount, final_amount

@router.get("/active", response_model=List[CouponResponse])
def get_active_coupons(db: Session = Depends(get_db)):
    """Return all active and unexpired coupons for promotional display."""
    now = datetime.utcnow()
    coupons = (
        db.query(Coupon)
        .filter(Coupon.is_active == True, Coupon.expiry_date > now)
        .all()
    )
    # Filter out limit exceeded
    return [c for c in coupons if c.times_used < c.usage_limit]

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    req: CouponValidateRequest,
    db: Session = Depends(get_db)
):
    """Validate a coupon code and compute discount preview before checkout."""
    code = req.coupon_code.strip().upper()
    now = datetime.utcnow()

    coupon = db.query(Coupon).filter(Coupon.coupon_code == code).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coupon code '{code}' does not exist"
        )

    if not coupon.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code}' is currently inactive"
        )

    if coupon.expiry_date < now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code}' has expired on {coupon.expiry_date.strftime('%Y-%m-%d')}"
        )

    if coupon.times_used >= coupon.usage_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code}' usage limit has been reached"
        )

    if req.booking_amount < coupon.minimum_booking_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum booking amount of ₹{coupon.minimum_booking_amount:.2f} required for coupon '{code}'"
        )

    discount_amount, final_amount = calculate_discount(coupon, req.booking_amount)

    return CouponValidateResponse(
        valid=True,
        coupon_code=coupon.coupon_code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        discount_amount=discount_amount,
        final_amount=final_amount,
        message=f"Coupon '{coupon.coupon_code}' applied! You saved ₹{discount_amount:.2f}"
    )
