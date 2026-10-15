import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Star, Flame, Sparkles, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export const EventCard = ({ event }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const isSoldOut = event.available_seats <= 0;
  const isFillingFast = !isSoldOut && event.available_seats <= 40;
  const wishlisted = isWishlisted(event.id);

  // Rating representation
  const hasRating = event.average_rating && event.average_rating > 0;
  const ratingScore = hasRating ? Number(event.average_rating).toFixed(1) : null;
  const votesCount = event.total_reviews || 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await toggleWishlist(event.id);
  };

  return (
    <div className="bms-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Event Poster Wrap */}
      <Link to={`/events/${event.id}`} style={{ position: 'relative', display: 'block' }}>
        <div className="bms-poster-wrap">
          <img
            src={event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
            alt={event.title}
            className="bms-poster-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
            }}
          />

          {/* Category Pill */}
          <span className="bms-badge-category">
            {event.category}
          </span>

          {/* Heart / Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            title={wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: wishlisted ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              border: wishlisted ? '1px solid #FECDD3' : '1px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              zIndex: 5,
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
              transform: wishlisted ? 'scale(1.05)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = wishlisted ? 'scale(1.05)' : 'scale(1)';
            }}
          >
            <Heart
              size={18}
              fill={wishlisted ? '#F84464' : 'none'}
              color={wishlisted ? '#F84464' : '#ffffff'}
              strokeWidth={wishlisted ? 2.5 : 2}
            />
          </button>

          {/* Rating Badge */}
          <div className="bms-badge-rating">
            {hasRating ? (
              <>
                <Star size={13} fill="#F59E0B" color="#F59E0B" />
                <span>{ratingScore}/5</span>
                {votesCount > 0 && (
                  <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: '500', marginLeft: '2px' }}>
                    ({votesCount} {votesCount === 1 ? 'vote' : 'votes'})
                  </span>
                )}
              </>
            ) : (
              <>
                <Sparkles size={13} color="#F84464" />
                <span>NEW</span>
              </>
            )}
          </div>
        </div>
      </Link>

      {/* Card Content Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        
        {/* Title */}
        <Link to={`/events/${event.id}`}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '6px',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => e.target.style.color = '#F84464'}
          onMouseLeave={(e) => e.target.style.color = '#111827'}
          >
            {event.title}
          </h3>
        </Link>

        {/* Location / Venue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
          <MapPin size={13} color="#9CA3AF" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.location}
          </span>
        </div>

        {/* Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6B7280', marginBottom: '14px' }}>
          <Calendar size={13} color="#9CA3AF" />
          <span>{formattedDate}</span>
        </div>

        {/* Inventory Badge */}
        <div style={{ marginBottom: '16px' }}>
          {isSoldOut ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '700',
              background: '#FEE2E2',
              color: '#DC2626'
            }}>
              SOLD OUT
            </span>
          ) : isFillingFast ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '700',
              background: '#FEF3C7',
              color: '#B45309'
            }}>
              <Flame size={12} color="#D97706" /> Filling Fast ({event.available_seats} left)
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: '600',
              background: '#ECFDF5',
              color: '#059669'
            }}>
              Available ({event.available_seats} seats)
            </span>
          )}
        </div>

        {/* Bottom Strip: Price & Book button */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #F3F4F6'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' }}>
              From
            </div>
            <div style={{ fontSize: '17px', fontWeight: '800', color: '#111827' }}>
              ₹{event.ticket_price}
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '6px',
              background: isSoldOut ? '#E5E7EB' : '#F84464',
              color: isSoldOut ? '#9CA3AF' : '#ffffff',
              boxShadow: isSoldOut ? 'none' : '0 2px 6px rgba(248,68,100,0.3)',
              cursor: isSoldOut ? 'default' : 'pointer'
            }}
          >
            {isSoldOut ? 'Sold Out' : 'Book Now'}
          </Link>
        </div>

      </div>
    </div>
  );
};
