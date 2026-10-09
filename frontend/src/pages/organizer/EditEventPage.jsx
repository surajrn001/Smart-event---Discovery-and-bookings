import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { organizerApi } from '../../api/client';
import { ArrowLeft } from 'lucide-react';

export const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Tech',
    location: '',
    event_date: '',
    ticket_price: '',
    total_seats: 100,
    banner_image: '',
    event_status: 'UPCOMING',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await organizerApi.getEventDetail(id);
        const evt = res.data;
        // Format datetime-local string
        const dateObj = new Date(evt.event_date);
        const localIso = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);

        setFormData({
          title: evt.title,
          description: evt.description,
          category: evt.category,
          location: evt.location,
          event_date: localIso,
          ticket_price: evt.ticket_price,
          total_seats: evt.total_seats,
          banner_image: evt.banner_image || '',
          event_status: evt.event_status,
        });
      } catch (err) {
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await organizerApi.updateEvent(id, {
        ...formData,
        ticket_price: parseFloat(formData.ticket_price),
        total_seats: parseInt(formData.total_seats),
        event_date: new Date(formData.event_date).toISOString(),
      });
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update event.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p>Loading event for editing...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px', maxWidth: '640px' }}>
      <Link to="/organizer/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '13px', marginBottom: '16px' }}>
        <ArrowLeft size={15} /> Back to organizer events
      </Link>

      <div className="simple-card" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '20px', color: '#111827', marginBottom: '6px' }}>
          Edit Event Details
        </h1>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
          Update schedule, venue, or status. Booked attendees will automatically be notified.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Event Title:
            </label>
            <input
              type="text"
              name="title"
              required
              className="input-field"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                Category:
              </label>
              <select
                name="category"
                className="input-field"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Tech">Tech</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                Status:
              </label>
              <select
                name="event_status"
                className="input-field"
                value={formData.event_status}
                onChange={handleChange}
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                Ticket Price (₹):
              </label>
              <input
                type="number"
                name="ticket_price"
                required
                min="0"
                step="0.01"
                className="input-field"
                value={formData.ticket_price}
                onChange={handleChange}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                Event Date & Time:
              </label>
              <input
                type="datetime-local"
                name="event_date"
                required
                className="input-field"
                value={formData.event_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Venue / Location:
            </label>
            <input
              type="text"
              name="location"
              required
              className="input-field"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Banner Image URL:
            </label>
            <input
              type="url"
              name="banner_image"
              className="input-field"
              value={formData.banner_image}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Description:
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="input-field"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          >
            {saving ? 'Saving changes...' : 'Save & Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
};
