import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../pages/auth/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    // Redirect to appropriate dashboard based on role
    return <Navigate to={currentUser?.role === 'athlete' ? '/athlete' : '/coach'} />;
  }

  return children;
};

export default PrivateRoute; 