# SmartEvent – Event Discovery, Ticket Booking & Management Platform

A complete full-stack web application built using **FastAPI** (Python 3.13) and **React** (Vite) for discovering events, reserving digital tickets with QR passes, processing simulated payments, applying promotional coupons, submitting attendee ratings, managing organizer events, and monitoring platform analytics.

---

## Core Features

- **Event Discovery & Smart Search**:
  - Filter events by category (Tech, Music, Sports, Business).
  - Search by title, keywords, or venue city.
  - Date preset filtering (All Dates, This Weekend, Next 30 Days).
  - Sort events by date (soonest/latest), ticket price (low-to-high/high-to-low), popularity (tickets sold), or attendee rating (⭐).
- **Hero & Featured Events Showcase**:
  - Modern hero discovery banner with interactive search.
  - Top trending and highest-rated events highlight.
- **Event Payment System**:
  - Dedicated Payment Checkout page with booking summary.
  - Supports UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Net Banking, and simulated test mode.
  - Generates verifiable transaction references (`TXN_...`).
  - Payment Confirmation page with transaction breakdown and digital QR entry passes.
- **Coupon & Discount System**:
  - Promotional discount engine supporting both percentage (`%`) and fixed (`₹`) discounts.
  - Validation checks for coupon active status, expiry date, usage limits, and minimum booking amount.
  - Real-time subtotal, discount savings, and final payable amount calculation.
- **Event Feedback & Ratings**:
  - Interactive 1 to 5 star rating system with attendee reviews.
  - Attendance verification rule: Only attendees with confirmed bookings can submit reviews.
  - Verified attendee badge, average star rating calculations, and user review edit/delete controls.
- **Advanced Notification System**:
  - Notification triggers for booking confirmations, payment status (success/failure), and event updates.
  - Sticky navbar with interactive notification bell dropdown and unread badge counter.
  - Dedicated Notification Center with category filters (`All`, `Bookings`, `Payments`, `Events`).
- **Role-Based Access Control (RBAC)**:
  - `USER`: Browse events, book tickets, apply coupons, make payments, rate events, and receive passes.
  - `ORGANIZER`: Publish events, edit details, cancel events, view attendee lists, and track sales revenue in ₹.
  - `ADMIN`: Platform-wide oversight, KPI analytics, 14-day sales trends, and full user/event/booking tables.
- **Digital QR Ticket Passes**: Instant cryptographic ticket generation and gate check-in verification.

---

