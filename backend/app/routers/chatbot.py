from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import datetime, timedelta
import re

from app.database import get_db
from app.models import User, Event, Booking, Coupon
from app.schemas import ChatbotMessageRequest, ChatbotMessageResponse, EventResponse
from app.dependencies import get_optional_current_user

router = APIRouter(prefix="/chatbot", tags=["AI Chatbot Assistant"])

@router.post("/message", response_model=ChatbotMessageResponse)
def handle_chatbot_message(
    req: ChatbotMessageRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Intelligent chatbot assistant for event discovery, ticket queries, FAQ, and platform guidance.
    Understands user intent, location preferences, budget, categories, and booking queries.
    """
    query = req.message.strip().lower()
    city_context = req.city or (current_user.city if current_user else None) or "All Cities"

    suggested_events = []
    quick_actions = [
        "🎵 Music concerts",
        "💻 Tech summits",
        "🎟️ View my passes",
        "🎁 Active coupons",
        "❓ Ticket scanning help"
    ]
    action_type = "GENERAL"

    # 1. User Bookings query
    if any(k in query for k in ["my booking", "my pass", "my ticket", "show my tickets", "booked", "purchased"]):
        action_type = "BOOKINGS"
        if not current_user:
            reply = (
                "To view your booked tickets and digital QR gate passes, please sign in to your account. "
                "Once logged in, click **My Passes** in the top navigation or ask me anytime!"
            )
            quick_actions = ["Sign in to view passes", "Explore Trending Events", "Active coupons"]
        else:
            bookings = (
                db.query(Booking)
                .filter(Booking.user_id == current_user.id)
                .order_by(Booking.created_at.desc())
                .all()
            )
            if not bookings:
                reply = (
                    f"Hello **{current_user.username}**! You don't have any event bookings yet. "
                    "Check out some of our trending concerts and tech summits below to grab your first digital pass!"
                )
                suggested_events = (
                    db.query(Event)
                    .filter(Event.event_status == "UPCOMING")
                    .order_by(Event.available_seats.asc())
                    .limit(3)
                    .all()
                )
            else:
                confirmed = [b for b in bookings if b.booking_status == "CONFIRMED"]
                reply = (
                    f"Hello **{current_user.username}**! You currently have **{len(confirmed)} confirmed booking(s)**. "
                    f"Your most recent booking is for **{confirmed[0].event.title if confirmed and confirmed[0].event else 'an event'}** "
                    f"with {confirmed[0].ticket_quantity if confirmed else 1} digital pass(es). "
                    "You can access and save your QR codes anytime under the **My Passes** page."
                )
                quick_actions = ["Go to My Passes", "Explore more events", "Need help at gate?"]

    # 2. Coupons & Discount queries
    elif any(k in query for k in ["coupon", "discount", "promo", "offer", "voucher", "code", "deal"]):
        action_type = "COUPONS"
        now = datetime.utcnow()
        active_coupons = (
            db.query(Coupon)
            .filter(Coupon.is_active == True, Coupon.expiry_date > now)
            .limit(4)
            .all()
        )
        if active_coupons:
            coupon_lines = []
            for c in active_coupons:
                val = f"{c.discount_value}% OFF" if c.discount_type == "PERCENTAGE" else f"₹{c.discount_value} OFF"
                coupon_lines.append(f"• **{c.coupon_code}** — {val} (Min order: ₹{c.minimum_booking_amount:.0f})")
            
            coupons_text = "\n".join(coupon_lines)
            reply = (
                f"🎉 Great news! Here are the active promotional codes you can apply at checkout:\n\n"
                f"{coupons_text}\n\n"
                "Just paste any of these codes in the **Apply Coupon** box during checkout for instant savings!"
            )
        else:
            reply = "We frequently drop promotional discount coupons on our homepage! Keep an eye on our festival offers banner."
        quick_actions = ["Browse All Events", "Music Events", "Tech Summits"]

    # 3. Ticket Help & Gate QR Entry FAQ
    elif any(k in query for k in ["gate", "qr", "qr code", "scanner", "scan", "check in", "entry", "help", "refund", "cancel"]):
        action_type = "FAQ"
        reply = (
            "### 🎫 SmartEvent Digital Pass & Entry Guide:\n\n"
            "1. **Instant QR Passes**: After confirming your booking, scannable QR tickets are generated immediately.\n"
            "2. **Gate Check-in**: Show the digital pass on your phone screen at the venue gate for contactless scanning.\n"
            "3. **Offline Access**: You can download or print your QR pass image from the **My Passes** section.\n"
            "4. **Cancellation & Refunds**: If an organizer cancels an event, you will receive an automatic 100% refund notification.\n\n"
            "Need more help? Feel free to ask about events, dates, or discounts!"
        )
        quick_actions = ["View My Passes", "Upcoming Music Events", "Active coupons"]

    # 4. Weekend or Date specific queries
    elif any(k in query for k in ["weekend", "this weekend", "today", "tomorrow"]):
        action_type = "EVENTS"
        now = datetime.utcnow()
        # Events in next 7 days
        events_query = (
            db.query(Event)
            .filter(Event.event_status.in_(["UPCOMING", "ONGOING"]), Event.event_date >= now)
            .order_by(Event.event_date.asc())
            .limit(3)
            .all()
        )
        suggested_events = events_query
        reply = (
            "Here are the upcoming live entertainment and conferences happening soon! "
            "Click any event below to choose your seats and reserve digital gate passes:"
        )
        quick_actions = ["Events under ₹500", "Music concerts", "Tech summits"]

    # 5. Price / Budget queries (e.g. "under 500", "cheap", "free")
    elif any(k in query for k in ["under", "budget", "cheap", "price", "affordable", "500", "1000", "free"]):
        action_type = "EVENTS"
        # Extract potential number from query
        numbers = re.findall(r'\b\d+\b', query)
        max_p = float(numbers[0]) if numbers else 500.0
        events_query = (
            db.query(Event)
            .filter(Event.event_status.in_(["UPCOMING", "ONGOING"]), Event.ticket_price <= max_p)
            .order_by(Event.ticket_price.asc())
            .limit(3)
            .all()
        )
        suggested_events = events_query
        if suggested_events:
            reply = (
                f"Found these great events priced under **₹{max_p:.0f}**! "
                "Enjoy premium live entertainment without breaking the bank:"
            )
        else:
            reply = f"I couldn't find events priced under ₹{max_p:.0f}, but here are our most popular upcoming events:"
            suggested_events = (
                db.query(Event)
                .filter(Event.event_status == "UPCOMING")
                .order_by(Event.ticket_price.asc())
                .limit(3)
                .all()
            )
        quick_actions = ["Active coupons", "Tech events", "Music concerts"]

    # 6. Category queries (Music, Tech, Sports, Business)
    elif any(k in query for k in ["music", "concert", "sing", "live music", "band", "dj", "rock"]):
        action_type = "EVENTS"
        suggested_events = (
            db.query(Event)
            .filter(Event.category.ilike("%music%"), Event.event_status == "UPCOMING")
            .limit(3)
            .all()
        )
        reply = "Here are top trending **Music Concerts & Acoustic Nights** lined up for you:"
        quick_actions = ["Music this weekend", "Events under ₹500", "Active coupons"]

    elif any(k in query for k in ["tech", "summit", "developer", "conference", "ai", "coding", "software"]):
        action_type = "EVENTS"
        suggested_events = (
            db.query(Event)
            .filter(Event.category.ilike("%tech%"), Event.event_status == "UPCOMING")
            .limit(3)
            .all()
        )
        reply = "Here are premier **Tech Summits & Developer Conferences** open for registration:"
        quick_actions = ["Tech events", "View my passes", "Coupons"]

    elif any(k in query for k in ["sport", "cricket", "match", "tournament", "football"]):
        action_type = "EVENTS"
        suggested_events = (
            db.query(Event)
            .filter(Event.category.ilike("%sport%"), Event.event_status == "UPCOMING")
            .limit(3)
            .all()
        )
        reply = "Here are high-energy **Sports Matches & Tournaments** available for booking:"
        quick_actions = ["Sports Matches", "Music events", "My passes"]

    elif any(k in query for k in ["business", "startup", "investor", "pitch"]):
        action_type = "EVENTS"
        suggested_events = (
            db.query(Event)
            .filter(Event.category.ilike("%business%"), Event.event_status == "UPCOMING")
            .limit(3)
            .all()
        )
        reply = "Here are curated **Business & Startup Summits** for networking and growth:"
        quick_actions = ["Business events", "Tech Summits", "Active coupons"]

    # 7. Location / "near me" queries
    elif any(k in query for k in ["near me", "in mumbai", "in bangalore", "in delhi", "in pune", "in chennai", "location", "city"]):
        action_type = "EVENTS"
        detected_city = None
        for c in ["Bangalore", "Mumbai", "Delhi", "Pune", "Chennai", "Hyderabad"]:
            if c.lower() in query:
                detected_city = c
                break
        
        target_city = detected_city or (city_context if city_context != "All Cities" else None)
        
        if target_city:
            events_in_city = (
                db.query(Event)
                .filter(Event.location.ilike(f"%{target_city}%"), Event.event_status == "UPCOMING")
                .limit(3)
                .all()
            )
            if events_in_city:
                suggested_events = events_in_city
                reply = f"Here are the top events happening in **{target_city}**:"
            else:
                reply = f"We are currently expanding in **{target_city}**. In the meantime, here are popular national events:"
                suggested_events = db.query(Event).filter(Event.event_status == "UPCOMING").limit(3).all()
        else:
            reply = "You can select your city from the top navigation bar or check out these featured national events:"
            suggested_events = db.query(Event).filter(Event.event_status == "UPCOMING").limit(3).all()

    # 8. General / Fallback recommendation
    else:
        suggested_events = (
            db.query(Event)
            .filter(Event.event_status == "UPCOMING")
            .order_by(desc(Event.total_seats - Event.available_seats))
            .limit(3)
            .all()
        )
        reply = (
            "Hi! I'm **SmartEvent AI Assistant**. I can help you discover live concerts, tech summits, "
            "track your bookings, find promotional discount codes, or assist with gate entry passes. "
            "How can I help you today?"
        )
        quick_actions = [
            "🎵 Music concerts",
            "💻 Tech summits",
            "🎟️ My bookings",
            "🎁 Active coupons",
            "🎫 How does QR check-in work?"
        ]

    # Convert suggested events to EventResponse
    clean_suggested = [EventResponse.model_validate(e) for e in suggested_events]

    return ChatbotMessageResponse(
        reply=reply,
        suggested_events=clean_suggested,
        quick_actions=quick_actions,
        action_type=action_type
    )
