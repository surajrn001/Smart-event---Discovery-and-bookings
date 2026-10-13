import React from 'react';
import { Download, Calendar, MapPin, CheckCircle2, Ticket as TicketIcon } from 'lucide-react';

export const TicketCard = ({ ticket, event, booking, eventTitle, eventDate, eventLocation }) => {
  const title = eventTitle || event?.title || 'Event Pass';
  const location = eventLocation || event?.location || 'Venue Admission';
  
  const rawDate = eventDate || event?.event_date;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : 'Upcoming Event';

  const fallbackQrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticket.ticket_code || 'SMARTEVENT-PASS')}`;

  const qrImageSrc = ticket.qr_code_url
    ? (ticket.qr_code_url.startsWith('http') ? ticket.qr_code_url : `http://127.0.0.1:8001${ticket.qr_code_url}`)
    : fallbackQrSrc;

  const downloadQR = () => {
    const src = qrImageSrc || fallbackQrSrc;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${ticket.ticket_code || 'pass'}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="ticket-pass" style={{ maxWidth: '640px', margin: '0 auto', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Cutout notches */}
      <div className="ticket-pass-notch-left" />
      <div className="ticket-pass-notch-right" />

      {/* Top Header Strip */}
      <div style={{
        background: 'linear-gradient(90deg, #1F2533 0%, #2B3148 100%)',
        color: '#ffffff',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#F84464', color: '#ffffff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
            SE PASS
          </div>
          <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.5px' }}>
            SMARTEVENT DIGITAL ENTRY PASS
          </span>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '800',
          padding: '3px 10px',
          borderRadius: '4px',
          background: ticket.is_used ? '#EF4444' : '#10B981',
          color: '#ffffff',
          letterSpacing: '0.5px'
        }}>
          {ticket.is_used ? 'CHECKED IN' : 'VALID FOR ENTRY'}
        </span>
      </div>

      {/* Ticket Body */}
      <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', background: '#ffffff' }}>
        
        {/* Left: Event Details */}
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
            {title}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#4B5563', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} color="#F84464" />
              <span>{formattedDate}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#F84464" />
              <span>{location}</span>
            </div>
          </div>

          <div style={{
            background: '#F9FAFB',
            border: '1px dashed #D1D5DB',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            color: '#374151',
            fontFamily: 'monospace',
            marginBottom: '12px'
          }}>
            Code: <strong>{ticket.ticket_code}</strong>
          </div>

          <button
            onClick={downloadQR}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            <Download size={13} /> Save QR Pass Image
          </button>
        </div>

        {/* Right: QR Code Visual Pass */}
        <div style={{
          width: '150px',
          background: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
        }}>
          <img
            src={qrImageSrc}
            alt="Gate Pass QR"
            style={{ width: '130px', height: '130px', objectFit: 'contain', display: 'block', margin: '0 auto', background: '#ffffff', borderRadius: '4px' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackQrSrc;
            }}
          />
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '6px', fontWeight: '600' }}>
            SCAN AT GATE
          </div>
        </div>

      </div>

    </div>
  );
};
