# SmartEvent – Event Discovery, Ticket Booking & Management Platform

A complete full-stack web application built using **FastAPI** (Python 3.13) and **React** (Vite) for discovering events, reserving digital tickets with QR passes, managing organizer events, and monitoring platform analytics.

---

## Core Features

- **Event Discovery & Filtering**: Browse live events by categories (Tech, Music, Sports, Business) or search by keyword and location.
- **Ticket Booking & QR Passes**: Book multiple tickets with real-time seat inventory deduction and instant digital QR entry passes.
- **Role-Based Access Control (RBAC)**: Support for three distinct user roles:
  - `USER`: Browse events, book tickets, view passes, and receive update notifications.
  - `ORGANIZER`: Publish events, edit details, cancel events, view attendee lists, and analyze revenue in ₹.
  - `ADMIN`: Platform-wide oversight, system KPIs, 14-day sales trends, and user/event/booking tables.
- **Organizer Hub**: Dedicated dashboard for organizers to track sales statistics and manage their published events.
- **Admin Dashboard**: Comprehensive platform metrics, popular event rankings, and administrative controls.
- **In-App Notifications**: Real-time notifications for booking confirmations and event updates.

---

## Default Accounts for Testing

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartevent.com` | `adminpassword123` | Full Admin Portal, Platform Analytics, Users/Events/Bookings Oversight |
| **Organizer** | `organizer@smartevent.com` | `organizerpass123` | Organizer Hub, Create Events, Sales Analytics, Manage Attendees |
| **User** | `rahul@example.com` | `password123` | Explore events, book tickets, view passes |

*(You can also register new accounts as either **User** or **Organizer** directly from the Register page).*

---

## Tech Stack

- **Backend**: Python 3.13, FastAPI, SQLAlchemy, SQLite, Pydantic v2, python-jose (JWT), bcrypt, qrcode & Pillow.
- **Frontend**: React 19, Vite, React Router v7, Axios, Lucide React icons.
- **Database**: SQLite (`smartevent.db`).

---

## Project Structure

```
SmartEvent/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app instance and router configuration
│   │   ├── config.py            # Application settings and static asset paths
│   │   ├── database.py          # SQLAlchemy connection & session maker
│   │   ├── models.py            # Tables: Users (with role), Events (with organizer_id & status), Bookings, Tickets, Notifications
│   │   ├── schemas.py           # Pydantic v2 request/response and analytics models
│   │   ├── security.py          # Bcrypt hashing and JWT generation
│   │   ├── dependencies.py      # OAuth2 authentication and require_roles RBAC guard
│   │   ├── seed.py              # Default accounts and sample event seeder
│   │   ├── services_qr.py       # Cryptographic QR code pass generator
│   │   └── routers/
│   │       ├── auth.py          # Login, registration with roles, user profile
│   │       ├── events.py        # Public events list, search, filter, and lifecycle updater
│   │       ├── bookings.py      # Ticket reservation, seat deduction & booking history
│   │       ├── tickets.py       # Digital pass verification and gate check-in
│   │       ├── notifications.py # Notification feed & unread counter
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
│   │   │   ├── Navbar.jsx              # Role-aware navigation (Organizer Hub, Admin Portal)
│   │   │   ├── EventCard.jsx           # Event card with category badges and seat counts
│   │   │   ├── TicketCard.jsx          # Digital ticket pass with QR code and download button
│   │   │   └── ProtectedRoute.jsx      # Role-based route guard
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Event discovery and category filtering
│   │   │   ├── EventDetailPage.jsx     # Event info, ticket quantity picker, and booking
│   │   │   ├── ConfirmationPage.jsx    # Booking success summary and QR passes
│   │   │   ├── BookingHistoryPage.jsx  # Past bookings and digital entry passes
│   │   │   ├── NotificationsPage.jsx   # Dedicated notifications center
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
│   │   ├── index.css                   # Clean, student-friendly CSS styling
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
