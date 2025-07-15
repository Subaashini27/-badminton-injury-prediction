import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setIsAuthenticated(true);
          // Set initial redirect path based on role
          setRedirectPath(getRoleDashboard(user.role));
        } catch (error) {
          // Remove console.error for production
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function without navigation (navigation will be handled by components)
  const login = async (emailOrUsername, password, rememberMe = false) => {
    try {
      // Import the API service
      const { default: apiService } = await import('../../services/api');
      
      const response = await apiService.auth.login(emailOrUsername, password);
      const { user, token } = response.data;
      
      // Store auth data in appropriate storage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      storage.setItem('token', token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Set redirect path based on role
      const path = getRoleDashboard(user.role);
      setRedirectPath(path);
      
      return user;
    } catch (error) {
      // Remove console.error for production
      throw new Error(error.message || 'Login failed');
    }
  };

  // Logout function
  const logout = () => {
    // Clear all storage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    setCurrentUser(null);
    setIsAuthenticated(false);
    setRedirectPath('/login');
  };

  // Register function
  const register = async (userData) => {
    try {
      // Import the API service
      const { default: apiService } = await import('../../services/api');
      
      await apiService.auth.register(userData);
      return { success: true };
    } catch (error) {
      // Remove console.error for production
      throw new Error(error.message || 'Registration failed');
    }
  };

  // Helper function to get the dashboard route based on user role
  const getRoleDashboard = (role) => {
    switch (role?.toLowerCase()) {
      case 'athlete':
        return '/athlete';
      case 'coach':
        return '/coach';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  // Get current user role
  const getUserRole = () => {
    return currentUser?.role?.toLowerCase() || null;
  };

  // Reset redirect path after navigation is complete
  const clearRedirectPath = () => {
    setRedirectPath(null);
  };

  // Provide context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    getRoleDashboard,
    getUserRole,
    redirectPath,
    clearRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Note: Authentication now uses the API service with fallback to localStorage simulation

export default AuthContext;