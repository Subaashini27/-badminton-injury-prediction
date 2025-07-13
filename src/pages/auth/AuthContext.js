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
          console.error('Error parsing stored user:', error);
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
  const login = async (username, password, rememberMe = false) => {
    try {
      const { user, token } = await simulateApiLogin(username, password);
      
      // Store auth data in appropriate storage
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      storage.setItem('token', token);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
      
      // Set redirect path based on role
      const path = getRoleDashboard(user.role);
      setRedirectPath(path);
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
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
      await simulateApiRegister(userData);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
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

// Simulate API login (replace with your actual API call)
const simulateApiLogin = async (username, password) => {
  // This is just for demo - replace with your actual API logic
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Demo validation
      if (username === 'demo_athlete' && password === 'password') {
        resolve({
          user: {
            id: '1',
            username: 'demo_athlete',
            fullName: 'Demo Athlete',
            email: 'athlete@example.com',
            role: 'athlete'
          },
          token: 'mock-jwt-token-athlete'
        });
      } else if (username === 'demo_coach' && password === 'password') {
        resolve({
          user: {
            id: '2',
            username: 'demo_coach',
            fullName: 'Demo Coach',
            email: 'coach@example.com',
            role: 'coach'
          },
          token: 'mock-jwt-token-coach'
        });
      } else {
        // Replace this with checking your actual registered users
        // For now we'll just use a mock database check
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = registeredUsers.find(u => u.username === username);
        
        if (user && user.password === password) {
          // Never include password in the returned user object
          const { password, ...userWithoutPassword } = user;
          resolve({
            user: userWithoutPassword,
            token: `mock-jwt-token-${user.role}`
          });
        } else {
          reject({ message: 'Invalid username or password' });
        }
      }
    }, 800); // Simulate network delay
  });
};

// Simulate API register (replace with your actual API call)
const simulateApiRegister = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Get existing users or create empty array
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Check if username or email already exists
        const usernameExists = registeredUsers.some(user => user.username === userData.username);
        const emailExists = registeredUsers.some(user => user.email === userData.email);
        
        if (usernameExists) {
          reject({ message: 'Username already exists' });
          return;
        }
        
        if (emailExists) {
          reject({ message: 'Email already exists' });
          return;
        }
        
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          fullName: userData.fullName,
          email: userData.email,
          username: userData.username,
          password: userData.password, // In a real app, NEVER store plain text passwords
          role: userData.role
        };
        
        // Save to "database"
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        resolve({ success: true });
      } catch (error) {
        reject({ message: 'Registration failed' });
      }
    }, 800); // Simulate network delay
  });
};

export default AuthContext;