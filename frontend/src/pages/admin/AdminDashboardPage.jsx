import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/client';
import { Users, Calendar, Ticket, TrendingUp, Shield, ArrowUpRight } from 'lucide-react';

export const AdminDashboardPage = () => {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [popular, setPopular] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, events, bookings
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [ovRes, trRes, popRes, uRes, eRes, bRes] = await Promise.all([
          adminApi.getOverview(),
          adminApi.getSalesTrends(),
          adminApi.getPopularEvents(),
          adminApi.getAllUsers(),
          adminApi.getAllEvents(),
          adminApi.getAllBookings(),
        ]);
        setOverview(ovRes.data);
        setTrends(trRes.data);
        setPopular(popRes.data);
        setUsersList(uRes.data);
        setEventsList(eRes.data);
        setBookingsList(bRes.data);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p>Loading Admin Dashboard & Platform Analytics...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#f3e8ff', padding: '8px', borderRadius: '8px' }}>
          <Shield size={24} color="#7e22ce" />
        </div>
        <div>
          <h1 style={{ fontSize: '24px', color: '#111827', margin: 0 }}>
            Admin Portal & Platform Analytics
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            Full system visibility, user management, and ticket revenue metrics
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>REGISTERED USERS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            {overview?.total_users || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px' }}>
            {overview?.total_organizers || 0} organizers
          </div>
        </div>

        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>TOTAL EVENTS</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            {overview?.total_events || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}>
            {overview?.active_events || 0} active/upcoming
          </div>
        </div>

        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>TICKETS SOLD</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
            {overview?.total_tickets_sold || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {overview?.total_bookings || 0} confirmed bookings
          </div>
        </div>

        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>GROSS PLATFORM REVENUE</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            ₹{overview?.total_revenue?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Processed via SmartEvent
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '20px' }}>
        {[
          { id: 'overview', label: 'Platform Analytics & Trends' },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'events', label: `Events (${eventsList.length})` },
          { id: 'bookings', label: `All Bookings (${bookingsList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #2563eb' : '2px solid transparent',
              background: 'none',
              fontWeight: activeTab === tab.id ? '600' : '500',
              color: activeTab === tab.id ? '#2563eb' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & TRENDS */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Daily Sales Trends */}
          <div className="simple-card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '16px', color: '#111827', marginBottom: '14px' }}>
              Daily Ticket Sales (Last 14 Days)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {trends.map((t) => (
                <div key={t.date} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#4b5563', width: '70px' }}>{t.date}</span>
                  <div style={{ flexGrow: 1, margin: '0 12px', background: '#f3f4f6', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, (t.tickets_sold / 10) * 100)}%`,
                      background: '#2563eb',
                      height: '100%',
                    }} />
                  </div>
                  <span style={{ fontWeight: '600', color: '#111827', width: '80px', textAlign: 'right' }}>
                    {t.tickets_sold} tickets
                  </span>
                  <span style={{ color: '#16a34a', width: '70px', textAlign: 'right' }}>
                    ₹{t.revenue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Events */}
          <div className="simple-card" style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '16px', color: '#111827', marginBottom: '14px' }}>
              Top Performing Events (By Sales & Revenue)
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {popular.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#111827' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.category} • ₹{item.ticket_price}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', color: '#0369a1', fontSize: '14px' }}>
                      {item.tickets_sold} sold
                    </div>
                    <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                      ₹{item.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>User ID</th>
                <th style={{ padding: '10px 14px' }}>Username</th>
                <th style={{ padding: '10px 14px' }}>Email</th>
                <th style={{ padding: '10px 14px' }}>Role</th>
                <th style={{ padding: '10px 14px' }}>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>#{u.id}</td>
                  <td style={{ padding: '10px 14px' }}>{u.username}</td>
                  <td style={{ padding: '10px 14px', color: '#4b5563' }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: u.role === 'ADMIN' ? '#f3e8ff' : u.role === 'ORGANIZER' ? '#e0f2fe' : '#f3f4f6',
                      color: u.role === 'ADMIN' ? '#7e22ce' : u.role === 'ORGANIZER' ? '#0369a1' : '#4b5563',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: EVENTS */}
      {activeTab === 'events' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>ID</th>
                <th style={{ padding: '10px 14px' }}>Title</th>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>Organizer ID</th>
                <th style={{ padding: '10px 14px' }}>Price</th>
                <th style={{ padding: '10px 14px' }}>Seats Remaining</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {eventsList.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>#{e.id}</td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{e.title}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-tech">{e.category}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>{e.organizer_id ? `User #${e.organizer_id}` : 'Platform'}</td>
                  <td style={{ padding: '10px 14px' }}>₹{e.ticket_price}</td>
                  <td style={{ padding: '10px 14px' }}>{e.available_seats} / {e.total_seats}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: e.event_status === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                      color: e.event_status === 'CANCELLED' ? '#dc2626' : '#15803d',
                    }}>
                      {e.event_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Booking ID</th>
                <th style={{ padding: '10px 14px' }}>Event ID</th>
                <th style={{ padding: '10px 14px' }}>User ID</th>
                <th style={{ padding: '10px 14px' }}>Qty</th>
                <th style={{ padding: '10px 14px' }}>Total Price</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {bookingsList.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>#{b.id}</td>
                  <td style={{ padding: '10px 14px' }}>Event #{b.event_id}</td>
                  <td style={{ padding: '10px 14px' }}>User #{b.user_id}</td>
                  <td style={{ padding: '10px 14px' }}>{b.ticket_quantity}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>₹{b.total_price}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: b.booking_status === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                      color: b.booking_status === 'CANCELLED' ? '#dc2626' : '#15803d',
                    }}>
                      {b.booking_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6b7280' }}>
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
