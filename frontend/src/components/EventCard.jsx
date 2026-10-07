import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';

export const EventCard = ({ event }) => {
  // Simple date format
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

  return (
    <div className="simple-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Event banner image */}
      <div style={{ position: 'relative', width: '100%', height: '170px' }}>
        <img
          src={event.banner_image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span className={`badge ${getBadgeClass(event.category)}`}>
            {event.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
          {event.title}
        </h3>

        <p style={{
          fontSize: '13px',
          color: '#4b5563',
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {event.description}
        </p>

        {/* Date and Location */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="#4b5563" />
            <span>{formattedDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} color="#4b5563" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {event.location}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="#4b5563" />
            <span>{isSoldOut ? 'Sold Out' : `${event.available_seats} seats remaining`}</span>
          </div>
        </div>

        {/* Price & Book button */}
        <div style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>Ticket Price</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
              ₹{event.ticket_price}
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '13px' }}
          >
            {isSoldOut ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>
    </div>
  );
};
