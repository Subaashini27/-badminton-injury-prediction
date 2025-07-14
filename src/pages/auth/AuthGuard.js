import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // Enhanced debugging
  useEffect(() => {
    // Debugging removed for production
  }, [isAuthenticated, currentUser, allowedRoles]);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role if allowedRoles is provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to="/" replace />;
  }
  
  // All checks passed, render children
  return children;
};

export default AuthGuard;