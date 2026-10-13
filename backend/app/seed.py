from datetime import datetime, timedelta
from app.models import User, Event, Coupon, Review, Notification
from app.security import hash_password

DEFAULT_USERS = [
    {
        "username": "admin",
        "email": "admin@smartevent.com",
        "password": "adminpassword123",
        "role": "ADMIN"
    },
    {
        "username": "tech_organizer",
        "email": "organizer@smartevent.com",
        "password": "organizerpass123",
        "role": "ORGANIZER"
    },
    {
        "username": "rahul_user",
        "email": "rahul@example.com",
        "password": "password123",
        "role": "USER"
    }
]

SAMPLE_COUPONS = [
    {
        "coupon_code": "BMS50",
        "discount_type": "PERCENTAGE",
        "discount_value": 50.0,
        "minimum_booking_amount": 300.0,
        "expiry_date": datetime.utcnow() + timedelta(days=60),
        "usage_limit": 500,
        "is_active": True
    },
    {
        "coupon_code": "FLAT100",
        "discount_type": "FIXED",
        "discount_value": 100.0,
        "minimum_booking_amount": 250.0,
        "expiry_date": datetime.utcnow() + timedelta(days=45),
        "usage_limit": 250,
        "is_active": True
    },
    {
        "coupon_code": "WELCOME20",
        "discount_type": "PERCENTAGE",
        "discount_value": 20.0,
        "minimum_booking_amount": 199.0,
        "expiry_date": datetime.utcnow() + timedelta(days=90),
        "usage_limit": 1000,
        "is_active": True
    },
    {
        "coupon_code": "SUPERFEST",
        "discount_type": "FIXED",
        "discount_value": 150.0,
        "minimum_booking_amount": 499.0,
        "expiry_date": datetime.utcnow() + timedelta(days=30),
        "usage_limit": 150,
        "is_active": True
    }
]

SAMPLE_EVENTS = [
    {
        "title": "National Tech Conference 2026",
        "description": "Annual tech conference covering Web Development, Artificial Intelligence, and Cloud Computing. Includes technical sessions, project showcases, and student hackathons.",
        "category": "Tech",
        "location": "Auditorium Hall, Bangalore",
        "event_date": datetime.utcnow() + timedelta(days=10, hours=4),
        "ticket_price": 499.00,
        "total_seats": 200,
        "available_seats": 150,
        "banner_image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        "event_status": "UPCOMING"
    },
    {
        "title": "Live Acoustic & Indie Music Night",
        "description": "An open-air evening with live indie bands, acoustic performances, and food stalls. Great for music lovers and college groups.",
        "category": "Music",
        "location": "Open Ground, Pune",
        "event_date": datetime.utcnow() + timedelta(days=5, hours=8),
        "ticket_price": 299.00,
        "total_seats": 300,
        "available_seats": 120,
        "banner_image": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        "event_status": "UPCOMING"
    },
    {
        "title": "Inter-College Cricket Tournament Finals",
        "description": "Cheer for your favorite teams in the grand finale of the state cricket championship. Refreshments and spectator merchandise included.",
        "category": "Sports",
        "location": "City Sports Stadium, Mumbai",
        "event_date": datetime.utcnow() + timedelta(days=15, hours=2),
        "ticket_price": 199.00,
        "total_seats": 400,
        "available_seats": 280,
        "banner_image": "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
        "event_status": "UPCOMING"
    },
    {
        "title": "Startup & Entrepreneurship Summit",
        "description": "Workshop and networking forum for founders, early stage startups, and investors. Learn how to pitch ideas and raise seed funding.",
        "category": "Business",
        "location": "Convention Center, Hyderabad",
        "event_date": datetime.utcnow() + timedelta(days=8, hours=5),
        "ticket_price": 799.00,
        "total_seats": 150,
        "available_seats": 65,
        "banner_image": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
        "event_status": "UPCOMING"
    },
    {
        "title": "Classical Fusion Music Festival",
        "description": "A weekend festival bringing together traditional sitar, tabla, and modern fusion bands. Suitable for all age groups.",
        "category": "Music",
        "location": "Town Cultural Hall, Delhi",
        "event_date": datetime.utcnow() + timedelta(days=3, hours=6),
        "ticket_price": 350.00,
        "total_seats": 180,
        "available_seats": 40,
        "banner_image": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
        "event_status": "UPCOMING"
    },
    {
        "title": "AI & Python Developer Meetup",
        "description": "Hands-on coding workshop on building simple web apps using Python, FastAPI, and Machine Learning models. Certificate of participation provided.",
        "category": "Tech",
        "location": "IT Park Seminar Room, Chennai",
        "event_date": datetime.utcnow() + timedelta(days=12, hours=3),
        "ticket_price": 250.00,
        "total_seats": 100,
        "available_seats": 55,
        "banner_image": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
        "event_status": "UPCOMING"
    }
]

def seed_events_if_empty(db):
    # 1. Seed default accounts if missing
    organizer_user = None
    default_user = None
    for u_data in DEFAULT_USERS:
        existing = db.query(User).filter(User.email == u_data["email"]).first()
        if not existing:
            new_u = User(
                username=u_data["username"],
                email=u_data["email"],
                hashed_password=hash_password(u_data["password"]),
                role=u_data["role"]
            )
            db.add(new_u)
            db.commit()
            db.refresh(new_u)
            if new_u.role == "ORGANIZER":
                organizer_user = new_u
            if new_u.role == "USER":
                default_user = new_u
        else:
            if existing.role == "ORGANIZER":
                organizer_user = existing
            if existing.role == "USER":
                default_user = existing

    # 2. Seed events if missing
    count = db.query(Event).count()
    if count == 0:
        org_id = organizer_user.id if organizer_user else None
        for item in SAMPLE_EVENTS:
            event = Event(organizer_id=org_id, **item)
            db.add(event)
        db.commit()

    # 3. Seed coupons if missing
    coupon_count = db.query(Coupon).count()
    if coupon_count == 0:
        for c_data in SAMPLE_COUPONS:
            coupon = Coupon(**c_data)
            db.add(coupon)
        db.commit()
        print(f"Added {len(SAMPLE_COUPONS)} promotional coupons.")

    # 4. Seed reviews if missing
    review_count = db.query(Review).count()
    if review_count == 0 and default_user:
        all_events = db.query(Event).all()
        sample_reviews_text = [
            (5, "Absolutely phenomenal experience! Sound quality and atmosphere were top tier. Digital pass booking made entry super seamless."),
            (5, "Brilliant sessions, very well organized and informative. Would love to attend again next year!"),
            (4, "Great crowd and great lineup of performers! Food stalls were a bit crowded but overall great vibe."),
            (5, "World-class arrangement! Digital QR ticket pass worked instantaneously at the gate."),
            (4, "Very helpful networking opportunity with founders and mentors. Value for money."),
        ]
        for idx, evt in enumerate(all_events):
            rev_rating, rev_text = sample_reviews_text[idx % len(sample_reviews_text)]
            rev = Review(
                user_id=default_user.id,
                event_id=evt.id,
                rating=rev_rating,
                review_text=rev_text,
                created_at=datetime.utcnow() - timedelta(days=idx + 1)
            )
            db.add(rev)
        db.commit()
        print(f"Added sample reviews for ratings discovery.")

