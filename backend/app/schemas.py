from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: Optional[str] = "USER"  # USER, ORGANIZER

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Event Schemas ---
class EventBase(BaseModel):
    title: str
    description: str
    category: str
    location: str
    event_date: datetime
    ticket_price: float
    total_seats: int = 100
    banner_image: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    ticket_price: Optional[float] = None
    total_seats: Optional[int] = None
    banner_image: Optional[str] = None
    event_status: Optional[str] = None

class EventResponse(EventBase):
    id: int
    organizer_id: Optional[int] = None
    available_seats: int
    event_status: str
    created_at: datetime
    average_rating: Optional[float] = 0.0
    total_reviews: Optional[int] = 0

    class Config:
        from_attributes = True

# --- Ticket Schemas ---
class TicketResponse(BaseModel):
    id: int
    booking_id: int
    ticket_code: str
    qr_code_url: str
    is_used: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Payment Schemas ---
class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: str = "CARD"  # CARD, UPI, NETBANKING, SIMULATED
    simulate_status: Optional[str] = "SUCCESS"  # SUCCESS, FAILED
    card_number: Optional[str] = None
    upi_id: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    booking_id: int
    payment_method: str
    payment_status: str
    transaction_id: str
    amount: float
    created_at: datetime

    class Config:
        from_attributes = True

# --- Coupon Schemas ---
class CouponBase(BaseModel):
    coupon_code: str
    discount_type: str = "PERCENTAGE"  # PERCENTAGE or FIXED
    discount_value: float
    minimum_booking_amount: float = 0.0
    expiry_date: Optional[datetime] = None
    usage_limit: int = 100
    is_active: bool = True

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int
    used_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class CouponValidateRequest(BaseModel):
    coupon_code: str
    booking_amount: float

class CouponValidateResponse(BaseModel):
    valid: bool
    coupon_code: str
    discount_type: str
    discount_value: float
    discount_amount: float
    final_amount: float
    message: str

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    event_id: int
    ticket_quantity: int = Field(..., ge=1, le=10)
    coupon_code: Optional[str] = None
    payment_method: Optional[str] = "CARD"
    simulate_status: Optional[str] = "SUCCESS"

class BookingResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    ticket_quantity: int
    total_price: float
    coupon_id: Optional[int] = None
    discount_amount: float = 0.0
    final_amount: Optional[float] = None
    booking_status: str
    created_at: datetime
    event: Optional[EventResponse] = None
    user: Optional[UserResponse] = None
    tickets: List[TicketResponse] = []
    payment: Optional[PaymentResponse] = None

    class Config:
        from_attributes = True

# --- Review Schemas ---
class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=2, max_length=1000)

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    review_text: Optional[str] = Field(None, min_length=2, max_length=1000)

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    event_id: int
    rating: int
    review_text: str
    created_at: datetime
    username: Optional[str] = None

    class Config:
        from_attributes = True

class EventReviewsSummary(BaseModel):
    event_id: int
    average_rating: float
    total_reviews: int
    reviews: List[ReviewResponse]

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: bool = True

# --- Analytics Schemas ---
class OrganizerEventStats(BaseModel):
    event_id: int
    title: str
    category: str
    event_status: str
    total_seats: int
    available_seats: int
    tickets_sold: int
    ticket_price: float
    total_revenue: float
    booking_count: int

class OrganizerAnalyticsSummary(BaseModel):
    total_events: int
    total_tickets_sold: int
    total_revenue: float
    total_bookings: int
    events_stats: List[OrganizerEventStats]

class AdminPlatformOverview(BaseModel):
    total_users: int
    total_organizers: int
    total_events: int
    total_tickets_sold: int
    total_bookings: int
    total_revenue: float
    active_events: int
