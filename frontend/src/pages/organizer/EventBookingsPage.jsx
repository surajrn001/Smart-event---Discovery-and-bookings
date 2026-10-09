import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { organizerApi } from '../../api/client';
import { ArrowLeft, Ticket, Calendar, User, Mail } from 'lucide-react';

export const EventBookingsPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evtRes, bookRes] = await Promise.all([
          organizerApi.getEventDetail(id),
          organizerApi.getEventBookings(id),
        ]);
        setEvent(evtRes.data);
        setBookings(bookRes.data);
      } catch (err) {
        console.error('Failed to load event bookings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p>Loading attendee bookings...</p>
      </div>
    );
  }

  const totalTicketsSold = bookings.reduce((sum, b) => sum + b.ticket_quantity, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px' }}>
      <Link to="/organizer/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '13px', marginBottom: '16px' }}>
        <ArrowLeft size={15} /> Back to organizer events
      </Link>

      <div className="simple-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', color: '#111827', marginBottom: '6px' }}>
          Attendee Bookings: {event?.title}
        </h1>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
          {event?.location} • {new Date(event?.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Total Bookings</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{bookings.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Tickets Sold</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#0369a1' }}>{totalTicketsSold}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Gross Revenue</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>₹{totalRevenue.toFixed(2)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Seats Remaining</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#b45309' }}>{event?.available_seats}</div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '16px', color: '#111827', marginBottom: '14px' }}>
        Booking Transactions ({bookings.length})
      </h2>

      {bookings.length === 0 ? (
        <div className="simple-card" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
          No tickets have been booked for this event yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Booking ID</th>
                <th style={{ padding: '10px 14px' }}>User ID</th>
                <th style={{ padding: '10px 14px' }}>Quantity</th>
                <th style={{ padding: '10px 14px' }}>Total Paid</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>#{b.id}</td>
                  <td style={{ padding: '10px 14px' }}>User #{b.user_id}</td>
                  <td style={{ padding: '10px 14px' }}>{b.ticket_quantity} ticket(s)</td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>₹{b.total_price}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: b.booking_status === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                      color: b.booking_status === 'CANCELLED' ? '#dc2626' : '#15803d',
                    }}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
