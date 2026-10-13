import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, 
  Check, 
  Ticket, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  Calendar,
  ArrowRight
} from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'ALL') return true;
    const type = (n.notification_type || n.type || '').toUpperCase();
    return type === activeTab;
  });

  const getNotifIcon = (type) => {
    switch ((type || '').toUpperCase()) {
      case 'PAYMENT':
        return <CreditCard size={18} color="#10B981" />;
      case 'BOOKING':
        return <Ticket size={18} color="#F84464" />;
      default:
        return <Sparkles size={18} color="#6366F1" />;
    }
  };

  return (
    <div style={{ background: '#F5F6F8', minHeight: '100vh', padding: '36px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '780px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={24} color="#F84464" /> Notifications & Alerts
            </h1>
            <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
              Real-time updates on ticket reservations, payments, and event reminders
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <Check size={14} /> Mark All as Read
            </button>
          )}
        </div>

        {/* Notification Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#ffffff',
          padding: '6px',
          borderRadius: '10px',
          border: '1px solid #E5E7EB',
          marginBottom: '20px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'ALL', label: 'All Notifications' },
            { id: 'BOOKING', label: 'Bookings' },
            { id: 'PAYMENT', label: 'Payments' },
            { id: 'EVENT', label: 'Events & Updates' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? '700' : '500',
                background: activeTab === tab.id ? '#F84464' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#4B5563',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of notifications */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bms-card" style={{ padding: '60px 20px', textAlign: 'center', color: '#6B7280' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <Bell size={24} color="#9CA3AF" />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
              No Notifications Found
            </h3>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
              You have no active alerts in this category.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredNotifications.map((notif) => {
              const dateStr = new Date(notif.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={notif.id}
                  className="bms-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    background: notif.is_read ? '#ffffff' : '#FFF9FA',
                    borderColor: notif.is_read ? '#E5E7EB' : '#FED7DE'
                  }}
                >
                  <div style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: notif.is_read ? '#F3F4F6' : '#FFE4E8',
                    flexShrink: 0
                  }}>
                    {getNotifIcon(notif.notification_type || notif.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: notif.is_read ? '600' : '800', color: '#111827' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {dateStr}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: '1.5', marginBottom: '8px' }}>
                      {notif.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {!notif.is_read && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#F84464',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={13} /> Mark as Read
                        </button>
                      )}

                      {(notif.notification_type === 'BOOKING' || notif.type === 'BOOKING') && (
                        <Link
                          to="/history"
                          style={{ fontSize: '12px', fontWeight: '600', color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          View Booking & QR Passes <ArrowRight size={12} />
                        </Link>
                      )}
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
