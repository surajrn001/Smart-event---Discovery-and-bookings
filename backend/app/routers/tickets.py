from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import User, Ticket, Booking
from app.schemas import TicketResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.get("", response_model=List[TicketResponse])
def get_user_tickets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tickets = (
        db.query(Ticket)
        .join(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Ticket.created_at.desc())
        .all()
    )
    return tickets

@router.get("/verify/{ticket_code}")
def verify_ticket(ticket_code: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or unrecognized ticket code."
        )

    booking = ticket.booking
    event = booking.event
    user = booking.user

    return {
        "status": "VALID" if not ticket.is_used else "ALREADY_USED",
        "ticket_code": ticket.ticket_code,
        "is_used": ticket.is_used,
        "event": {
            "id": event.id,
            "title": event.title,
            "category": event.category,
            "location": event.location,
            "event_date": event.event_date.isoformat(),
        },
        "attendee": {
            "username": user.username,
            "email": user.email
        },
        "booking_id": booking.id
    }

@router.post("/verify/{ticket_code}/check-in")
def check_in_ticket(ticket_code: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.ticket_code == ticket_code).first()
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found."
        )
    if ticket.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket has already been scanned and used."
        )

    ticket.is_used = True
    db.commit()
    return {"message": "Ticket successfully verified & checked in!", "ticket_code": ticket_code}
