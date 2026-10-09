import React from 'react';
import { Download, Calendar, MapPin, CheckCircle } from 'lucide-react';

export const TicketCard = ({ ticket, event, booking }) => {
  const qrImageSrc = ticket.qr_code_url
    ? `http://127.0.0.1:8001${ticket.qr_code_url}`
    : null;

  const eventDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Upcoming Event';

  const downloadQR = () => {
    if (qrImageSrc) {
      const a = document.createElement('a');
      a.href = qrImageSrc;
      a.download = `${ticket.ticket_code}.png`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="simple-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>
          ENTRY TICKET
        </span>
        <span style={{
          fontSize: '11px',
          fontWeight: 'bold',
          padding: '2px 8px',
          borderRadius: '4px',
          background: ticket.is_used ? '#fee2e2' : '#dcfce7',
          color: ticket.is_used ? '#dc2626' : '#16a34a'
        }}>
          {ticket.is_used ? 'USED' : 'VALID'}
        </span>
      </div>

      <div>
        <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
          {event?.title || 'Event Pass'}
        </h4>
        <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> <span>{eventDate}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={13} /> <span>{event?.location}</span>
          </div>
        </div>
      </div>

      {/* QR Code image display */}
      <div style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '12px',
        textAlign: 'center'
      }}>
        {qrImageSrc ? (
          <img
            src={qrImageSrc}
            alt="Ticket QR Code"
            style={{ width: '150px', height: '150px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
          />
        ) : (
          <p style={{ fontSize: '12px', color: '#6b7280' }}>QR Code Loading...</p>
        )}
        <div style={{ marginTop: '8px', fontSize: '12px', fontWeight: 'bold', color: '#374151' }}>
          {ticket.ticket_code}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={downloadQR}
        className="btn-secondary"
        style={{ width: '100%', fontSize: '13px' }}
      >
        <Download size={14} /> Download QR Code
      </button>
    </div>
  );
};
