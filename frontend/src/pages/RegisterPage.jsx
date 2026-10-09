import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="container" style={{ padding: '60px 16px', display: 'flex', justifyContent: 'center' }}>
      <div className="simple-card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
          Create New Account
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
          Fill in details to register on SmartEvent
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Account Type / Role:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="USER">Standard User (Explore & Book Tickets)</option>
              <option value="ORGANIZER">Event Organizer (Publish & Manage Events)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Username:
            </label>
            <input
              id="register-username"
              type="text"
              required
              className="input-field"
              placeholder="e.g. rahul_kumar"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Email ID:
            </label>
            <input
              id="register-email"
              type="email"
              required
              className="input-field"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
              Password:
            </label>
            <input
              id="register-password"
              type="password"
              required
              className="input-field"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '8px', width: '100%', padding: '10px' }}
          >
            {loading ? 'Creating account...' : `Register as ${role === 'ORGANIZER' ? 'Organizer' : 'User'}`}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '500' }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
