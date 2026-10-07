import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { TicketCard } from '../components/TicketCard';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ConfirmationPage = () => {
  const location = useLocation();
  const booking = location.state?.booking;
  const event = location.state?.event || booking?.event;

  if (!booking) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <h2>No Active Booking Found</h2>
        <p style={{ color: '#6b7280', margin: '12px 0 20px 0' }}>Please select an event to book tickets.</p>
        <Link to="/" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px' }}>
      {/* Confirmation header */}
      <div className="simple-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px' }}>
        <CheckCircle2 size={40} color="#16a34a" style={{ marginBottom: '8px' }} />
        <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '6px' }}>
          Booking Confirmed!
        </h1>
        <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
          Your tickets have been reserved successfully. Show this QR code at the event entrance.
        </p>

        {/* Summary Details in Rupees */}
        <div style={{
          display: 'inline-flex',
          gap: '20px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          padding: '10px 16px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <div><strong>Booking ID:</strong> #{booking.id}</div>
          <div><strong>Quantity:</strong> {booking.ticket_quantity}</div>
          <div><strong>Total Paid:</strong> ₹{booking.total_price}</div>
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '16px' }}>
          Your Tickets ({booking.tickets?.length || 0})
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {booking.tickets?.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              event={event}
              booking={booking}
            />
          ))}
        </div>
      </div>

      {/* Action links */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link to="/history" className="btn-secondary">
          View All My Bookings
        </Link>
        <Link to="/" className="btn-primary">
          Back to Home <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
