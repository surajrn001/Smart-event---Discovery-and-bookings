import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { eventsApi, bookingsApi, couponsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  CreditCard,
  Smartphone,
  Building,
  Tag,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Calendar,
  MapPin,
  Lock,
  Loader2
} from 'lucide-react';

export const PaymentCheckoutPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Ticket Quantity
  const initialQty = location.state?.quantity || 1;
  const [quantity, setQuantity] = useState(initialQty);

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING
  const [simulateStatus, setSimulateStatus] = useState('SUCCESS'); // SUCCESS, FAILED
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('789');

  // Load event details & available promo codes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [eventRes, couponsRes] = await Promise.all([
          eventsApi.getEventDetail(id),
          couponsApi.getActiveCoupons().catch(() => ({ data: [] }))
        ]);
        setEvent(eventRes.data);
        setActiveCoupons(couponsRes.data || []);
      } catch (err) {
        setError('Failed to load event details for checkout.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Calculations
  const baseSubtotal = event ? Math.round(event.ticket_price * quantity * 100) / 100 : 0;
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type.toUpperCase() === 'PERCENTAGE') {
      discountAmount = Math.round(((appliedCoupon.discount_value / 100) * baseSubtotal) * 100) / 100;
    } else {
      discountAmount = Math.min(appliedCoupon.discount_value, baseSubtotal);
    }
  }
  const finalPayable = Math.max(0, Math.round((baseSubtotal - discountAmount) * 100) / 100);

  // Handle Apply Coupon
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }
    try {
      setValidatingCoupon(true);
      setCouponError('');
      setCouponSuccess('');
      const res = await couponsApi.validateCoupon(code, baseSubtotal);
      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponCode(res.data.coupon_code);
        setCouponSuccess(res.data.message || `Coupon '${code}' applied!`);
      }
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.detail || 'Invalid coupon code or minimum amount not met.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  // Submit Booking & Process Payment
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: `/checkout/${id}` } });
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        event_id: parseInt(id),
        ticket_quantity: quantity,
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
        payment_method: paymentMethod,
        simulate_status: simulateStatus
      };

      const res = await bookingsApi.createBooking(payload);
      fetchNotifications(); // Refresh in-app notifications

      if (simulateStatus === 'SUCCESS') {
        navigate(`/payment-confirmation/${res.data.id}`, {
          state: { booking: res.data, event }
        });
      } else {
        setError(`Payment simulation failed! Transaction was declined. You can switch to 'Simulate Success' and retry.`);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Payment could not be completed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#6b7280' }}>Loading payment checkout...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p style={{ color: '#dc2626' }}>{error || 'Event not found.'}</p>
        <Link to="/" className="btn-secondary" style={{ marginTop: '16px' }}>Back to Home</Link>
      </div>
    );
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="container" style={{ padding: '24px 16px 80px 16px', maxWidth: '1000px' }}>
      <Link
        to={`/events/${id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '14px', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> Back to Event Details
      </Link>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', color: '#111827', marginBottom: '4px' }}>
          Secure Ticket Checkout
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Review your booking summary, apply discount coupons, and complete payment.
        </p>
      </div>

      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #f87171',
          color: '#b91c1c',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Left Column: Payment Methods & Details */}
        <div>
          {/* Payment Method Selector Card */}
          <div className="simple-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#2563eb" /> Select Payment Method
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: paymentMethod === 'UPI' ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: paymentMethod === 'UPI' ? '#eff6ff' : '#ffffff',
                  color: paymentMethod === 'UPI' ? '#1d4ed8' : '#374151',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Smartphone size={20} />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: paymentMethod === 'CARD' ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: paymentMethod === 'CARD' ? '#eff6ff' : '#ffffff',
                  color: paymentMethod === 'CARD' ? '#1d4ed8' : '#374151',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={20} />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NETBANKING')}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: paymentMethod === 'NETBANKING' ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: paymentMethod === 'NETBANKING' ? '#eff6ff' : '#ffffff',
                  color: paymentMethod === 'NETBANKING' ? '#1d4ed8' : '#374151',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Building size={20} />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Input Forms according to method */}
            {paymentMethod === 'UPI' && (
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Enter Virtual Payment Address (UPI ID)
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or username@okhdfcbank"
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  {['@okaxis', '@okhdfcbank', '@paytm', '@ybl'].map((handle) => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => setUpiId(`user${handle}`)}
                      style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        background: '#ffffff',
                        cursor: 'pointer',
                        color: '#4b5563'
                      }}
                    >
                      {handle}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                    Card Number
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                      CVV
                    </label>
                    <input
                      type="password"
                      className="input-field"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                  Select Bank
                </label>
                <select className="input-field" defaultValue="HDFC Bank">
                  <option>HDFC Bank</option>
                  <option>State Bank of India (SBI)</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Test Simulation Controls */}
            <div style={{ marginTop: '20px', padding: '12px 14px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>
                Payment Gateway Sandbox / Simulation:
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#78350f' }}>
                  <input
                    type="radio"
                    name="simStatus"
                    checked={simulateStatus === 'SUCCESS'}
                    onChange={() => setSimulateStatus('SUCCESS')}
                  />
                  <span>Simulate Payment Success</span>
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: '#78350f' }}>
                  <input
                    type="radio"
                    name="simStatus"
                    checked={simulateStatus === 'FAILED'}
                    onChange={() => setSimulateStatus('FAILED')}
                  />
                  <span>Simulate Payment Failure</span>
                </label>
              </div>
            </div>
          </div>

          {/* Promotional Coupons Card */}
          <div className="simple-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', color: '#111827', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="#16a34a" /> Promo Codes & Discounts
            </h3>

            {/* Coupon input form */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Enter coupon code (e.g. SMART50)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                disabled={appliedCoupon !== null}
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="btn-secondary"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  className="btn-primary"
                  disabled={validatingCoupon || !couponCode.trim()}
                >
                  {validatingCoupon ? <Loader2 size={16} className="animate-spin" /> : 'Apply'}
                </button>
              )}
            </div>

            {couponSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '13px', marginBottom: '10px' }}>
                <CheckCircle size={15} /> {couponSuccess}
              </div>
            )}
            {couponError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '13px', marginBottom: '10px' }}>
                <AlertCircle size={15} /> {couponError}
              </div>
            )}

            {/* Quick Coupon Chips */}
            {activeCoupons.length > 0 && !appliedCoupon && (
              <div style={{ marginTop: '14px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  Available Offers (Click to apply):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {activeCoupons.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleApplyCoupon(c.coupon_code)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px dashed #2563eb',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {c.coupon_code} ({c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div>
          <div className="simple-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '16px' }}>
              Order Summary
            </h3>

            {/* Event mini card */}
            <div style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
              <img
                src={event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'}
                alt={event.title}
                style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: '15px', color: '#111827', margin: '0 0 4px 0' }}>{event.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>
                  <Calendar size={13} /> {formattedDate}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                  <MapPin size={13} /> {event.location}
                </div>
              </div>
            </div>

            {/* Ticket Quantity Adjuster */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '14px', color: '#374151' }}>Number of Tickets:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  -
                </button>
                <span style={{ fontWeight: '600', minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(10, Math.min(event.available_seats, quantity + 1)))}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    background: '#f9fafb',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Calculations */}
            <div style={{ fontSize: '14px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Price per ticket</span>
                <span>₹{event.ticket_price.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({quantity} {quantity === 1 ? 'ticket' : 'tickets'})</span>
                <span>₹{baseSubtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: '500' }}>
                  <span>Discount ({appliedCoupon.coupon_code})</span>
                  <span>- ₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Final Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Total Payable</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
                ₹{finalPayable.toFixed(2)}
              </span>
            </div>

            {/* Submit Checkout Button */}
            <button
              id="pay-and-confirm-btn"
              type="button"
              onClick={handleCheckoutSubmit}
              disabled={submitting || event.available_seats < quantity}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Processing Payment...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} /> Pay ₹{finalPayable.toFixed(2)} & Get Passes
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px', color: '#9ca3af', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Lock size={12} /> 256-bit SSL encrypted & secure transaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
