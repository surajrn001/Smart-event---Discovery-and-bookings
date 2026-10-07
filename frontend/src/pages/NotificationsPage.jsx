import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check } from 'lucide-react';

export const NotificationsPage = () => {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', color: '#111827' }}>Notifications</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Updates and booking reminders</p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary" style={{ fontSize: '13px' }}>
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="simple-card" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
          <Bell size={36} color="#9ca3af" style={{ marginBottom: '8px' }} />
          <p>No notifications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((n) => {
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
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: n.is_read ? '#ffffff' : '#f0fdf4',
                  borderColor: n.is_read ? '#e5e7eb' : '#bbf7d0',
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#4b5563', margin: '4px 0' }}>
                    {n.message}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {dateStr}
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
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
