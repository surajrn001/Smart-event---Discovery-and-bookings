import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Ticket, 
  CreditCard, 
  Heart, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  X,
  Camera,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
];

const CITIES = ['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

export const ProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Edit form modal state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    city: '',
    bio: '',
    avatar_url: '',
  });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        phone: user.phone || '',
        city: user.city || 'Bangalore',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await authApi.getActivitySummary();
      setSummary(res.data);
    } catch (err) {
      console.log('Error loading activity summary:', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await authApi.updateProfile({
        username: formData.username.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        bio: formData.bio.trim(),
        avatar_url: formData.avatar_url.trim(),
      });

      const updatedUser = res.data;
      updateUserData(updatedUser);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        setIsEditing(false);
        setStatusMsg({ type: '', text: '' });
      }, 1200);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to update profile.';
      setStatusMsg({ type: 'error', text: detail });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#F5F6F8', minHeight: '85vh', padding: '36px 0 80px 0' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Profile Card Header */}
        <div className="bms-card" style={{ padding: '32px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle decorative background banner */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '110px',
            background: 'linear-gradient(135deg, #1F2533 0%, #2B3148 100%)',
          }} />

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '20px'
            }}>
              {/* Avatar + Basic Details */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  border: '4px solid #ffffff',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #F84464 0%, #D81B60 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '36px',
                  fontWeight: '800',
                  flexShrink: 0
                }}>
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '';
                      }}
                    />
                  ) : (
                    user?.username?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {user?.username}
                    </h1>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: user?.role === 'ADMIN' ? '#7E22CE' : user?.role === 'ORGANIZER' ? '#0284C7' : '#10B981',
                      background: user?.role === 'ADMIN' ? '#F3E8FF' : user?.role === 'ORGANIZER' ? '#E0F2FE' : '#ECFDF5',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase'
                    }}>
                      {user?.role}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> {user?.email}
                  </p>
                </div>
              </div>

              {/* Edit Profile CTA */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  borderRadius: '8px'
                }}
              >
                <Edit3 size={15} /> Edit Profile
              </button>
            </div>

            {/* Profile Meta Strip */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #F3F4F6',
              fontSize: '13px',
              color: '#4B5563'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#F84464" />
                <span><strong>City:</strong> {user?.city || 'Bangalore'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Phone size={15} color="#10B981" />
                <span><strong>Phone:</strong> {user?.phone || 'Not provided'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#6366F1" />
                <span><strong>Verified Account:</strong> Active</span>
              </div>
            </div>

            {user?.bio && (
              <div style={{ marginTop: '14px', background: '#F8FAFC', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
                "{user.bio}"
              </div>
            )}
          </div>
        </div>

        {/* Account Activity & Booking Summary */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Account Activity Summary
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {/* Total Bookings */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Bookings</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#FFF0F2', color: '#F84464' }}>
                  <Ticket size={18} />
                </div>
              </div>
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>
                {loadingSummary ? '...' : summary?.total_bookings ?? 0}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Successful ticket orders</span>
            </div>

            {/* Total Tickets */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Passes</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#ECFDF5', color: '#10B981' }}>
                  <Sparkles size={18} />
                </div>
              </div>
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>
                {loadingSummary ? '...' : summary?.total_tickets ?? 0}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>QR tickets generated</span>
            </div>

            {/* Total Spend */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Total Spent</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#EFF6FF', color: '#2563EB' }}>
                  <CreditCard size={18} />
                </div>
              </div>
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>
                ₹{loadingSummary ? '...' : (summary?.total_spent ?? 0).toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Across all bookings</span>
            </div>

            {/* Saved Wishlist */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Wishlist</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#FFF1F2', color: '#E11D48' }}>
                  <Heart size={18} />
                </div>
              </div>
              <span style={{ fontSize: '26px', fontWeight: '800', color: '#111827' }}>
                {loadingSummary ? '...' : summary?.wishlist_count ?? 0}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Saved for later</span>
            </div>

            {/* Top Category */}
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>Top Category</span>
                <div style={{ padding: '6px', borderRadius: '8px', background: '#F5F3FF', color: '#7C3AED' }}>
                  <Sparkles size={18} />
                </div>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#111827' }}>
                {loadingSummary ? '...' : summary?.favorite_category || 'Music'}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Most booked interest</span>
            </div>
          </div>
        </div>

        {/* Quick Nav Action Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          <Link
            to="/history"
            className="bms-card"
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#FFF0F2', color: '#F84464' }}>
                <Ticket size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  My Bookings & QR Passes
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                  View e-tickets, check verification codes and booking receipts
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="#94A3B8" />
          </Link>

          <Link
            to="/wishlist"
            className="bms-card"
            style={{
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '10px', background: '#FDF2F8', color: '#DB2777' }}>
                <Heart size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Saved Events (Wishlist)
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '3px 0 0 0' }}>
                  Quickly review your bookmarked shows and checkout
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="#94A3B8" />
          </Link>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>
                  Edit Account Profile
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Username */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Full Name / Username
                  </label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter your name"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                {/* City */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Preferred City
                  </label>
                  <select
                    className="input-field"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Short Bio / Interests
                  </label>
                  <textarea
                    rows={2}
                    className="input-field"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="E.g. Live music lover, tech enthusiast and concert goer in Bangalore."
                  />
                </div>

                {/* Avatar URL or Preset Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                    Profile Picture / Avatar URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                    style={{ marginBottom: '8px' }}
                  />
                  
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '8px' }}>
                    Or select a ready-to-use avatar preset:
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar_url: preset })}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: formData.avatar_url === preset ? '2px solid #F84464' : '2px solid #E5E7EB',
                          padding: 0,
                          cursor: 'pointer'
                        }}
                      >
                        <img src={preset} alt="preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {statusMsg.text && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: statusMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                    color: statusMsg.type === 'success' ? '#059669' : '#DC2626'
                  }}>
                    {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{statusMsg.text}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
