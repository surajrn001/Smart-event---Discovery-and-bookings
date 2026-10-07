import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi, bookingsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Calendar, MapPin, Users, ArrowLeft, Plus, Minus } from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch event details
  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const res = await eventsApi.getEventDetail(id);
        setEvent(res.data);
      } catch (err) {
        setError('Could not load event details.');
      } finally {
        setLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  // Handle booking action
  const handleBooking = async () => {
    if (!isAuthenticated) {
      alert('Please log in first to book tickets.');
      navigate('/login');
      return;
    }

    setError('');
    setBookingLoading(true);

    try {
      const res = await bookingsApi.createBooking({
        event_id: Number(id),
        ticket_quantity: quantity,
      });

      // Update notifications badge
      fetchNotifications();

      // Go to confirmation screen
      navigate('/confirmation', { state: { booking: res.data, event } });
    } catch (err) {
      const message = err.response?.data?.detail || 'Booking failed. Please try again.';
      setError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p>Loading event...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '40px 16px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>{error || 'Event not found.'}</p>
        <Link to="/" className="btn-secondary" style={{ marginTop: '16px' }}>Back to home</Link>
      </div>
    );
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalPrice = event.ticket_price * quantity;
  const isSoldOut = event.available_seats <= 0;

  return (
    <div className="container" style={{ padding: '24px 16px 60px 16px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to all events
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Left: Event info */}
        <div>
          <div className="simple-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
            <img
              src={event.banner_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              style={{ width: '100%', height: '260px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div style={{ padding: '20px' }}>
              <span className="badge badge-tech" style={{ marginBottom: '8px' }}>
                {event.category}
              </span>
              <h1 style={{ fontSize: '24px', color: '#111827', margin: '8px 0 12px 0' }}>
                {event.title}
              </h1>
              <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>

              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="#2563eb" />
                  <span><strong>Date:</strong> {formattedDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#2563eb" />
                  <span><strong>Venue:</strong> {event.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="#2563eb" />
                  <span><strong>Availability:</strong> {event.available_seats} out of {event.total_seats} tickets remaining</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Box */}
        <div>
          <div className="simple-card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '16px' }}>
              Book Tickets
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Price per Ticket</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
                ₹{event.ticket_price}
              </div>
            </div>

            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Select Quantity:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  id="btn-decrease-qty"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  className="btn-secondary"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  <Minus size={16} />
                </button>
                <span id="ticket-quantity-display" style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '24px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  id="btn-increase-qty"
                  onClick={() => setQuantity((q) => Math.min(Math.min(10, event.available_seats), q + 1))}
                  disabled={quantity >= Math.min(10, event.available_seats) || isSoldOut}
                  className="btn-secondary"
                  style={{ width: '36px', height: '36px', padding: 0 }}
                >
                  <Plus size={16} />
                </button>
              </div>
              <small style={{ color: '#6b7280', fontSize: '12px' }}>Maximum 10 tickets per booking.</small>
            </div>

            {/* Price breakdown */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                <span>{quantity} × Ticket</span>
                <span>₹{totalPrice}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a' }}>
                <span>Booking Fee</span>
                <span>FREE</span>
              </div>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total Amount:</span>
                <span id="booking-total-price">₹{totalPrice}</span>
              </div>
            </div>

            <button
              id="book-tickets-action-btn"
              onClick={handleBooking}
              disabled={bookingLoading || isSoldOut}
              className="btn-primary"
              style={{ width: '100%', padding: '10px' }}
            >
              {isSoldOut ? 'Sold Out' : bookingLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
