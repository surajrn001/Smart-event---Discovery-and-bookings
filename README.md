# SmartEvent – Event Discovery & Ticket Booking System

A full-stack web application where users can discover events across different categories, book tickets in Indian Rupees (₹), and view digital tickets with QR codes.

Built using **FastAPI (Python)** for the backend and **React (Vite)** for the frontend.

---

## Features

- **User Authentication**: Register, login, and secure sessions using JWT tokens and bcrypt password hashing.
- **Event Discovery**: Browse upcoming events with categories (Tech, Music, Sports, Business) and search by keywords.
- **Ticket Booking**: Select ticket quantity, check remaining seat availability, and book tickets with live price calculation in Rupees (₹).
- **QR Code Digital Tickets**: Each booking generates a unique ticket ID and downloadable QR code pass.
- **My Bookings History**: View past reservations and entry passes anytime.
- **Notification Center**: In-app notifications when bookings are confirmed, with unread badge counter and mark-as-read option.

---

## Tech Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy, SQLite, Pydantic, python-jose (JWT), bcrypt, qrcode & Pillow.
- **Frontend**: React 19, Vite, React Router, Axios, Lucide React icons.
- **Database**: SQLite (`smartevent.db`).

---

## Project Structure

```
SmartEvent/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app and route configuration
│   │   ├── config.py            # App settings and paths
│   │   ├── database.py          # SQLAlchemy connection & session
│   │   ├── models.py            # Database tables (User, Event, Booking, Ticket, Notification)
│   │   ├── schemas.py           # Request & response data models
│   │   ├── security.py          # Password hashing and JWT generation
│   │   ├── dependencies.py      # Auth dependency for protected routes
│   │   ├── seed.py              # Sample events data
│   │   ├── services_qr.py       # QR code image generator
│   │   └── routers/
│   │       ├── auth.py          # User register, login & profile
│   │       ├── events.py        # Event list, search, filter & details
│   │       ├── bookings.py      # Ticket booking creation & history
│   │       ├── tickets.py       # Ticket verification
│   │       └── notifications.py # User notifications
│   ├── static/qr_codes/         # Generated QR code image files
│   └── requirements.txt         # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios instance with auth interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User login/logout state
│   │   │   └── NotificationContext.jsx # Notification state & badge
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Header with navigation & alerts
│   │   │   ├── EventCard.jsx           # Event card preview
│   │   │   ├── TicketCard.jsx          # Ticket pass with QR code
│   │   │   └── ProtectedRoute.jsx      # Route guard for login
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Event listing and search
│   │   │   ├── EventDetailPage.jsx     # Event info and ticket quantity picker
│   │   │   ├── ConfirmationPage.jsx    # Booking success & QR ticket
│   │   │   ├── BookingHistoryPage.jsx  # Past bookings and passes
│   │   │   ├── NotificationsPage.jsx   # All notifications list
│   │   │   ├── LoginPage.jsx           # Sign in page
│   │   │   └── RegisterPage.jsx        # Sign up page
│   │   ├── index.css                   # Stylesheet
│   │   └── App.jsx                     # Route setup
│   └── package.json
└── README.md
```

---

## How to Run

### 1. Run the Backend (FastAPI)

Open a terminal:
```powershell
cd backend
..\venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API is running at: `http://127.0.0.1:8000`
- Swagger API Docs: `http://127.0.0.1:8000/docs`

### 2. Run the Frontend (React)

Open a second terminal:
```powershell
cd frontend
npm run dev
```
*(If PowerShell blocks `npm`, run `npm.cmd run dev`)*

- Frontend is running at: `http://127.0.0.1:5173`
