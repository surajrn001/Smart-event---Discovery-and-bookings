import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { EventReviews } from '../components/EventReviews';
import {
  Calendar,
  MapPin,
  Users,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Star,
  CheckCircle,
  CreditCard
} from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  // Fetch event details
  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await eventsApi.getEventDetail(id);
      setEvent(res.data);
    } catch (err) {
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: `/checkout/${id}` } });
      return;
    }
    navigate(`/checkout/${id}`, { state: { quantity } });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>{error || 'Event not found.'}</p>
        <Link to="/" className="btn-secondary" style={{ marginTop: '16px' }}>Back to all events</Link>
      </div>
    );
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const totalPrice = Math.round(event.ticket_price * quantity * 100) / 100;
  const isSoldOut = event.available_seats <= 0;

  return (
    <div className="container" style={{ padding: '24px 16px 80px 16px' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '14px', marginBottom: '16px' }}>
        <ArrowLeft size={16} /> Back to all events
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Event banner, info and reviews */}
        <div style={{ flex: '2' }}>
          <div className="simple-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
            <img
              src={event.banner_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80'}
              alt={event.title}
              style={{ width: '100%', height: '280px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <span className={`badge badge-${event.category.toLowerCase()}`}>
                  {event.category}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', color: '#92400e', fontWeight: '600' }}>
                  <Star size={13} fill="#f59e0b" color="#f59e0b" />
                  <span>{event.average_rating > 0 ? event.average_rating.toFixed(1) : 'New'}</span>
                  {event.total_reviews > 0 && <span style={{ color: '#b45309' }}>({event.total_reviews})</span>}
                </div>
              </div>

              <h1 style={{ fontSize: '26px', color: '#111827', margin: '8px 0 12px 0' }}>
                {event.title}
              </h1>

              <p style={{ color: '#4b5563', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>

              <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="#2563eb" />
                  <span><strong>Date & Time:</strong> {formattedDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} color="#2563eb" />
                  <span><strong>Venue Location:</strong> {event.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="#2563eb" />
                  <span><strong>Seat Availability:</strong> {event.available_seats} out of {event.total_seats} tickets remaining</span>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Ratings & Reviews Component */}
          <EventReviews eventId={event.id} />
        </div>

        {/* Right Column: Ticket Booking Box */}
        <div style={{ flex: '1' }}>
          <div className="simple-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '16px' }}>
              Select & Book Tickets
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>Price per Ticket</div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#111827' }}>
                ₹{event.ticket_price.toFixed(2)}
              </div>
            </div>

            {/* Quantity Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
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
              <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Maximum 10 tickets per booking.
              </small>
            </div>

            {/* Price breakdown */}
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                <span>{quantity} × Ticket</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a' }}>
                <span>Booking Fee</span>
                <span>FREE</span>
              </div>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total Amount:</span>
                <span id="booking-total-price" style={{ color: '#2563eb' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="book-tickets-action-btn"
              onClick={handleProceedToCheckout}
              disabled={isSoldOut}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {isSoldOut ? 'Sold Out' : (
                <>
                  <CreditCard size={18} /> Proceed to Checkout
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
              <ShieldCheck size={14} color="#16a34a" /> Instant Digital Pass with QR Code
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
