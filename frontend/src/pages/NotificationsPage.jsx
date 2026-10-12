import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, CreditCard, Ticket, Calendar, ShieldAlert } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [filterType, setFilterType] = useState('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'ALL') return true;
    return (n.type || '').toUpperCase() === filterType;
  });

  const getNotificationIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'PAYMENT':
        return <CreditCard size={18} color="#16a34a" />;
      case 'BOOKING':
        return <Ticket size={18} color="#2563eb" />;
      default:
        return <Calendar size={18} color="#d97706" />;
    }
  };

  return (
    <div className="container" style={{ padding: '30px 16px 80px 16px', maxWidth: '750px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#111827', margin: '0 0 4px 0' }}>
            Notification Center
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Updates on ticket bookings, payment transactions, and event changes
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary" style={{ fontSize: '13px' }}>
            <Check size={14} /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
        {[
          { id: 'ALL', label: 'All' },
          { id: 'BOOKING', label: 'Bookings' },
          { id: 'PAYMENT', label: 'Payments' },
          { id: 'EVENT', label: 'Events' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              border: 'none',
              background: filterType === tab.id ? '#2563eb' : '#f3f4f6',
              color: filterType === tab.id ? '#ffffff' : '#4b5563',
              fontWeight: '500'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading notifications...</p>
      ) : filteredNotifications.length === 0 ? (
        <div className="simple-card" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
          <Bell size={40} color="#9ca3af" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '16px', color: '#111827', marginBottom: '4px' }}>No Notifications</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>
            {filterType === 'ALL'
              ? 'You are all caught up! No notifications right now.'
              : `No ${filterType.toLowerCase()} notifications found.`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.map((n) => {
            const dateStr = new Date(n.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={n.id}
                className="simple-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  background: n.is_read ? '#ffffff' : '#f0fdf4',
                  borderColor: n.is_read ? '#e5e7eb' : '#bbf7d0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px', background: '#f9fafb', padding: '6px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    {getNotificationIcon(n.type)}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0 6px 0', lineHeight: '1.5' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {dateStr}
                    </div>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '12px', whiteSpace: 'nowrap' }}
                    title="Mark as read"
                  >
                    <Check size={12} /> Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
