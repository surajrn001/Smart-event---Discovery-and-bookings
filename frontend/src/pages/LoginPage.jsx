import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemoCreds = (demEmail, demPass) => {
    setEmail(demEmail);
    setPassword(demPass);
    setError('');
  };

  return (
    <div style={{ background: '#F5F6F8', minHeight: 'calc(100vh - 120px)', padding: '60px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="bms-card" style={{ width: '100%', maxWidth: '420px', padding: '32px 28px' }}>
        
        {/* Header Icon */}
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
            Welcome Back
          </h2>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>
            Sign in to discover events and manage your digital entry tickets
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

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                id="login-email"
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
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              <input
                id="login-password"
                type="password"
                required
                className="input-field"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Quick Demo Accounts (For easy evaluation) */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
            ⚡ 1-Click Quick Demo Fill
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fillDemoCreds('rahul@example.com', 'password123')}
              style={{
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: '600',
                background: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Demo User
            </button>
            <button
              type="button"
              onClick={() => fillDemoCreds('organizer@smartevent.com', 'organizerpass123')}
              style={{
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: '600',
                background: '#EFF6FF',
                color: '#1E40AF',
                border: '1px solid #BFDBFE',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => fillDemoCreds('admin@smartevent.com', 'adminpassword123')}
              style={{
                padding: '6px 4px',
                fontSize: '11px',
                fontWeight: '600',
                background: '#FDF4FF',
                color: '#86198F',
                border: '1px solid #F0ABFC',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
          </div>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#F84464', fontWeight: '700' }}>
            Register Now
          </Link>
        </div>

      </div>
    </div>
  );
};
