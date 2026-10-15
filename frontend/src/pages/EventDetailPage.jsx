import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi, reviewsApi, updatesApi, recommendationsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Star, 
  ShieldCheck, 
  Clock, 
  Share2, 
  MessageSquare,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Heart,
  Radio,
  Megaphone,
  Zap,
  Send
} from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOrganizer, isAdmin } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  // Live Seat Availability state
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [seatUpdateFlash, setSeatUpdateFlash] = useState(false);

  // Live Event Announcements state
  const [updatesList, setUpdatesList] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [newUpdateMessage, setNewUpdateMessage] = useState('');
  const [postingUpdate, setPostingUpdate] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Reviews & Ratings state
  const [reviewsData, setReviewsData] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userRating, setUserRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Load event details, reviews, announcements, and track event view
  useEffect(() => {
    loadEventDetails();
    loadReviews();
    loadEventUpdates();

    // Track user view for personalized recommendations
    if (id) {
      recommendationsApi.recordView(id).catch(() => {});
    }
  }, [id]);

  // Real-time seat updates via WebSocket with fallback polling
  useEffect(() => {
    if (!id) return;

    let socket = null;
    let fallbackInterval = null;

    try {
      socket = new WebSocket(`ws://127.0.0.1:8001/ws/events/${id}`);
      socket.onopen = () => {
        setIsLiveConnected(true);
      };
      socket.onmessage = (msgEvent) => {
        try {
          const payload = JSON.parse(msgEvent.data);
          if (payload.type === 'SEAT_UPDATE' && Number(payload.event_id) === Number(id)) {
            setEvent((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                available_seats: payload.available_seats,
              };
            });
            setSeatUpdateFlash(true);
            setTimeout(() => setSeatUpdateFlash(false), 2500);
          }
        } catch (e) {
          console.log('Error parsing WS message:', e);
        }
      };
      socket.onerror = () => {
        setIsLiveConnected(false);
      };
      socket.onclose = () => {
        setIsLiveConnected(false);
      };
    } catch (e) {
      console.log('WebSocket connection error:', e);
    }

    // Polling fallback every 8 seconds
    fallbackInterval = setInterval(async () => {
      try {
        const res = await eventsApi.getLiveSeats(id);
        if (res.data) {
          setEvent((prev) => {
            if (!prev) return prev;
            if (prev.available_seats !== res.data.available_seats) {
              setSeatUpdateFlash(true);
              setTimeout(() => setSeatUpdateFlash(false), 2500);
              return { ...prev, available_seats: res.data.available_seats };
            }
            return prev;
          });
        }
      } catch (err) {
        // silent polling error
      }
    }, 8000);

    return () => {
      if (socket) socket.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [id]);

  const loadEventDetails = async () => {
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

  const loadEventUpdates = async () => {
    try {
      setLoadingUpdates(true);
      const res = await updatesApi.getEventUpdates(id);
      setUpdatesList(res.data || []);
    } catch (err) {
      console.log('Error loading event updates:', err);
    } finally {
      setLoadingUpdates(false);
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!newUpdateMessage.trim()) return;

    try {
      setPostingUpdate(true);
      setUpdateSuccess('');
      await updatesApi.postEventUpdate(id, newUpdateMessage.trim());
      setNewUpdateMessage('');
      setUpdateSuccess('Official announcement broadcasted to attendees!');
      await loadEventUpdates();
      setTimeout(() => setUpdateSuccess(''), 3500);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to post announcement');
    } finally {
      setPostingUpdate(false);
    }
  };

  const loadReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await reviewsApi.getEventReviews(id);
      setReviewsData(res.data);
      if (res.data.user_review) {
        setUserRating(res.data.user_review.rating);
        setReviewText(res.data.user_review.review_text);
      }
    } catch (err) {
      console.log('Error loading reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Submit or edit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!reviewText.trim()) {
      setReviewErrorMsg('Please write a brief comment describing your experience.');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewErrorMsg('');
      setReviewSuccessMsg('');

      if (editingReviewId) {
        await reviewsApi.updateReview(editingReviewId, {
          rating: userRating,
          review_text: reviewText.trim()
        });
        setReviewSuccessMsg('Review updated successfully!');
        setEditingReviewId(null);
      } else {
        await reviewsApi.submitReview(id, {
          rating: userRating,
          review_text: reviewText.trim()
        });
        setReviewSuccessMsg('Thank you for rating this event!');
      }

      await loadReviews();
      await loadEventDetails();
    } catch (err) {
      setReviewErrorMsg(err.response?.data?.detail || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewsApi.deleteReview(reviewId);
      setReviewText('');
      setUserRating(5);
      await loadReviews();
      await loadEventDetails();
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout', {
      state: {
        event,
        quantity,
      }
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px', marginBottom: '24px' }} />
        <p style={{ color: '#6B7280' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: '#EF4444', fontSize: '18px', fontWeight: '600' }}>{error || 'Event not found.'}</p>
        <Link to="/" className="btn-primary" style={{ marginTop: '20px' }}>
          Explore Events
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedTime = new Date(event.event_date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalPrice = event.ticket_price * quantity;
  const isSoldOut = event.available_seats <= 0;
  const avgRating = reviewsData?.average_rating || Number(event.average_rating || 0).toFixed(1);
  const totalVotes = reviewsData?.total_reviews || event.total_reviews || 0;

  return (
    <div style={{ background: '#F5F6F8', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Top Breadcrumb Header */}
      <div style={{ background: '#1F2533', borderBottom: '1px solid #383F55', padding: '12px 0' }}>
        <div className="container">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', fontSize: '13px' }}>
            <ArrowLeft size={16} /> Back to Events Discovery
          </Link>
        </div>
      </div>

      {/* Event Hero Backdrop */}
      <div style={{
        position: 'relative',
        background: '#111827',
        color: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Blurry Backdrop Ambient Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px) brightness(0.25)',
          transform: 'scale(1.1)'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, padding: '40px 20px' }}>
          <div style={{ display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Event Poster Card */}
            <div style={{
              width: '280px',
              height: '380px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.1)',
              flexShrink: 0
            }}>
              <img
                src={event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                alt={event.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Event Header Information */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  background: '#F84464',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  textTransform: 'uppercase'
                }}>
                  {event.category}
                </span>

                {/* Rating Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#ffffff'
                }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" />
                  <span>{avgRating}/5</span>
                  <span style={{ color: '#94A3B8', fontSize: '11px', fontWeight: '500' }}>
                    ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
                  </span>
                </div>
              </div>

              <h1 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
                {event.title}
              </h1>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#E2E8F0', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={17} color="#F84464" />
                  <span>{formattedDate} at {formattedTime}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={17} color="#F84464" />
                  <span>{event.location}</span>
                </div>

                {/* Live Seats availability line */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: seatUpdateFlash ? 'rgba(248, 68, 100, 0.25)' : 'transparent',
                  transition: 'background 0.3s ease',
                  width: 'fit-content'
                }}>
                  <Users size={17} color="#F84464" />
                  <span style={{ fontWeight: '600' }}>
                    {event.available_seats} Seats Available / {event.total_seats} Total
                  </span>
                  {isLiveConnected && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10B981',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      marginLeft: '6px'
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                      LIVE SYNC
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#94A3B8' }}>Ticket Price:</span>
                  <span style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff' }}>₹{event.ticket_price}</span>
                  <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600' }}>• Instant QR Pass</span>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    await toggleWishlist(event.id);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isWishlisted(event.id) ? '#FFF0F2' : 'rgba(255, 255, 255, 0.15)',
                    color: isWishlisted(event.id) ? '#F84464' : '#ffffff',
                    border: isWishlisted(event.id) ? '1px solid #FECDD3' : '1px solid rgba(255, 255, 255, 0.25)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(6px)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Heart
                    size={16}
                    fill={isWishlisted(event.id) ? '#F84464' : 'none'}
                    color={isWishlisted(event.id) ? '#F84464' : '#ffffff'}
                  />
                  <span>{isWishlisted(event.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Details & Booking Sticky Bar */}
      <div className="container" style={{ marginTop: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          
          {/* Left Column: Description, Live Announcements, & Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Live Announcements & Event Updates */}
            <div className="bms-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    background: '#FEF3C7',
                    color: '#B45309',
                    padding: '6px',
                    borderRadius: '8px',
                    display: 'flex'
                  }}>
                    <Megaphone size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>
                      Live Event Announcements & Updates
                    </h2>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                      Real-time notices and guidelines from event organizers
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#059669',
                  background: '#ECFDF5',
                  padding: '3px 8px',
                  borderRadius: '12px'
                }}>
                  {updatesList.length} {updatesList.length === 1 ? 'Notice' : 'Notices'}
                </span>
              </div>

              {/* Organizer / Admin Post Form */}
              {(isAdmin || isOrganizer) && (
                <form
                  onSubmit={handlePostUpdate}
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Megaphone size={14} color="#F84464" /> Post an Official Announcement
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="E.g. Entry gates open at 5:00 PM. Parking is available at Gate 3."
                      value={newUpdateMessage}
                      onChange={(e) => setNewUpdateMessage(e.target.value)}
                      style={{ fontSize: '13px' }}
                    />
                    <button
                      type="submit"
                      disabled={postingUpdate || !newUpdateMessage.trim()}
                      className="btn-primary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0
                      }}
                    >
                      <Send size={14} />
                      {postingUpdate ? 'Posting...' : 'Broadcast'}
                    </button>
                  </div>
                  {updateSuccess && (
                    <div style={{ color: '#059669', fontSize: '12px', fontWeight: '600', marginTop: '6px' }}>
                      ✓ {updateSuccess}
                    </div>
                  )}
                </form>
              )}

              {/* Updates List */}
              {loadingUpdates ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#6B7280', fontSize: '13px' }}>
                  Checking for live announcements...
                </div>
              ) : updatesList.length === 0 ? (
                <div style={{
                  background: '#F9FAFB',
                  border: '1px dashed #D1D5DB',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6B7280',
                  fontSize: '13px'
                }}>
                  No announcements yet. Check back closer to event day for gate and schedule updates!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {updatesList.map((upd) => (
                    <div
                      key={upd.id}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #F84464',
                        background: '#FFF5F6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#E11D48', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Official Announcement
                        </span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                          {new Date(upd.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#1F2937', lineHeight: '1.5' }}>
                        {upd.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* About Event Card */}
            <div className="bms-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>
                About the Event
              </h2>
              <p style={{ fontSize: '14px', color: '#4B5563', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {event.description}
              </p>
            </div>

            {/* User Feedback & Ratings Section */}
            <div className="bms-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star size={20} fill="#F59E0B" color="#F59E0B" />
                    Reviews & Ratings
                  </h2>
                  <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                    Verified audience feedback and event impressions
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>
                    ★ {avgRating} <span style={{ fontSize: '14px', color: '#6B7280' }}>/ 5</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {totalVotes} total verified ratings
                  </div>
                </div>
              </div>

              {/* Review Submission Form (Only verified attendees who booked) */}
              {isAuthenticated ? (
                reviewsData?.user_can_review ? (
                  <form onSubmit={handleSubmitReview} style={{
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                      {reviewsData.user_review ? 'Update Your Review' : 'Rate Your Experience as an Attendee'}
                    </h3>

                    {/* Interactive Star Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: '500' }}>Your Rating:</span>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <Star
                            key={starVal}
                            size={22}
                            fill={starVal <= userRating ? '#F59E0B' : 'none'}
                            color={starVal <= userRating ? '#F59E0B' : '#D1D5DB'}
                            className="star-interactive"
                            onClick={() => setUserRating(starVal)}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#F59E0B' }}>
                        {userRating} / 5
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      className="input-field"
                      placeholder="Share your feedback, highlights of the event, venue experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      style={{ marginBottom: '12px' }}
                    />

                    {reviewSuccessMsg && (
                      <div style={{ color: '#059669', fontSize: '13px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={15} /> {reviewSuccessMsg}
                      </div>
                    )}

                    {reviewErrorMsg && (
                      <div style={{ color: '#DC2626', fontSize: '13px', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={15} /> {reviewErrorMsg}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn-primary"
                        style={{ padding: '8px 20px', fontSize: '13px' }}
                      >
                        {submittingReview ? 'Submitting...' : reviewsData.user_review ? 'Update Review' : 'Submit Review'}
                      </button>

                      {reviewsData.user_review && (
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(reviewsData.user_review.id)}
                          className="btn-outline-danger"
                          style={{ padding: '7px 14px', fontSize: '13px' }}
                        >
                          <Trash2 size={13} /> Delete Review
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div style={{
                    background: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#1E40AF',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ShieldCheck size={18} color="#2563EB" />
                    <span>Only attendees who have booked tickets for this event can submit verified reviews.</span>
                  </div>
                )
              ) : (
                <div style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '14px',
                  fontSize: '13px',
                  color: '#4B5563',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>
                  <Link to="/login" style={{ color: '#F84464', fontWeight: '700' }}>Sign In</Link> to view eligibility and leave an attendee review.
                </div>
              )}

              {/* Reviews List */}
              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280', fontSize: '13px' }}>
                  Loading reviews...
                </div>
              ) : reviewsData?.reviews?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280', fontSize: '13px' }}>
                  No reviews yet. Be the first ticket holder to share your thoughts!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {reviewsData?.reviews?.map((rev) => (
                    <div key={rev.id} style={{
                      padding: '14px',
                      border: '1px solid #F3F4F6',
                      borderRadius: '8px',
                      background: '#FAFAFA'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#1F2533',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {rev.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                            {rev.username}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#059669',
                            background: '#ECFDF5',
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            Verified Attendee
                          </span>
                        </div>

                        {/* Stars */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((st) => (
                            <Star
                              key={st}
                              size={13}
                              fill={st <= rev.rating ? '#F59E0B' : 'none'}
                              color={st <= rev.rating ? '#F59E0B' : '#D1D5DB'}
                            />
                          ))}
                        </div>
                      </div>

                      <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.5' }}>
                        {rev.review_text}
                      </p>
                      <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px', display: 'block' }}>
                        {new Date(rev.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Ticket Booking Box */}
          <div>
            <div className="bms-card" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Select Tickets
                </h3>
                {isLiveConnected && (
                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
                    Live
                  </span>
                )}
              </div>

              {/* Live Inventory Status Banner */}
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: isSoldOut ? '#FEE2E2' : event.available_seats <= 40 ? '#FEF3C7' : '#ECFDF5',
                border: isSoldOut ? '1px solid #FECDD3' : event.available_seats <= 40 ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isSoldOut ? '#DC2626' : '#10B981',
                    boxShadow: isSoldOut ? 'none' : '0 0 8px #10B981'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: isSoldOut ? '#991B1B' : event.available_seats <= 40 ? '#92400E' : '#065F46'
                  }}>
                    {isSoldOut ? 'SOLD OUT - No seats left' : `${event.available_seats} Tickets Available`}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: '500' }}>
                  {event.available_seats <= 40 && !isSoldOut ? '🔥 Selling fast' : 'Live updates'}
                </span>
              </div>

              {/* Quantity Picker */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px',
                background: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>General Admission</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>₹{event.ticket_price} per person</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isSoldOut}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #D1D5DB',
                      background: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Minus size={14} />
                  </button>

                  <span style={{ fontSize: '16px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(10, Math.min(event.available_seats, quantity + 1)))}
                    disabled={quantity >= 10 || quantity >= event.available_seats || isSoldOut}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #D1D5DB',
                      background: '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Summary lines */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#4B5563', marginBottom: '8px' }}>
                <span>Subtotal ({quantity} {quantity === 1 ? 'ticket' : 'tickets'}):</span>
                <span style={{ fontWeight: '600' }}>₹{totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#059669', marginBottom: '14px' }}>
                <span>Coupons available at checkout:</span>
                <span style={{ fontWeight: '600' }}>Up to 50% OFF</span>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Total Payable:</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#F84464' }}>₹{totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={isSoldOut}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  cursor: isSoldOut ? 'not-allowed' : 'pointer'
                }}
              >
                {isSoldOut ? 'Sold Out' : 'Proceed to Checkout →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#9CA3AF' }}>
                🔒 100% Secure Checkout with Instant QR Passes
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
