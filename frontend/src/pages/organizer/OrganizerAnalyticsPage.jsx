import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { organizerApi } from '../../api/client';
import { ArrowLeft, TrendingUp, DollarSign, Ticket, Calendar } from 'lucide-react';

export const OrganizerAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await organizerApi.getAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load organizer analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '60px 16px', textAlign: 'center' }}>
        <p>Loading sales insights...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '30px 16px 60px 16px' }}>
      <Link to="/organizer/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '13px', marginBottom: '16px' }}>
        <ArrowLeft size={15} /> Back to organizer events
      </Link>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', color: '#111827', marginBottom: '4px' }}>
          Organizer Sales Insights & Analytics
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Overview of ticket bookings, revenue generated in Rupees (₹), and remaining seats
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Total Events</span>
            <Calendar size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827' }}>
            {data?.total_events || 0}
          </div>
        </div>

        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Tickets Sold</span>
            <Ticket size={18} color="#0369a1" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0369a1' }}>
            {data?.total_tickets_sold || 0}
          </div>
        </div>

        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Total Bookings</span>
            <TrendingUp size={18} color="#7e22ce" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7e22ce' }}>
            {data?.total_bookings || 0}
          </div>
        </div>

        <div className="simple-card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6b7280', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>Gross Revenue</span>
            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>₹</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>
            ₹{data?.total_revenue?.toFixed(2) || '0.00'}
          </div>
        </div>
      </div>

      {/* Per Event Breakdown Table */}
      <h2 style={{ fontSize: '18px', color: '#111827', marginBottom: '14px' }}>
        Performance by Event
      </h2>

      {!data?.events_stats || data.events_stats.length === 0 ? (
        <div className="simple-card" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
          No event data found.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>Event</th>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>Status</th>
                <th style={{ padding: '10px 14px' }}>Price</th>
                <th style={{ padding: '10px 14px' }}>Sold / Total</th>
                <th style={{ padding: '10px 14px' }}>Revenue (₹)</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.events_stats.map((item) => (
                <tr key={item.event_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{item.title}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className="badge badge-tech">{item.category}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: item.event_status === 'CANCELLED' ? '#fee2e2' : '#e0f2fe',
                      color: item.event_status === 'CANCELLED' ? '#dc2626' : '#0369a1',
                    }}>
                      {item.event_status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>₹{item.ticket_price}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <strong>{item.tickets_sold}</strong> / {item.total_seats}
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>({item.available_seats} remaining)</div>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#16a34a' }}>
                    ₹{item.total_revenue.toFixed(2)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Link
                      to={`/organizer/events/${item.event_id}/bookings`}
                      className="btn-secondary"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      Bookings
                    </Link>
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
