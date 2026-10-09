import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { organizerApi } from '../../api/client';
import { ArrowLeft } from 'lucide-react';

export const CreateEventPage = () => {
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (Number(formData.ticket_price) < 0) {
      setError('Ticket price cannot be negative.');
      return;
    }

    setLoading(true);
    try {
      await organizerApi.createEvent({
        ...formData,
        ticket_price: parseFloat(formData.ticket_price),
        total_seats: parseInt(formData.total_seats),
        event_date: new Date(formData.event_date).toISOString(),
        banner_image: formData.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      });
      navigate('/organizer/events');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px', maxWidth: '640px' }}>
      <Link to="/organizer/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '13px', marginBottom: '16px' }}>
        <ArrowLeft size={15} /> Back to organizer events
      </Link>

      <div className="simple-card" style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '20px', color: '#111827', marginBottom: '6px' }}>
          Publish New Event
        </h1>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>
          Enter the details below to launch your event and open ticket booking
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
              placeholder="e.g. AI & Robotics Summit 2026"
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
                Ticket Price (₹):
              </label>
              <input
                type="number"
                name="ticket_price"
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="e.g. 499"
                value={formData.ticket_price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
                Total Available Seats:
              </label>
              <input
                type="number"
                name="total_seats"
                required
                min="1"
                className="input-field"
                placeholder="e.g. 150"
                value={formData.total_seats}
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
              placeholder="e.g. Convention Hall, Electronic City, Bangalore"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Banner Image URL (optional):
            </label>
            <input
              type="url"
              name="banner_image"
              className="input-field"
              placeholder="https://images.unsplash.com/..."
              value={formData.banner_image}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Event Description:
            </label>
            <textarea
              name="description"
              required
              rows="4"
              className="input-field"
              placeholder="Describe the schedule, guest speakers, key activities and highlights..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          >
            {loading ? 'Creating event...' : 'Publish Event'}
          </button>
        </form>
      </div>
    </div>
  );
};