## Default Accounts for Testing

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartevent.com` | `adminpassword123` | Full Admin Portal, Platform Analytics, Users/Events/Bookings Oversight |
| **Organizer** | `organizer@smartevent.com` | `organizerpass123` | Organizer Hub, Create Events, Sales Analytics, Manage Attendees |
| **User** | `rahul@example.com` | `password123` | Explore events, book tickets, view passes, rate events |

*(You can also register new accounts as either **User** or **Organizer** directly from the Register page).*

---

## Active Promotional Coupons for Testing

| Coupon Code | Discount Type | Value | Minimum Booking |
| :--- | :--- | :--- | :--- |
| `SMART50` | Percentage | 50% OFF | ₹200.00 |
| `FESTIVE100` | Fixed | ₹100.00 OFF | ₹300.00 |
| `EARLYBIRD` | Percentage | 20% OFF | ₹100.00 |
| `WELCOME25` | Percentage | 25% OFF | ₹150.00 |

---

## Tech Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy, SQLite, Pydantic v2, python-jose (JWT), passlib/bcrypt, qrcode & Pillow.
- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide React icons.
- **Database**: SQLite (`smartevent.db`).

---

## Project Structure

```
SmartEvent/
├── Screenshots/             # Platform walkthrough & UI demo screenshots
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app instance and router configuration
│   │   ├── config.py            # Application settings and static asset paths
│   │   ├── database.py          # SQLAlchemy connection & session maker
│   │   ├── models.py            # Tables: Users, Events, Bookings, Tickets, Notifications, Payments, Coupons, Reviews
│   │   ├── schemas.py           # Pydantic v2 request/response models
│   │   ├── security.py          # Bcrypt hashing and JWT generation
│   │   ├── dependencies.py      # OAuth2 authentication and require_roles RBAC guard
│   │   ├── seed.py              # Default accounts, coupons, reviews, and event seeder
│   │   ├── services_qr.py       # Cryptographic QR code pass generator
│   │   └── routers/
│   │       ├── auth.py          # Login, registration with roles, user profile
│   │       ├── events.py        # Public events list, search, filter, sort, and rating metrics
│   │       ├── bookings.py      # Ticket reservation, coupon application, payments & history
│   │       ├── payments.py      # Payment gateway simulation, transaction references
│   │       ├── coupons.py       # Promo coupon validation, listing & discount calculation
│   │       ├── reviews.py       # 1-5 star ratings, feedback submission & verified attendee checks
│   │       ├── tickets.py       # Digital pass verification and gate check-in
│   │       ├── notifications.py # Notification feed with type filtering & unread counter
│   │       ├── organizer.py     # Organizer event CRUD, attendee lists & sales analytics
│   │       └── admin.py         # Admin platform overview, trends, and oversight tables
│   ├── static/qr_codes/         # Generated QR code image passes
│   └── requirements.txt         # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios instance with auth interceptor & API methods
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User authentication, JWT storage, role state
│   │   │   └── NotificationContext.jsx # In-app notification polling & unread badge
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Sticky navbar with notification bell dropdown & roles
│   │   │   ├── EventCard.jsx           # Modern event card with rating stars & hover effects
│   │   │   ├── EventReviews.jsx        # Star rating widget & verified attendee reviews
│   │   │   ├── TicketCard.jsx          # Digital ticket pass with QR code and download button
│   │   │   └── ProtectedRoute.jsx      # Role-based route guard
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Hero discovery section, trending events & advanced filters
│   │   │   ├── EventDetailPage.jsx     # Event info, ratings, and checkout redirection
│   │   │   ├── PaymentCheckoutPage.jsx # Secure checkout, coupon discount breakdown & payment methods
│   │   │   ├── PaymentConfirmationPage.jsx # Transaction receipt & digital QR entry passes
│   │   │   ├── BookingHistoryPage.jsx  # Past bookings and digital entry passes
│   │   │   ├── NotificationsPage.jsx   # Dedicated notification center with type filters
│   │   │   ├── LoginPage.jsx           # User / Organizer / Admin sign in
│   │   │   ├── RegisterPage.jsx        # Account registration with role selection
│   │   │   ├── organizer/
│   │   │   │   ├── ManageEventsPage.jsx     # Organizer dashboard and event list
│   │   │   │   ├── CreateEventPage.jsx      # Event creation form
│   │   │   │   ├── EditEventPage.jsx        # Event details and status editor
│   │   │   │   ├── EventBookingsPage.jsx    # Event attendee transaction list
│   │   │   │   └── OrganizerAnalyticsPage.jsx # Revenue and sales statistics
│   │   │   └── admin/
│   │   │       └── AdminDashboardPage.jsx   # Admin platform KPIs, trends, and tables
│   │   ├── index.css                   # Clean application styling & interactive card transitions
│   │   └── App.jsx                     # Complete application routing hierarchy
│   └── package.json
└── README.md
```

---

## How to Run the Application

### 1. Run the Backend (FastAPI)
```powershell
cd backend
..\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```
- API Base URL: `http://127.0.0.1:8001`
- Interactive Swagger API Documentation: `http://127.0.0.1:8001/docs`

### 2. Run the Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
*(If PowerShell execution policy restricts scripts, run `npm.cmd run dev`)*
- Web Application: `http://127.0.0.1:5173`
