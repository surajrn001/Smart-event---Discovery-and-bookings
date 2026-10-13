import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { eventsApi, couponsApi } from '../api/client';
import { EventCard } from '../components/EventCard';
import { 
  Search, 
  MapPin, 
  Calendar, 
  ArrowUpDown, 
  Sparkles, 
  Tag, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  CheckCircle2,
  Copy
} from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Categories', icon: '🌟' },
  { id: 'Tech', label: 'Tech & AI', icon: '💻' },
  { id: 'Music', label: 'Music & Concerts', icon: '🎵' },
  { id: 'Sports', label: 'Sports & Matches', icon: '🏏' },
  { id: 'Business', label: 'Business & Summits', icon: '💼' }
];

const CITIES = ['All Cities', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  // Filters state from query parameters or default
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('location') || 'All Cities');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_asc');

  // Hero carousel slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Sync state if URL query params change (e.g. from navbar clicks)
  useEffect(() => {
    const qSearch = searchParams.get('search') || '';
    const qCat = searchParams.get('category') || 'All';
    const qLoc = searchParams.get('location') || 'All Cities';
    setSearchTerm(qSearch);
    setSelectedCategory(qCat);
    setSelectedCity(qLoc);
  }, [searchParams]);

  // Fetch active promotional coupons
  useEffect(() => {
    couponsApi.getActiveCoupons()
      .then((res) => setActiveCoupons(res.data))
      .catch((err) => console.log('Coupons load note:', err));
  }, []);

  // Fetch events with all filters & sort
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
      if (selectedCity !== 'All Cities') {
        params.location = selectedCity;
      }

      // Date range filtering
      const now = new Date();
      if (selectedDateFilter === 'TODAY') {
        params.start_date = new Date(now.setHours(0,0,0,0)).toISOString();
        params.end_date = new Date(now.setHours(23,59,59,999)).toISOString();
      } else if (selectedDateFilter === 'TOMORROW') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        params.start_date = new Date(tomorrow.setHours(0,0,0,0)).toISOString();
        params.end_date = new Date(tomorrow.setHours(23,59,59,999)).toISOString();
      } else if (selectedDateFilter === 'WEEKEND') {
        const saturday = new Date(now);
        const day = now.getDay();
        const diffSat = 6 - day;
        saturday.setDate(now.getDate() + diffSat);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        params.start_date = new Date(saturday.setHours(0,0,0,0)).toISOString();
        params.end_date = new Date(sunday.setHours(23,59,59,999)).toISOString();
      }

      // Sorting
      if (sortBy) {
        params.sort_by = sortBy;
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
  }, [selectedCategory, selectedCity, selectedDateFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedCity('All Cities');
    setSelectedDateFilter('ALL');
    setSortBy('date_asc');
    setSearchParams({});
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Top trending events for Hero Carousel
  const featuredEvents = events.slice(0, 3);

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      
      {/* Featured Hero Carousel */}
      {featuredEvents.length > 0 && (
        <div className="bms-hero-carousel">
          {featuredEvents.map((evt, idx) => {
            if (idx !== currentSlide) return null;
            return (
              <div
                key={evt.id}
                className="bms-hero-slide"
                style={{
                  backgroundImage: `url(${evt.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80'})`
                }}
              >
                <div className="bms-hero-overlay" />
                <div className="bms-hero-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span style={{
                      background: '#F84464',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      FEATURED PREMIERE
                    </span>
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(4px)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '4px 10px',
                      borderRadius: '4px'
                    }}>
                      {evt.category}
                    </span>
                  </div>

                  <h1 style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    lineHeight: '1.2',
                    marginBottom: '12px',
                    color: '#ffffff'
                  }}>
                    {evt.title}
                  </h1>

                  <p style={{
                    fontSize: '14px',
                    color: '#E2E8F0',
                    marginBottom: '20px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {evt.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', fontSize: '14px', color: '#CBD5E1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={16} color="#F84464" />
                      <span>{new Date(evt.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={16} color="#F84464" />
                      <span>{evt.location}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Link
                      to={`/events/${evt.id}`}
                      className="btn-primary"
                      style={{ padding: '12px 28px', fontSize: '15px' }}
                    >
                      Book Tickets Now • ₹{evt.ticket_price}
                    </Link>
                    <Link
                      to={`/events/${evt.id}`}
                      style={{
                        color: '#ffffff',
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'underline'
                      }}
                    >
                      View Event Info
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Carousel dots navigation */}
          {featuredEvents.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              right: '24px',
              display: 'flex',
              gap: '8px',
              zIndex: 10
            }}>
              {featuredEvents.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: currentSlide === i ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: currentSlide === i ? '#F84464' : 'rgba(255,255,255,0.4)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Promotional Coupons Banner */}
      {activeCoupons.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, #FFF1F2 0%, #FEF3C7 100%)',
          border: '1px solid #FECDD3',
          borderRadius: '12px',
          padding: '14px 20px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#F84464',
              color: '#ffffff',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <Tag size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '800', color: '#1E293B' }}>
                🎉 Exclusive Festival Offers & Discounts
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Apply promo codes at checkout for instant savings on all tickets!
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {activeCoupons.map((c) => (
              <button
                key={c.id}
                onClick={() => handleCopyCoupon(c.coupon_code)}
                className="coupon-tag"
                title={`Click to copy code: ${c.coupon_code}`}
              >
                <span>{c.coupon_code}</span>
                <span style={{ color: '#F84464', fontWeight: '800' }}>
                  {c.discount_type === 'PERCENTAGE' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}
                </span>
                {copiedCode === c.coupon_code ? (
                  <CheckCircle2 size={13} color="#10B981" />
                ) : (
                  <Copy size={12} color="#92400E" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid #E5E7EB',
        marginBottom: '28px'
      }}>
        {/* Top search & city selector */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ flex: 1, minWidth: '260px', position: 'relative' }}
          >
            <Search size={17} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Search by event title, artist or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </form>

          {/* City filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="input-field"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Date Range filter */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="input-field"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="ALL">Any Date</option>
              <option value="TODAY">Today</option>
              <option value="TOMORROW">Tomorrow</option>
              <option value="WEEKEND">This Weekend</option>
            </select>
          </div>

          {/* Sort By dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              className="input-field"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="date_asc">Date: Nearest First</option>
              <option value="date_desc">Date: Latest First</option>
              <option value="popularity">Popularity: Best Sellers</option>
              <option value="rating">Top Rated (★)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="btn-secondary"
            style={{ padding: '10px 14px', fontSize: '13px' }}
          >
            Reset
          </button>
        </div>

        {/* Category Filter Pills */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`filter-pill ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Section Title & Active Filters Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>The Best of Live Events</span>
            {selectedCity !== 'All Cities' && (
              <span style={{ fontSize: '16px', color: '#F84464', fontWeight: '600' }}>
                in {selectedCity}
              </span>
            )}
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
            Handpicked live entertainment, tech conventions, music concerts and sports matches.
          </p>
        </div>

        <div style={{ fontSize: '14px', fontWeight: '600', color: '#4B5563' }}>
          {events.length} {events.length === 1 ? 'Event' : 'Events'} Available
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {[1, 2, 3, 4, 5, 6].map((sk) => (
            <div key={sk} className="bms-card" style={{ height: '360px', padding: '16px' }}>
              <div className="skeleton" style={{ width: '100%', height: '170px', borderRadius: '8px', marginBottom: '14px' }} />
              <div className="skeleton" style={{ width: '70%', height: '18px', marginBottom: '10px' }} />
              <div className="skeleton" style={{ width: '45%', height: '14px', marginBottom: '8px' }} />
              <div className="skeleton" style={{ width: '55%', height: '14px', marginBottom: '20px' }} />
              <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          border: '1px solid #E5E7EB',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
            No Events Match Your Search Criteria
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '440px', margin: '0 auto 20px auto' }}>
            We couldn't find any events matching your selected filters in {selectedCity}. Try clearing filters or searching for another keyword.
          </p>
          <button onClick={clearFilters} className="btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {events.map((evt) => (
            <EventCard key={evt.id} event={evt} />
          ))}
        </div>
      )}

    </div>
  );
};
