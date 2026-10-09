import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizerApi } from '../../api/client';
import { PlusCircle, Calendar, MapPin, Users, Edit3, XCircle, BarChart3, AlertCircle } from 'lucide-react';

export const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await organizerApi.getEvents();
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load organizer events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCancelEvent = async (eventId, title) => {
    if (!window.confirm(`Are you sure you want to cancel '${title}'? All attendees will be notified.`)) {
      return;
    }
    try {
      await organizerApi.cancelEvent(eventId);
      setActionMessage(`Event '${title}' has been cancelled.`);
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel event');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UPCOMING':
        return { bg: '#e0f2fe', text: '#0369a1' };
      case 'ONGOING':
        return { bg: '#fef3c7', text: '#b45309' };
      case 'COMPLETED':
        return { bg: '#f3f4f6', text: '#4b5563' };
      case 'CANCELLED':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: '#e0f2fe', text: '#0369a1' };
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '4px' }}>
            Organizer Event Management
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Create, update, cancel and monitor ticket sales for your events
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/organizer/analytics" className="btn-secondary" style={{ fontSize: '13px' }}>
            <BarChart3 size={15} /> Sales Insights
          </Link>
          <Link to="/organizer/events/new" className="btn-primary" style={{ fontSize: '13px' }}>
            <PlusCircle size={15} /> Create New Event
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div style={{ background: '#ecfdf5', color: '#047857', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '20px' }}>
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          Loading your events...
        </div>
      ) : events.length === 0 ? (
        <div className="simple-card" style={{ padding: '40px', textAlign: 'center' }}>
          <Calendar size={40} color="#9ca3af" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: '#111827', marginBottom: '6px' }}>
            No Events Created Yet
          </h3>
          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '18px' }}>
            You haven't published any events under this organizer account.
          </p>
          <Link to="/organizer/events/new" className="btn-primary">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {events.map((evt) => {
            const badge = getStatusBadge(evt.event_status);
            const formattedDate = new Date(evt.event_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={evt.id}
                className="simple-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  opacity: evt.event_status === 'CANCELLED' ? 0.75 : 1,
                }}
              >
                <div style={{ flexGrow: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: badge.bg,
                      color: badge.text,
                    }}>
                      {evt.event_status}
                    </span>
                    <span className="badge badge-tech">
                      {evt.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>
                    {evt.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6b7280', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {formattedDate}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {evt.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} /> {evt.available_seats} / {evt.total_seats} seats remaining
                    </div>
                    <div style={{ fontWeight: '600', color: '#111827' }}>
                      ₹{evt.ticket_price} per ticket
                    </div>
                  </div>
                </div>

                {/* Organizer Actions */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Link
                    to={`/organizer/events/${evt.id}/bookings`}
                    className="btn-secondary"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    View Bookings
                  </Link>
                  <Link
                    to={`/organizer/events/${evt.id}/edit`}
                    className="btn-secondary"
                    style={{ fontSize: '13px', padding: '6px 12px' }}
                  >
                    <Edit3 size={14} /> Edit
                  </Link>
                  {evt.event_status !== 'CANCELLED' && evt.event_status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleCancelEvent(evt.id, evt.title)}
                      className="btn-secondary"
                      style={{ fontSize: '13px', padding: '6px 12px', color: '#dc2626', borderColor: '#fca5a5' }}
                    >
                      <XCircle size={14} /> Cancel Event
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
