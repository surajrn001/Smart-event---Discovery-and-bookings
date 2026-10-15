import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatbotApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Flame, 
  Music, 
  Laptop, 
  Ticket, 
  HelpCircle, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Calendar,
  MapPin
} from 'lucide-react';

const QUICK_SUGGESTIONS = [
  { label: '🔥 Trending Events', prompt: 'Show me the most popular trending events right now' },
  { label: '🎵 Music Concerts', prompt: 'Recommend top music concerts and live gigs' },
  { label: '💻 Tech Summits', prompt: 'What tech and developer conferences are coming up?' },
  { label: '🎟️ My Bookings', prompt: 'Where can I see my bookings and tickets?' },
  { label: '🎫 QR Code Help', prompt: 'How do digital QR passes work at the gate?' },
];

export const ChatbotWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! 👋 I'm your SmartEvent AI Concierge. Ask me to discover concerts, find tech conferences, check your bookings, or assist with ticket check-ins!",
      suggested_events: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend = null) => {
    const message = (textToSend || inputText).trim();
    if (!message || loading) return;

    const userMsgId = 'user_' + Date.now();
    const newUserMsg = {
      id: userMsgId,
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputText('');
    setLoading(true);

    try {
      // Build conversation history for context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await chatbotApi.sendMessage({
        message,
        city: user?.city || 'Bangalore',
        conversation_history: history,
      });

      const botReply = res.data;
      const botMsgId = 'bot_' + Date.now();

      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          sender: 'bot',
          text: botReply.reply,
          suggested_events: botReply.suggested_events || [],
          intent: botReply.intent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          text: "I'm having a brief connection issue. Please check your internet connection or browse our homepage for live events!",
          suggested_events: [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'linear-gradient(135deg, #F84464 0%, #D81B60 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            boxShadow: '0 8px 24px rgba(248, 68, 100, 0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '14px',
            zIndex: 1300,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(248, 68, 100, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(248, 68, 100, 0.45)';
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex'
          }}>
            <Bot size={20} />
          </div>
          <span>Ask AI Assistant</span>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 6px #10B981'
          }} />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '380px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
          maxHeight: 'calc(100vh - 48px)',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1350,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #1F2533 0%, #2B3148 100%)',
            color: '#ffffff',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #383F55'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F84464 0%, #D81B60 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={20} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800' }}>SmartEvent AI</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10B981',
                    padding: '1px 6px',
                    borderRadius: '8px'
                  }}>
                    ONLINE
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                  Live Event Assistant & Concierge
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#CBD5E1',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Suggestions Strip */}
          <div style={{
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '8px 12px',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}>
            {QUICK_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(s.prompt)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#334155',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F84464';
                  e.currentTarget.style.color = '#F84464';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.color = '#334155';
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Chat Messages List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: '#F9FAFB'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '90%',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.sender === 'user' ? '#F84464' : '#ffffff',
                  color: msg.sender === 'user' ? '#ffffff' : '#1F2937',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  boxShadow: msg.sender === 'user' ? '0 2px 6px rgba(248, 68, 100, 0.3)' : '0 2px 6px rgba(0,0,0,0.06)',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E5E7EB',
                  whiteSpace: 'pre-line'
                }}>
                  {msg.text}
                </div>

                {/* Render Suggested Events if any */}
                {msg.suggested_events && msg.suggested_events.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', width: '100%' }}>
                    {msg.suggested_events.map((evt) => (
                      <div
                        key={evt.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '10px',
                          border: '1px solid #E5E7EB',
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                      >
                        <img
                          src={evt.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=200&q=80'}
                          alt={evt.title}
                          style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#111827',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {evt.title}
                          </h4>
                          <span style={{ fontSize: '11px', color: '#6B7280', display: 'block', marginTop: '2px' }}>
                            {evt.location} • ₹{evt.ticket_price}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(`/events/${evt.id}`);
                          }}
                          style={{
                            background: '#F84464',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          Book
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '3px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                background: '#ffffff',
                border: '1px solid #E5E7EB',
                borderRadius: '14px 14px 14px 2px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F84464', animation: 'bounce 1s infinite 0.1s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F84464', animation: 'bounce 1s infinite 0.2s' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F84464', animation: 'bounce 1s infinite 0.3s' }} />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div style={{
            padding: '12px',
            background: '#ffffff',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <input
              type="text"
              placeholder="Ask for recommendations, ticket help..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #D1D5DB',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
              style={{
                background: !inputText.trim() || loading ? '#E5E7EB' : '#F84464',
                color: !inputText.trim() || loading ? '#9CA3AF' : '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 14px',
                cursor: !inputText.trim() || loading ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
