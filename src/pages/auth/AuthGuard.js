import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, currentUser } = useAuth();
  
  // Enhanced debugging
  useEffect(() => {
    console.log('AuthGuard checks:', {
      isAuthenticated,
      currentUserRole: currentUser?.role,
      allowedRoles,
      path: window.location.pathname
    });
  }, [isAuthenticated, currentUser, allowedRoles]);

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Check role if allowedRoles is provided
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser?.role)) {
    console.log(`Role ${currentUser?.role} not included in ${allowedRoles.join(', ')}, redirecting to home`);
    return <Navigate to="/" replace />;
  }
  
  // All checks passed, render children
  console.log('Auth checks passed, rendering content for', currentUser?.role);
  return children;
};

export default AuthGuard;