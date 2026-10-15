import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistApi } from '../api/client';
import { useWishlist } from '../context/WishlistContext';
import { Heart, Calendar, MapPin, Trash2, ArrowRight, Sparkles, Tag, ShoppingBag } from 'lucide-react';

export const WishlistPage = () => {
  const navigate = useNavigate();
  const { removeFromWishlist, refreshWishlist } = useWishlist();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      setItems(res.data || []);
    } catch (err) {
      console.log('Error loading wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (eventId) => {
    try {
      setRemovingId(eventId);
      await removeFromWishlist(eventId);
      setItems((prev) => prev.filter((item) => item.event_id !== eventId));
      await refreshWishlist();
    } catch (err) {
      console.log('Failed to remove:', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div style={{ background: '#F5F6F8', minHeight: '85vh', padding: '36px 0 80px 0' }}>
      <div className="container">
        
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E5E7EB'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{
                background: '#FFF0F2',
                color: '#F84464',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex'
              }}>
                <Heart size={20} fill="#F84464" color="#F84464" />
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: 0 }}>
                My Saved Events
              </h1>
            </div>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Keep track of events you want to attend and book your passes whenever you're ready.
            </p>
          </div>

          <div style={{
            background: '#ffffff',
            padding: '8px 16px',
            borderRadius: '10px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #E5E7EB',
            fontSize: '13px',
            fontWeight: '700',
            color: '#1E293B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>Total Saved:</span>
            <span style={{
              background: '#F84464',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              {items.length}
            </span>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {[1, 2, 3].map((sk) => (
              <div key={sk} className="bms-card" style={{ height: '360px', padding: '16px' }}>
                <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: '8px', marginBottom: '14px' }} />
                <div className="skeleton" style={{ width: '70%', height: '18px', marginBottom: '10px' }} />
                <div className="skeleton" style={{ width: '50%', height: '14px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '100%', height: '40px', borderRadius: '6px' }} />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '60px 24px',
            textAlign: 'center',
            border: '1px solid #E5E7EB',
            boxShadow: 'var(--shadow-sm)',
            maxWidth: '560px',
            margin: '40px auto'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#FFF0F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#F84464'
            }}>
              <Heart size={36} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', lineHeight: '1.6' }}>
              Explore upcoming concerts, tech summits, live matches and business events. Click the heart icon on any event card to save it here.
            </p>
            <Link
              to="/"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 28px',
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              Explore Events <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {items.map((item) => {
              const evt = item.event;
              if (!evt) return null;

              const isSoldOut = evt.available_seats <= 0;
              const formattedDate = new Date(evt.event_date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={item.id}
                  className="bms-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Poster Wrap */}
                  <div className="bms-poster-wrap" style={{ position: 'relative' }}>
                    <img
                      src={evt.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'}
                      alt={evt.title}
                      className="bms-poster-img"
                    />

                    <span className="bms-badge-category">
                      {evt.category}
                    </span>

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(evt.id)}
                      disabled={removingId === evt.id}
                      aria-label="Remove from wishlist"
                      title="Remove from saved events"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #FECDD3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.transform = 'scale(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <Trash2 size={16} color="#DC2626" />
                    </button>
                  </div>

                  {/* Body Details */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <Link to={`/events/${evt.id}`}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#111827',
                        marginBottom: '8px',
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
                        {evt.title}
                      </h3>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                      <MapPin size={14} color="#9CA3AF" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {evt.location}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6B7280', marginBottom: '14px' }}>
                      <Calendar size={14} color="#9CA3AF" />
                      <span>{formattedDate}</span>
                    </div>

                    {/* Availability status */}
                    <div style={{ marginBottom: '16px' }}>
                      {isSoldOut ? (
                        <span style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: '#FEE2E2',
                          color: '#DC2626'
                        }}>
                          SOLD OUT
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: '#ECFDF5',
                          color: '#059669'
                        }}>
                          {evt.available_seats} Tickets Left
                        </span>
                      )}
                    </div>

                    {/* Bottom Action Strip */}
                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '12px',
                      borderTop: '1px solid #F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: '600' }}>
                          Ticket
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>
                          ₹{evt.ticket_price}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/events/${evt.id}`}
                          className="btn-primary"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            borderRadius: '6px',
                            background: isSoldOut ? '#E5E7EB' : '#F84464',
                            color: isSoldOut ? '#9CA3AF' : '#ffffff',
                            cursor: isSoldOut ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <ShoppingBag size={14} />
                          {isSoldOut ? 'Sold Out' : 'Book Now'}
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
