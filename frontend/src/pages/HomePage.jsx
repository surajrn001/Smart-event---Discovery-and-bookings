import React, { useState, useEffect } from 'react';
import { eventsApi } from '../api/client';
import { EventCard } from '../components/EventCard';
import {
  Search,
  MapPin,
  Calendar,
  ArrowUpDown,
  Filter,
  Flame,
  RotateCcw,
  Sparkles,
  Ticket,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = ['All', 'Tech', 'Music', 'Sports', 'Business'];

export const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [datePreset, setDatePreset] = useState('all'); // all, weekend, month
  const [sortBy, setSortBy] = useState('date_asc'); // date_asc, date_desc, price_asc, price_desc, popularity, rating

  // Fetch events with all filters and sorting
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
      if (selectedLocation.trim() !== '') {
        params.location = selectedLocation.trim();
      }
      if (sortBy) {
        params.sort_by = sortBy;
      }

      // Handle date presets
      const now = new Date();
      if (datePreset === 'weekend') {
        // Find next Saturday and Sunday
        const day = now.getDay();
        const diffSat = (6 - day + 7) % 7;
        const sat = new Date(now);
        sat.setDate(now.getDate() + diffSat);
        const sun = new Date(sat);
        sun.setDate(sat.getDate() + 1);
        params.start_date = sat.toISOString().split('T')[0];
        params.end_date = sun.toISOString().split('T')[0];
      } else if (datePreset === 'month') {
        const nextMonth = new Date(now);
        nextMonth.setDate(now.getDate() + 30);
        params.start_date = now.toISOString().split('T')[0];
        params.end_date = nextMonth.toISOString().split('T')[0];
      }

      const res = await eventsApi.getEvents(params);
      setEvents(res.data);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedCategory, datePreset, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('');
    setDatePreset('all');
    setSortBy('date_asc');
  };

  // Trending / Featured Events (highest rating or popular)
  const trendingEvents = [...events]
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 3);

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    searchTerm.trim() !== '' ||
    selectedLocation.trim() !== '' ||
    datePreset !== 'all' ||
    sortBy !== 'date_asc';

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
        color: '#ffffff',
        padding: '50px 16px 60px 16px',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '16px'
          }}>
            <Sparkles size={14} color="#fde047" /> Experience Live Events Like Never Before
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: '800', lineHeight: '1.25', marginBottom: '14px', letterSpacing: '-0.5px' }}>
            Discover, Book & Experience Unforgettable Events
          </h1>

          <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '28px', maxWidth: '620px', margin: '0 auto 28px auto', lineHeight: '1.5' }}>
            Book digital QR passes for top tech conferences, indie music festivals, sports leagues, and founder summits across India.
          </p>

          {/* Search Box inside Hero */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              background: '#ffffff',
              borderRadius: '10px',
              padding: '6px 8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              flexWrap: 'wrap',
              maxWidth: '720px',
              margin: '0 auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', padding: '6px 8px' }}>
              <Search size={18} color="#9ca3af" />
              <input
                id="event-search-input"
                type="text"
                placeholder="Search event title, artists, topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#111827'
                }}
              />
            </div>

            <div style={{ width: '1px', height: '24px', background: '#e5e7eb', display: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 160px', padding: '6px 8px', borderLeft: '1px solid #e5e7eb' }}>
              <MapPin size={18} color="#9ca3af" />
              <input
                type="text"
                placeholder="City (e.g. Bangalore, Pune)..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  color: '#111827'
                }}
              />
            </div>

            <button
              id="event-search-btn"
              type="submit"
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '14px', borderRadius: '8px', whiteSpace: 'nowrap' }}
            >
              Explore
            </button>
          </form>
        </div>
      </section>

      {/* Main Container */}
      <div className="container" style={{ padding: '30px 16px 0 16px' }}>
        {/* Category Pills */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '28px',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '7px 18px',
                borderRadius: '24px',
                fontSize: '13px',
                cursor: 'pointer',
                border: selectedCategory === cat ? '1px solid #2563eb' : '1px solid #d1d5db',
                background: selectedCategory === cat ? '#2563eb' : '#ffffff',
                color: selectedCategory === cat ? '#ffffff' : '#374151',
                fontWeight: '600',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured / Trending Section (when no heavy search query is active) */}
        {!searchTerm && selectedCategory === 'All' && trendingEvents.length > 0 && (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: '#fef3c7', padding: '6px', borderRadius: '8px' }}>
                <Flame size={20} color="#d97706" />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', color: '#111827', margin: 0 }}>
                  Featured & High-Rated Events
                </h2>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                  Top trending events rated highly by verified attendees
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}>
              {trendingEvents.map((event) => (
                <EventCard key={`featured-${event.id}`} event={event} />
              ))}
            </div>
          </section>
        )}

        {/* Advanced Filter & Sort Bar */}
        <div className="simple-card" style={{
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Filter size={15} color="#2563eb" /> Filters:
            </span>

            {/* Date Preset Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#6b7280" />
              <select
                className="input-field"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '13px', width: 'auto' }}
              >
                <option value="all">All Dates</option>
                <option value="weekend">This Weekend</option>
                <option value="month">Next 30 Days</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ padding: '5px 10px', fontSize: '12px', gap: '4px' }}
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} /> Sort By:
            </span>
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
            >
              <option value="date_asc">Date: Soonest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="popularity">Most Popular (Tickets Sold)</option>
              <option value="rating">Highest Rated (⭐)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* All Events Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', color: '#111827', margin: 0 }}>
              {selectedCategory === 'All' ? 'All Live Events' : `${selectedCategory} Events`}
            </h2>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>
              Showing {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              <p>Finding available events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="simple-card" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <Ticket size={40} color="#9ca3af" style={{ marginBottom: '10px' }} />
              <h3 style={{ fontSize: '16px', color: '#111827', marginBottom: '4px' }}>No Events Match Your Filters</h3>
              <p style={{ fontSize: '13px', marginBottom: '16px' }}>Try broadening your search keyword or clearing date and location filters.</p>
              <button type="button" onClick={handleResetFilters} className="btn-secondary">
                Clear Filters
              </button>
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
    </div>
  );
};
