import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, User, Mail, Lock, Shield, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await register(username, email, password, role);
    setLoading(false);

    if (res.success) {
      if (res.user?.role === 'ORGANIZER') {
        navigate('/organizer/events');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error || 'Registration failed. Try with different email.');
    }
  };

  return (
    <div style={{ background: '#F5F6F8', minHeight: 'calc(100vh - 120px)', padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="bms-card" style={{ width: '100%', maxWidth: '440px', padding: '32px 28px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F84464 0%, #D81B60 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: '0 4px 12px rgba(248, 68, 100, 0.35)'
          }}>
            <Ticket size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827' }}>
            Create Your Account
          </h2>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>
            Join SmartEvent to book tickets, unlock discounts, and manage events
          </p>
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
            padding: '12px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Account Type / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="USER">Standard User (Discover & Book Event Tickets)</option>
              <option value="ORGANIZER">Event Organizer (Create & Manage Shows)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                id="register-username"
                type="text"
                required
                className="input-field"
                placeholder="e.g. suraj_event"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                id="register-email"
                type="email"
                required
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Password (min. 6 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                id="register-password"
                type="password"
                required
                className="input-field"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '6px' }}
          >
            {loading ? 'Creating Account...' : 'Register Now'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#F84464', fontWeight: '700' }}>
            Sign In here
          </Link>
        </div>

      </div>
    </div>
  );
};
