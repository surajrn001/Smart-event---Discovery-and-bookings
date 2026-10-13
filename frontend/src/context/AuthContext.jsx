import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext({
  user: null,
  token: null,
  role: 'USER',
  isOrganizer: false,
  isAdmin: false,
  isAuthenticated: false,
  loading: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('smartevent_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('smartevent_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLogoutEvent = () => {
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => window.removeEventListener('auth_logout', handleLogoutEvent);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('smartevent_token', access_token);
      localStorage.setItem('smartevent_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const detail = err.response?.data?.detail || 'Invalid email or password';
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, role = 'USER') => {
    setLoading(true);
    try {
      const response = await authApi.register({ username, email, password, role });
      const { access_token, user: userData } = response.data;
      localStorage.setItem('smartevent_token', access_token);
      localStorage.setItem('smartevent_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const detail = err.response?.data?.detail || 'Registration failed';
      return { success: false, error: detail };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('smartevent_token');
    localStorage.removeItem('smartevent_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'USER',
        isOrganizer: user?.role === 'ORGANIZER' || user?.role === 'ADMIN',
        isAdmin: user?.role === 'ADMIN',
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext) || {};

