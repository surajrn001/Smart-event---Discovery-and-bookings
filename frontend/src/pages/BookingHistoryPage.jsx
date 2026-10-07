import React, { useState, useEffect } from 'react';
import { bookingsApi } from '../api/client';
import { TicketCard } from '../components/TicketCard';
import { Calendar, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await bookingsApi.getUserBookings();
        setBookings(res.data);
        if (res.data.length > 0) {
          setSelectedBooking(res.data[0]);
        }
      } catch (err) {
        console.log('Error loading bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p>Loading your booking history...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <div className="simple-card" style={{ padding: '40px 20px', maxWidth: '500px', margin: '0 auto' }}>
          <Ticket size={40} color="#2563eb" style={{ marginBottom: '12px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>No Bookings Yet</h2>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>
            You have not booked any event tickets yet.
          </p>
          <Link to="/" className="btn-primary">Browse Events</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px' }}>
      <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '6px' }}>
        My Bookings
      </h1>
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
        View and manage all your event passes and tickets.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left: Bookings list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
            const eventDate = b.event?.event_date
              ? new Date(b.event.event_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Upcoming';

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className="simple-card"
                style={{
                  padding: '16px',
                  cursor: 'pointer',
                  borderColor: isSelected ? '#2563eb' : '#e5e7eb',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                    {b.event?.title || 'Event Booking'}
                  </h3>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: '#dcfce7',
                    color: '#15803d',
                  }}>
                    {b.booking_status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {eventDate}
                  </div>
                  <div>
                    {b.ticket_quantity} ticket(s)
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '8px',
                }}>
                  <span style={{ color: '#6b7280' }}>Booking #{b.id}</span>
                  <strong style={{ color: '#111827' }}>₹{b.total_price}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Booking Tickets */}
        {selectedBooking && (
          <div className="simple-card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '8px' }}>
              {selectedBooking.event?.title}
            </h2>

            <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '16px' }}>
              Total Paid: <strong style={{ color: '#111827' }}>₹{selectedBooking.total_price}</strong> ({selectedBooking.ticket_quantity} tickets)
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              Digital Tickets:
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {selectedBooking.tickets?.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  event={selectedBooking.event}
                  booking={selectedBooking}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
