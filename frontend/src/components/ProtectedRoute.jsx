import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role check specified, enforce it
  if (allowedRoles.length > 0) {
    const userRole = (user?.role || 'USER').toUpperCase();
    const hasRole = allowedRoles.map((r) => r.toUpperCase()).includes(userRole);
    // ADMIN has universal access
    if (userRole !== 'ADMIN' && !hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
