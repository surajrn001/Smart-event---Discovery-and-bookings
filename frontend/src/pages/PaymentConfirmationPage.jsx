import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { bookingsApi, paymentsApi } from '../api/client';
import { TicketCard } from '../components/TicketCard';
import {
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Ticket,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Home
} from 'lucide-react';

export const PaymentConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState('');

  useEffect(() => {
    // If booking was not passed in state, fetch by ID
    if (!booking && id) {
      const fetchBooking = async () => {
        try {
          setLoading(true);
          const res = await bookingsApi.getBookingDetail(id);
          setBooking(res.data);
        } catch (err) {
          setError('Could not retrieve booking confirmation details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading payment confirmation...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error || 'Booking not found.'}</p>
        <Link to="/" className="btn-secondary">Back to Events</Link>
      </div>
    );
  }

  const isSuccess = booking.booking_status === 'CONFIRMED';
  const payment = booking.payment;
  const event = booking.event || location.state?.event;

  const eventDateStr = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  return (
    <div className="container" style={{ padding: '30px 16px 80px 16px', maxWidth: '850px' }}>
      {/* Status Banner */}
      <div
        className="simple-card"
        style={{
          padding: '32px 20px',
          textAlign: 'center',
          marginBottom: '24px',
          borderTop: isSuccess ? '5px solid #16a34a' : '5px solid #dc2626'
        }}
      >
        {isSuccess ? (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dcfce7',
              color: '#16a34a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle size={36} />
            </div>
            <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '8px' }}>
              Payment Successful & Booking Confirmed!
            </h1>
            <p style={{ color: '#4b5563', fontSize: '15px', maxWidth: '540px', margin: '0 auto 20px auto' }}>
              Your ticket order #{booking.id} has been processed successfully. Digital QR passes have been issued below.
            </p>

            {/* Transaction badges */}
            <div style={{
              display: 'inline-flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
              background: '#f9fafb',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              fontSize: '13px',
              color: '#374151'
            }}>
              <div>
                <strong>Amount Paid: </strong>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>
                  ₹{(booking.final_amount ?? booking.total_price).toFixed(2)}
                </span>
              </div>
              {payment?.payment_method && (
                <div>
                  <strong>Method: </strong>
                  <span>{payment.payment_method}</span>
                </div>
              )}
              {payment?.transaction_id && (
                <div>
                  <strong>Transaction ID: </strong>
                  <code style={{ background: '#e5e7eb', padding: '2px 6px', borderRadius: '4px' }}>
                    {payment.transaction_id}
                  </code>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <XCircle size={36} />
            </div>
            <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '8px' }}>
              Payment Failed
            </h1>
            <p style={{ color: '#4b5563', fontSize: '15px', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              Your transaction was declined or simulated as failed. No amount was deducted and your tickets have not been confirmed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {event && (
                <Link to={`/checkout/${event.id}`} className="btn-primary">
                  <RefreshCw size={16} /> Retry Checkout
                </Link>
              )}
              <Link to="/" className="btn-secondary">
                <Home size={16} /> Back to Events
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* When successful, show Event Details & Tickets */}
      {isSuccess && (
        <>
          {event && (
            <div className="simple-card" style={{ padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', color: '#111827', marginBottom: '12px' }}>
                Event Details
              </h3>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={event.banner_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=400&q=80'}
                  alt={event.title}
                  style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '17px', color: '#111827', margin: '0 0 6px 0' }}>{event.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                    <Calendar size={14} color="#2563eb" /> {eventDateStr}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#4b5563' }}>
                    <MapPin size={14} color="#2563eb" /> {event.location}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tickets Section */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ticket size={18} color="#2563eb" /> Your Digital QR Passes ({booking.tickets?.length || 0})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {booking.tickets && booking.tickets.map((t, index) => (
                <TicketCard key={t.id || index} ticket={t} eventTitle={event?.title || 'SmartEvent Ticket'} />
              ))}
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/history" className="btn-secondary">
              View All Bookings & Passes
            </Link>
            <Link to="/" className="btn-primary">
              Discover More Events <ArrowRight size={16} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
};
