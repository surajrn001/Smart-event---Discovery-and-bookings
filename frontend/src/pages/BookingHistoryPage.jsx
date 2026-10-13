import React, { useState, useEffect } from 'react';
import { bookingsApi } from '../api/client';
import { TicketCard } from '../components/TicketCard';
import { Calendar, Ticket, MapPin, Tag, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await bookingsApi.getUserBookings();
      setBookings(res.data);
      if (res.data.length > 0) {
        setSelectedBooking(res.data[0]);
      }
    } catch (err) {
      console.log('Error loading bookings:', err);
      setError(err.response?.data?.detail || 'Failed to load bookings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#6B7280' }}>Loading your booking history & digital passes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="bms-card" style={{ padding: '40px 24px', maxWidth: '520px', margin: '0 auto' }}>
          <p style={{ color: '#EF4444', fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>{error}</p>
          <button onClick={fetchBookings} className="btn-primary" style={{ padding: '10px 24px' }}>
            Retry Loading Bookings
          </button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div className="bms-card" style={{ padding: '60px 24px', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#FFF0F2',
            color: '#F84464',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <Ticket size={32} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            No Bookings Yet
          </h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
            Explore trending concerts, tech conferences, and sports matches happening in your city!
          </p>
          <Link to="/" className="btn-primary" style={{ padding: '12px 28px' }}>
            Explore Events Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#F5F6F8', minHeight: '100vh', padding: '36px 0 80px 0' }}>
      <div className="container">
        
        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={24} color="#F84464" /> My Bookings & Digital Passes
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '2px' }}>
            View your confirmed reservations, download digital QR entry tickets, and inspect transaction summaries.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px' }}>
          
          {/* Left Column: Bookings list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {bookings.map((b) => {
              const isSelected = selectedBooking?.id === b.id;
              const eventDate = b.event?.event_date
                ? new Date(b.event.event_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Upcoming';

              const payable = (b.final_amount && b.final_amount > 0) ? b.final_amount : b.total_price;

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="bms-card"
                  style={{
                    padding: '18px 20px',
                    cursor: 'pointer',
                    borderColor: isSelected ? '#F84464' : '#E5E7EB',
                    background: isSelected ? '#FFFBFB' : '#ffffff',
                    boxShadow: isSelected ? '0 4px 16px rgba(248, 68, 100, 0.15)' : 'var(--shadow-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase' }}>
                        Booking #{b.id}
                      </span>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginTop: '2px' }}>
                        {b.event?.title || 'Event Booking'}
                      </h3>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: b.booking_status === 'CONFIRMED' ? '#D1FAE5' : '#FEE2E2',
                      color: b.booking_status === 'CONFIRMED' ? '#065F46' : '#991B1B'
                    }}>
                      {b.booking_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} color="#F84464" /> <span>{eventDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={13} color="#F84464" /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.event?.location}</span>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #F3F4F6',
                    paddingTop: '10px',
                    fontSize: '13px'
                  }}>
                    <span style={{ color: '#4B5563', fontWeight: '500' }}>
                      {b.ticket_quantity} {b.ticket_quantity === 1 ? 'Seat' : 'Seats'}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#111827' }}>
                        ₹{payable.toFixed(2)}
                      </span>
                      {b.discount_amount > 0 && (
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                          Saved ₹{b.discount_amount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Pass View */}
          <div>
            {selectedBooking && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '90px' }}>
                
                {/* Event header card */}
                <div className="bms-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#F84464', textTransform: 'uppercase' }}>
                      Selected Booking Details
                    </span>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      Booked on {new Date(selectedBooking.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>
                    {selectedBooking.event?.title}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '14px' }}>
                    {selectedBooking.event?.location}
                  </p>

                  {/* Pricing Breakdown */}
                  <div style={{ background: '#F9FAFB', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
                      <span>Base Ticket Amount:</span>
                      <span>₹{selectedBooking.total_price.toFixed(2)}</span>
                    </div>
                    {selectedBooking.discount_amount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '600' }}>
                        <span>Discount Applied:</span>
                        <span>- ₹{selectedBooking.discount_amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#111827' }}>
                      <span>Total Paid:</span>
                      <span style={{ color: '#F84464' }}>
                        ₹{((selectedBooking.final_amount && selectedBooking.final_amount > 0) ? selectedBooking.final_amount : selectedBooking.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Digital QR Entry Passes */}
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    Digital QR Entry Passes ({selectedBooking.tickets?.length || 0})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selectedBooking.tickets?.map((t) => (
                      <TicketCard
                        key={t.id}
                        ticket={t}
                        event={selectedBooking.event}
                        booking={selectedBooking}
                      />
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
