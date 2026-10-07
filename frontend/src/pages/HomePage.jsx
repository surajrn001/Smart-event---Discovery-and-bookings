import React, { useState, useEffect } from 'react';
import { eventsApi } from '../api/client';
import { EventCard } from '../components/EventCard';
import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Tech', 'Music', 'Sports', 'Business'];

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch events from backend API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (searchTerm.trim() !== '') {
        params.search = searchTerm.trim();
      }
      const res = await eventsApi.getEvents(params);
      setEvents(res.data);
    } catch (err) {
      console.log('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="container" style={{ padding: '24px 16px 60px 16px' }}>
      {/* Simple Header Banner */}
      <div style={{ textAlign: 'center', margin: '20px 0 30px 0' }}>
        <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '8px' }}>
          Discover & Book Event Tickets
        </h1>
        <p style={{ color: '#4b5563', fontSize: '15px' }}>
          Browse upcoming college, tech, and cultural events happening around you.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          style={{
            maxWidth: '500px',
            margin: '20px auto 0 auto',
            display: 'flex',
            gap: '8px',
          }}
        >
          <input
            id="event-search-input"
            type="text"
            className="input-field"
            placeholder="Search by title, location or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button id="event-search-btn" type="submit" className="btn-primary">
            <Search size={16} /> Search
          </button>
        </form>
      </div>

      {/* Category Filter buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            id={`filter-${cat.toLowerCase()}`}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '13px',
              cursor: 'pointer',
              border: selectedCategory === cat ? '1px solid #2563eb' : '1px solid #d1d5db',
              background: selectedCategory === cat ? '#2563eb' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : '#374151',
              fontWeight: '500',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', color: '#111827' }}>
            {selectedCategory === 'All' ? 'All Upcoming Events' : `${selectedCategory} Events`}
          </h2>
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Total: {events.length}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="simple-card" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
            No events found. Please try another search or category.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
