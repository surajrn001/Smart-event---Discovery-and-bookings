import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Star, ArrowRight } from 'lucide-react';

export const EventCard = ({ event }) => {
  const formattedDate = new Date(event.event_date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'music': return 'badge-music';
      case 'tech': return 'badge-tech';
      case 'sports': return 'badge-sports';
      case 'business': return 'badge-business';
      default: return 'badge-tech';
    }
  };

  const isSoldOut = event.available_seats <= 0;
  const seatsPercent = Math.round(((event.total_seats - event.available_seats) / event.total_seats) * 100);

  return (
    <div
      className="simple-card event-card-interactive"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: '10px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        background: '#ffffff'
      }}
    >
      {/* Event banner image */}
      <div style={{ position: 'relative', width: '100%', height: '180px' }}>
        <img
          src={event.banner_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
          <span className={`badge ${getBadgeClass(event.category)}`}>
            {event.category}
          </span>
        </div>

        {event.average_rating > 0 && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#92400e',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <Star size={12} fill="#f59e0b" color="#f59e0b" />
            <span>{event.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px', color: '#111827', lineHeight: '1.4' }}>
          {event.title}
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#4b5563',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          lineHeight: '1.5'
        }}>
          {event.description}
        </p>

        {/* Date and Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#2563eb" />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#2563eb" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="#2563eb" />
            <span>{isSoldOut ? 'Sold Out' : `${event.available_seats} of ${event.total_seats} seats left`}</span>
          </div>
        </div>

        {/* Price & Action button */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #f3f4f6',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Starts From</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              ₹{event.ticket_price.toFixed(2)}
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '13px', gap: '4px' }}
          >
            {isSoldOut ? 'Sold Out' : (
              <>
                Book <ArrowRight size={13} />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};
