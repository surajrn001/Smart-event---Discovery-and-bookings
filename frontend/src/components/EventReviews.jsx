import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Trash2, Edit2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export const EventReviews = ({ eventId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewsApi.getEventReviews(eventId);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.average_rating || 0);
      setTotalReviews(res.data.total_reviews || 0);

      // Check if current user already left a review
      if (user) {
        const existing = (res.data.reviews || []).find((r) => r.user_id === user.id);
        if (existing) {
          setEditingId(existing.id);
          setRating(existing.rating);
          setReviewText(existing.review_text);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadReviews();
    }
  }, [eventId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setFeedbackMsg({ text: 'Please sign in to leave a review.', type: 'error' });
      return;
    }
    if (!reviewText.trim()) {
      setFeedbackMsg({ text: 'Please write a review comment.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      setFeedbackMsg({ text: '', type: '' });

      if (editingId) {
        await reviewsApi.updateReview(editingId, { rating, review_text: reviewText.trim() });
        setFeedbackMsg({ text: 'Your review was updated successfully!', type: 'success' });
      } else {
        await reviewsApi.submitReview(eventId, { rating, review_text: reviewText.trim() });
        setFeedbackMsg({ text: 'Thank you! Your verified review has been published.', type: 'success' });
      }
      loadReviews();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Could not submit review.';
      setFeedbackMsg({ text: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewsApi.deleteReview(id);
      setEditingId(null);
      setReviewText('');
      setRating(5);
      setFeedbackMsg({ text: 'Review deleted.', type: 'success' });
      loadReviews();
    } catch (err) {
      setFeedbackMsg({ text: 'Failed to delete review.', type: 'error' });
    }
  };

  return (
    <div className="simple-card" style={{ padding: '24px', marginTop: '24px' }}>
      {/* Header with Star summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '18px', color: '#111827', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#2563eb" /> Attendee Reviews & Ratings
          </h3>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            Verified ratings from attendees who attended or booked this event.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef3c7', padding: '6px 12px', borderRadius: '20px', border: '1px solid #fde68a' }}>
            <Star size={18} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#92400e' }}>
              {avgRating > 0 ? avgRating.toFixed(1) : 'New'}
            </span>
            <span style={{ fontSize: '12px', color: '#b45309' }}>
              ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      {/* Submission / Edit Form */}
      <div style={{ background: '#f9fafb', padding: '18px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>
          {editingId ? 'Edit Your Review' : 'Rate & Review This Event'}
        </h4>

        {feedbackMsg.text && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            marginBottom: '12px',
            background: feedbackMsg.type === 'success' ? '#ecfdf5' : '#fee2e2',
            color: feedbackMsg.type === 'success' ? '#065f46' : '#991b1b',
            border: feedbackMsg.type === 'success' ? '1px solid #a7f3d0' : '1px solid #fecaca'
          }}>
            {feedbackMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSubmit}>
            {/* Interactive Star Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#4b5563', marginRight: '6px' }}>Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db'
                  }}
                >
                  <Star size={22} fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'} />
                </button>
              ))}
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#4b5563', marginLeft: '6px' }}>
                {hoverRating || rating} / 5
              </span>
            </div>

            {/* Comment textarea */}
            <div style={{ marginBottom: '12px' }}>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Share your experience (speaker quality, organization, venue, audio/visuals)..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              {editingId && (
                <button
                  type="button"
                  onClick={() => handleDelete(editingId)}
                  className="btn-secondary"
                  style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ fontSize: '13px' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  editingId ? 'Update Review' : 'Submit Verified Review'
                )}
              </button>
            </div>
          </form>
        ) : (
          <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
            Only verified attendees who booked this event can submit a review. Please sign in to rate.
          </p>
        )}
      </div>

      {/* Reviews List */}
      <div>
        {loading ? (
          <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', padding: '20px' }}>Loading attendee reviews...</p>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 20px', color: '#6b7280' }}>
            <p style={{ fontSize: '14px', marginBottom: '4px' }}>No reviews yet for this event.</p>
            <p style={{ fontSize: '12px' }}>Be the first verified attendee to share feedback!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {reviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: '1px solid #f3f4f6',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      {(rev.username || 'A')[0].toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                        {rev.username}
                      </span>
                      <span style={{
                        fontSize: '10px',
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        marginLeft: '6px',
                        fontWeight: '600'
                      }}>
                        Verified Attendee
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        fill={s <= rev.rating ? '#f59e0b' : 'none'}
                        color={s <= rev.rating ? '#f59e0b' : '#d1d5db'}
                      />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#4b5563', margin: '6px 0 6px 0', lineHeight: '1.5' }}>
                  {rev.review_text}
                </p>

                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {new Date(rev.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
