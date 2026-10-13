import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { bookingsApi, paymentsApi, couponsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Ticket, 
  Tag, 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  Loader2,
  Sparkles
} from 'lucide-react';

export const PaymentCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { fetchNotifications } = useNotifications();

  // Route state
  const event = location.state?.event;
  const quantity = location.state?.quantity || 1;

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [activeCoupons, setActiveCoupons] = useState([]);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, NETBANKING
  const [simulateStatus, setSimulateStatus] = useState('SUCCESS'); // SUCCESS or FAILED
  const [upiId, setUpiId] = useState('suraj@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('•••');

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  // Protect route
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
    if (!event) {
      navigate('/');
    }
  }, [isAuthenticated, event, navigate]);

  // Load available coupons
  useEffect(() => {
    couponsApi.getActiveCoupons()
      .then((res) => setActiveCoupons(res.data))
      .catch((err) => console.log('Coupons load note:', err));
  }, []);

  if (!event) return null;

  const basePrice = event.ticket_price * quantity;
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // Validate & apply coupon
  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError('');
      const res = await couponsApi.validateCoupon({
        coupon_code: code,
        booking_amount: basePrice,
      });

      setAppliedCoupon(res.data);
      setCouponCode(code);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err.response?.data?.detail || 'Invalid or expired coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Process payment transaction
  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setPaymentError('');

    try {
      // Step 1: Create Booking with applied coupon
      const bookingRes = await bookingsApi.createBooking({
        event_id: event.id,
        ticket_quantity: quantity,
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : null,
      });

      const newBooking = bookingRes.data;

      // Step 2: Process payment transaction
      const paymentRes = await paymentsApi.processPayment({
        booking_id: newBooking.id,
        payment_method: paymentMethod,
        simulate_status: simulateStatus,
        upi_id: paymentMethod === 'UPI' ? upiId : null,
        card_last4: paymentMethod === 'CARD' ? '8821' : null
      });

      // Update notifications in background
      fetchNotifications();

      // Save in sessionStorage so page reload on confirmation page doesn't lose the booking
      try {
        sessionStorage.setItem('last_payment_booking', JSON.stringify({
          booking: newBooking,
          payment: paymentRes.data,
          event: event,
          appliedCoupon: appliedCoupon
        }));
      } catch (e) {
        console.log('Session store note:', e);
      }

      // Step 3: Redirect to Payment Confirmation Page
      navigate('/payment-confirmation', {
        state: {
          booking: newBooking,
          payment: paymentRes.data,
          event: event,
          appliedCoupon: appliedCoupon
        }
      });

    } catch (err) {
      console.error('Payment checkout error:', err);
      const msg = err.response?.data?.detail || 'Payment processing failed. Please check details and try again.';
      setPaymentError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ background: '#F5F6F8', minHeight: '100vh', padding: '32px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        
        {/* Back Link */}
        <Link to={`/events/${event.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4B5563', fontSize: '13px', marginBottom: '20px' }}>
          <ArrowLeft size={16} /> Back to Event Details
        </Link>

        {/* Stepper Header */}
        <div className="checkout-stepper">
          <div className="checkout-step-item">
            <span className="checkout-step-num">1</span>
            <span>Select Tickets</span>
          </div>
          <span style={{ color: '#CBD5E1' }}>————</span>
          <div className="checkout-step-item active">
            <span className="checkout-step-num">2</span>
            <span>Checkout & Payment</span>
          </div>
          <span style={{ color: '#CBD5E1' }}>————</span>
          <div className="checkout-step-item">
            <span className="checkout-step-num">3</span>
            <span>Digital Passes</span>
          </div>
        </div>

        {paymentError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '14px 18px',
            color: '#B91C1C',
            fontSize: '14px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertCircle size={20} />
            <span>{paymentError}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          
          {/* Left: Payment Methods & Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Payment Method Selector */}
            <div className="bms-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={20} color="#F84464" />
                  Select Payment Method
                </h2>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> 256-Bit SSL Encrypted
                </span>
              </div>

              {/* Method Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                
                <div
                  className={`payment-method-card ${paymentMethod === 'UPI' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('UPI')}
                  style={{ textAlign: 'center' }}
                >
                  <Smartphone size={22} color={paymentMethod === 'UPI' ? '#F84464' : '#6B7280'} style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>UPI</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>GPay, PhonePe</div>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('CARD')}
                  style={{ textAlign: 'center' }}
                >
                  <CreditCard size={22} color={paymentMethod === 'CARD' ? '#F84464' : '#6B7280'} style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>Cards</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>Credit / Debit</div>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'NETBANKING' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('NETBANKING')}
                  style={{ textAlign: 'center' }}
                >
                  <Building2 size={22} color={paymentMethod === 'NETBANKING' ? '#F84464' : '#6B7280'} style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>NetBanking</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>All Banks</div>
                </div>

              </div>

              {/* Method Dynamic Input Fields */}
              {paymentMethod === 'UPI' && (
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Virtual Payment Address (UPI ID)
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. mobile@upi or username@okhdfcbank"
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <span key={app} style={{ fontSize: '11px', padding: '3px 8px', background: '#ffffff', border: '1px solid #D1D5DB', borderRadius: '4px', color: '#4B5563' }}>
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 0000"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Valid Thru
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NETBANKING' && (
                <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    Select Popular Bank
                  </label>
                  <select className="input-field" defaultValue="HDFC">
                    <option value="HDFC">HDFC Bank</option>
                    <option value="ICICI">ICICI Bank</option>
                    <option value="SBI">State Bank of India</option>
                    <option value="AXIS">Axis Bank</option>
                    <option value="KOTAK">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}

              {/* Payment Gateway Simulation Switch (For testing success / fail per requirements) */}
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                background: '#FEF3C7',
                border: '1px dashed #F59E0B',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400E' }}>
                    ⚙️ Payment Gateway Simulation Mode
                  </div>
                  <div style={{ fontSize: '11px', color: '#B45309' }}>
                    Simulate transaction outcome for testing.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSimulateStatus('SUCCESS')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: 'none',
                      background: simulateStatus === 'SUCCESS' ? '#10B981' : '#E5E7EB',
                      color: simulateStatus === 'SUCCESS' ? '#ffffff' : '#374151'
                    }}
                  >
                    Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulateStatus('FAILED')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: 'none',
                      background: simulateStatus === 'FAILED' ? '#EF4444' : '#E5E7EB',
                      color: simulateStatus === 'FAILED' ? '#ffffff' : '#374151'
                    }}
                  >
                    Simulate Failure
                  </button>
                </div>
              </div>

            </div>

            {/* Security Guarantee Banner */}
            <div style={{
              background: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Lock size={20} color="#F84464" />
              <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: '1.4' }}>
                Safe and secure payments. 100% money back guarantee if the event is cancelled by the organizer.
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary & Coupon Code */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Event Summary Card */}
            <div className="bms-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '14px', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
                Booking Summary
              </h3>

              <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                <img
                  src={event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=400&q=80'}
                  alt={event.title}
                  style={{ width: '70px', height: '70px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    {event.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} color="#9CA3AF" /> {event.location}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Calendar size={12} color="#9CA3AF" /> {new Date(event.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>

              {/* Tickets badge */}
              <div style={{
                background: '#F9FAFB',
                padding: '10px 14px',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                <span>General Admission</span>
                <span>{quantity} {quantity === 1 ? 'Ticket' : 'Tickets'}</span>
              </div>

              {/* Coupons & Promotional Code Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                  Apply Coupon or Discount Code
                </label>

                {appliedCoupon ? (
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} color="#059669" />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#065F46' }}>
                          {appliedCoupon.coupon_code}
                        </span>
                        <div style={{ fontSize: '11px', color: '#047857' }}>
                          Saved ₹{appliedCoupon.discount_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#DC2626',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Enter code (e.g. BMS50)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={couponLoading || !couponCode.trim()}
                        className="btn-primary"
                        style={{ padding: '0 18px', fontSize: '13px' }}
                      >
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>

                    {couponError && (
                      <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '6px', fontWeight: '500' }}>
                        {couponError}
                      </p>
                    )}

                    {/* Quick apply coupon recommendations */}
                    {activeCoupons.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '600' }}>Popular promos:</span>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {activeCoupons.slice(0, 3).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleApplyCoupon(c.coupon_code)}
                              style={{
                                background: '#FFF1F2',
                                border: '1px dashed #F84464',
                                borderRadius: '4px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#F84464',
                                cursor: 'pointer'
                              }}
                            >
                              {c.coupon_code} ({c.discount_type === 'PERCENTAGE' ? `${c.discount_value}%` : `₹${c.discount_value}`})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#4B5563' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ticket Base Price:</span>
                  <span>₹{basePrice.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: '600' }}>
                    <span>Coupon Discount ({appliedCoupon.coupon_code}):</span>
                    <span>- ₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Convenience Fee & Taxes:</span>
                  <span style={{ color: '#059669', fontWeight: '600' }}>FREE</span>
                </div>

                <div style={{
                  borderTop: '1px solid #E5E7EB',
                  paddingTop: '12px',
                  marginTop: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>Total Payable:</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#F84464' }}>
                    ₹{finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handlePayNow}
                disabled={processing}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: '700',
                  marginTop: '20px',
                  borderRadius: '8px'
                }}
              >
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={18} className="animate-spin" /> Processing Payment...
                  </span>
                ) : (
                  `Pay ₹${finalPrice.toFixed(2)} & Get Passes →`
                )}
              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
