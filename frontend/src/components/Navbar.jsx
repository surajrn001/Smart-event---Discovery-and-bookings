import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { 
  Search, 
  MapPin, 
  Bell, 
  Ticket, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  PlusCircle, 
  ChevronDown, 
  Tag, 
  Sparkles,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Heart,
  User
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

export const Navbar = () => {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { wishlistCount } = useWishlist();
  
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const userRef = useRef(null);
  const cityRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const cities = ['All Cities', 'Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    if (city === 'All Cities') {
      navigate('/');
    } else {
      navigate(`/?location=${encodeURIComponent(city)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper for notification type icons
  const getNotifIcon = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'PAYMENT':
        return <CreditCard size={16} color="#10B981" />;
      case 'BOOKING':
        return <Ticket size={16} color="#F84464" />;
      default:
        return <Sparkles size={16} color="#6366F1" />;
    }
  };

  return (
    <header className="bms-header">
      {/* Top Main Navigation Bar */}
      <div className="container">
        <div className="bms-top-bar">
          
          {/* Logo / Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #F84464 0%, #D81B60 100%)',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(248, 68, 100, 0.4)'
            }}>
              <Ticket size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                Smart<span style={{ color: '#F84464' }}>Event</span>
              </span>
              <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '-3px', letterSpacing: '0.5px' }}>
                LIVE EVENT PASSES
              </span>
            </div>
          </Link>

          {/* Global Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{ 
              flex: '1', 
              maxWidth: '540px', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search 
              size={18} 
              color="#94A3B8" 
              style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} 
            />
            <input
              type="text"
              placeholder="Search for Events, Music, Tech, Sports or Venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 42px',
                background: '#2B3148',
                border: '1px solid #383F55',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#F84464'}
              onBlur={(e) => e.target.style.borderColor = '#383F55'}
            />
          </form>

          {/* Right Action Icons & Menus */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* City Selector Dropdown */}
            <div ref={cityRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: '#CBD5E1',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '6px 8px',
                  borderRadius: '6px',
                }}
              >
                <MapPin size={16} color="#F84464" />
                <span>{selectedCity}</span>
                <ChevronDown size={14} color="#94A3B8" />
              </button>

              {showCityDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  width: '180px',
                  background: '#ffffff',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                  border: '1px solid #E5E7EB',
                  zIndex: 1200,
                  overflow: 'hidden',
                  padding: '6px 0'
                }}>
                  <div style={{ padding: '6px 14px', fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' }}>
                    Popular Cities
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 14px',
                        background: selectedCity === city ? '#FFF0F2' : 'transparent',
                        color: selectedCity === city ? '#F84464' : '#374151',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: selectedCity === city ? '600' : '400',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      {city}
                      {selectedCity === city && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F84464' }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Wishlist Link */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                style={{
                  position: 'relative',
                  background: 'transparent',
                  border: 'none',
                  color: '#CBD5E1',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Saved Events"
              >
                <Heart size={20} color={wishlistCount > 0 ? '#F84464' : '#CBD5E1'} fill={wishlistCount > 0 ? '#F84464' : 'none'} />
                {wishlistCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    background: '#F84464',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '700',
                    borderRadius: '10px',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                    border: '2px solid #1F2533'
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications Bell */}
            {isAuthenticated && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  style={{
                    position: 'relative',
                    background: 'transparent',
                    border: 'none',
                    color: '#CBD5E1',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#F84464',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      minWidth: '18px',
                      height: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid #1F2533'
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifDropdown && (
                  <div className="notif-popover">
                    <div style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #E5E7EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#F9FAFB'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span style={{
                            background: '#FFF0F2',
                            color: '#F84464',
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#F84464',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '32px 16px', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                            style={{
                              padding: '12px 16px',
                              borderBottom: '1px solid #F3F4F6',
                              background: notif.is_read ? '#ffffff' : '#FFF5F6',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '12px',
                              alignItems: 'flex-start',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <div style={{
                              padding: '8px',
                              borderRadius: '8px',
                              background: notif.is_read ? '#F3F4F6' : '#FFE4E8',
                              marginTop: '2px'
                            }}>
                              {getNotifIcon(notif.notification_type || notif.type)}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '13px',
                                fontWeight: notif.is_read ? '500' : '700',
                                color: '#111827',
                                display: 'flex',
                                justifyContent: 'space-between'
                              }}>
                                <span>{notif.title}</span>
                                {!notif.is_read && (
                                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F84464' }} />
                                )}
                              </div>
                              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '3px', lineHeight: '1.4' }}>
                                {notif.message}
                              </p>
                              <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                                {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{
                      padding: '10px 16px',
                      background: '#F9FAFB',
                      borderTop: '1px solid #E5E7EB',
                      textAlign: 'center'
                    }}>
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifDropdown(false)}
                        style={{ fontSize: '12px', fontWeight: '600', color: '#F84464' }}
                      >
                        View all notification history →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List Your Show / Host Link (Organizer / Admin) */}
            {isOrganizer ? (
              <Link
                to="/organizer/events/new"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease'
                }}
              >
                <PlusCircle size={14} color="#F84464" />
                <span>Create Event</span>
              </Link>
            ) : null}

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div ref={userRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}
                >
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #F84464 0%, #D81B60 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.username}
                  </span>
                  <ChevronDown size={14} color="#94A3B8" />
                </button>

                {showUserDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '210px',
                    background: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                    border: '1px solid #E5E7EB',
                    zIndex: 1200,
                    overflow: 'hidden',
                    padding: '6px 0'
                  }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid #F3F4F6' }}>
                      <p style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{user?.username}</p>
                      <p style={{ fontSize: '11px', color: '#6B7280' }}>{user?.email}</p>
                      <span style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: user?.role === 'ADMIN' ? '#7E22CE' : user?.role === 'ORGANIZER' ? '#0284C7' : '#10B981',
                        background: user?.role === 'ADMIN' ? '#F3E8FF' : user?.role === 'ORGANIZER' ? '#E0F2FE' : '#ECFDF5',
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#374151',
                        fontWeight: '500'
                      }}
                    >
                      <User size={15} color="#10B981" /> My Profile & Summary
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#374151',
                        fontWeight: '500'
                      }}
                    >
                      <Heart size={15} color="#E11D48" /> Saved Events ({wishlistCount})
                    </Link>

                    <Link
                      to="/history"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#374151',
                        fontWeight: '500'
                      }}
                    >
                      <Ticket size={15} color="#F84464" /> My Bookings & Passes
                    </Link>

                    <Link
                      to="/notifications"
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#374151',
                        fontWeight: '500'
                      }}
                    >
                      <Bell size={15} color="#6366F1" /> Notifications
                    </Link>

                    {isOrganizer && (
                      <Link
                        to="/organizer/events"
                        onClick={() => setShowUserDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: '#0284C7',
                          fontWeight: '600'
                        }}
                      >
                        <LayoutDashboard size={15} /> Organizer Hub
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setShowUserDropdown(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          fontSize: '13px',
                          color: '#7E22CE',
                          fontWeight: '600'
                        }}
                      >
                        <Shield size={15} /> Admin Portal
                      </Link>
                    )}

                    <div style={{ borderTop: '1px solid #F3F4F6', margin: '4px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        fontSize: '13px',
                        color: '#EF4444',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  to="/login"
                  style={{
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '7px 16px',
                    borderRadius: '6px',
                    transition: 'color 0.15s ease'
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                  style={{ padding: '7px 16px', fontSize: '13px' }}
                >
                  Sign Up
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Secondary Category Navigation Strip */}
      <div className="bms-sub-bar">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
            <Link to="/" className="bms-sub-nav-item">
              All Events
            </Link>
            <Link to="/?category=Tech" className="bms-sub-nav-item">
              💻 Tech Summits
            </Link>
            <Link to="/?category=Music" className="bms-sub-nav-item">
              🎵 Music Concerts
            </Link>
            <Link to="/?category=Sports" className="bms-sub-nav-item">
              🏏 Sports Matches
            </Link>
            <Link to="/?category=Business" className="bms-sub-nav-item">
              💼 Business & Startups
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAuthenticated && (
              <>
                <Link to="/wishlist" className="bms-sub-nav-item" style={{ color: '#E11D48', fontWeight: '600' }}>
                  <Heart size={14} /> Saved ({wishlistCount})
                </Link>
                <Link to="/history" className="bms-sub-nav-item" style={{ color: '#F84464', fontWeight: '600' }}>
                  <Ticket size={14} /> My Passes
                </Link>
              </>
            )}
            <Link to="/notifications" className="bms-sub-nav-item" style={{ color: '#94A3B8' }}>
              Offers & Updates
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
