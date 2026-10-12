from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.database import get_db
from app.models import Coupon, User
from app.schemas import (
    CouponCreate,
    CouponResponse,
    CouponValidateRequest,
    CouponValidateResponse,
)
from app.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/coupons", tags=["Coupons & Discounts"])

@router.get("", response_model=List[CouponResponse])
def get_active_coupons(db: Session = Depends(get_db)):
    """Fetch active promotional coupons available for users."""
    now = datetime.utcnow()
    coupons = (
        db.query(Coupon)
        .filter(Coupon.is_active == True)
        .filter((Coupon.expiry_date == None) | (Coupon.expiry_date >= now))
        .all()
    )
    return coupons

@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    req: CouponValidateRequest,
    db: Session = Depends(get_db)
):
    """Validate a coupon code and calculate applicable discount."""
    code_clean = req.coupon_code.strip().upper()
    coupon = db.query(Coupon).filter(Coupon.coupon_code == code_clean).first()

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Coupon '{code_clean}' is not recognized."
        )

    if not coupon.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code_clean}' is currently inactive."
        )

    if coupon.expiry_date and coupon.expiry_date < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code_clean}' has expired."
        )

    if coupon.used_count >= coupon.usage_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code_clean}' has reached its maximum usage limit."
        )

    if req.booking_amount < coupon.minimum_booking_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum booking amount of ₹{coupon.minimum_booking_amount:.2f} required for coupon '{code_clean}'."
        )

    # Calculate discount
    if coupon.discount_type.upper() == "PERCENTAGE":
        discount = (coupon.discount_value / 100.0) * req.booking_amount
    else:  # FIXED
        discount = min(coupon.discount_value, req.booking_amount)

    discount = round(discount, 2)
    final_amt = max(0.0, round(req.booking_amount - discount, 2))

    return CouponValidateResponse(
        valid=True,
        coupon_code=coupon.coupon_code,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        discount_amount=discount,
        final_amount=final_amt,
        message=f"Coupon applied! You saved ₹{discount:.2f}."
    )

@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    coupon_in: CouponCreate,
    current_user: User = Depends(require_roles(["ADMIN", "ORGANIZER"])),
    db: Session = Depends(get_db)
):
    """Admin/Organizer creation of discount coupons."""
    code_clean = coupon_in.coupon_code.strip().upper()
    existing = db.query(Coupon).filter(Coupon.coupon_code == code_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon '{code_clean}' already exists."
        )

    new_coupon = Coupon(
        coupon_code=code_clean,
        discount_type=coupon_in.discount_type.upper(),
        discount_value=coupon_in.discount_value,
        minimum_booking_amount=coupon_in.minimum_booking_amount,
        expiry_date=coupon_in.expiry_date,
        usage_limit=coupon_in.usage_limit,
        is_active=coupon_in.is_active
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon
