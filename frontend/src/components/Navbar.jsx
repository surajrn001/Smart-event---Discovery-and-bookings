import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Calendar, Ticket, LogOut, LayoutDashboard, Shield, PlusCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isOrganizer, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '12px 16px',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Project Title / Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            background: '#2563eb',
            color: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            SE
          </span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            SmartEvent
          </span>
        </Link>

        {/* Navigation items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={15} /> Events
          </Link>

          {/* User Links */}
          {isAuthenticated && (
            <Link to="/history" style={{ fontSize: '14px', color: '#374151', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Ticket size={15} /> My Bookings
            </Link>
          )}

          {/* Organizer Links */}
          {isOrganizer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link
                to="/organizer/events"
                style={{ fontSize: '14px', color: '#0369a1', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <LayoutDashboard size={15} /> Organizer Hub
              </Link>
              <Link
                to="/organizer/events/new"
                style={{ fontSize: '13px', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <PlusCircle size={14} /> New Event
              </Link>
            </div>
          )}

          {/* Admin Portal Link */}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              style={{
                fontSize: '14px',
                color: '#7e22ce',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f3e8ff',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              <Shield size={14} /> Admin Portal
            </Link>
          )}

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {/* Notification icon */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  id="notification-bell-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    borderRadius: '50%',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#374151',
                    position: 'relative',
                  }}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#ef4444',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="simple-card" style={{
                    position: 'absolute',
                    top: '42px',
                    right: 0,
                    width: '300px',
                    padding: '12px',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '6px' }}>
                      <strong style={{ fontSize: '13px' }}>Notifications</strong>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', cursor: 'pointer' }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', padding: '12px 0' }}>
                        No new notifications
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {notifications.slice(0, 4).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            style={{
                              padding: '8px',
                              borderRadius: '4px',
                              background: n.is_read ? '#ffffff' : '#f0fdf4',
                              border: '1px solid #e5e7eb',
                              fontSize: '12px',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ fontWeight: '600' }}>{n.title}</div>
                            <div style={{ color: '#4b5563', marginTop: '2px' }}>{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User badge with role */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                  {user?.username}
                </span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: user?.role === 'ADMIN' ? '#f3e8ff' : user?.role === 'ORGANIZER' ? '#e0f2fe' : '#f3f4f6',
                  color: user?.role === 'ADMIN' ? '#7e22ce' : user?.role === 'ORGANIZER' ? '#0369a1' : '#4b5563',
                  textTransform: 'uppercase',
                }}>
                  {user?.role || 'USER'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '12px' }}
                title="Logout"
              >
                <LogOut size={13} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                Login
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
