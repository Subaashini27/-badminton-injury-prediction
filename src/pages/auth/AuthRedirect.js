import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// This component handles redirects based on auth state
const AuthRedirect = () => {
  const { isAuthenticated, redirectPath, clearRedirectPath, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleRedirect = () => {
      // If we have a redirect path and we're authenticated
      if (redirectPath && isAuthenticated) {
        console.log('Redirecting to:', redirectPath);
        navigate(redirectPath);
        clearRedirectPath();
        return;
      }

      // If we're authenticated but on login/register page, redirect to appropriate dashboard
      if (isAuthenticated && ['/login', '/register', '/'].includes(location.pathname)) {
        const dashboardPath = currentUser?.role === 'athlete' ? '/athlete' : '/coach';
        console.log('Redirecting to dashboard:', dashboardPath);
        navigate(dashboardPath);
        return;
      }

      // If we're not authenticated and not on login/register page, redirect to login
      if (!isAuthenticated && !['/login', '/register', '/'].includes(location.pathname)) {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
      }
    };

    handleRedirect();
  }, [isAuthenticated, redirectPath, navigate, location.pathname, currentUser, clearRedirectPath]);

  return null; // This component doesn't render anything
};

export default AuthRedirect;