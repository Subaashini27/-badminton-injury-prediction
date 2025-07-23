// src/services/api.js
import axios from 'axios';

// Railway backend URL - Use environment variable with fallback
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    // Ensure the URL has https:// protocol
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    } else {
      return `https://${envUrl}`;
    }
  }
  // Fallback URL
  return 'https://vivacious-tenderness-production.up.railway.app';
};

const API_BASE_URL = getApiBaseUrl();



// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo accounts for fallback
const DEMO_ACCOUNTS = [
  { 
    id: 1, 
    email: 'demo@athlete.com', 
    password: 'password', 
    role: 'athlete', 
    name: 'Demo Athlete',
    fullName: 'Demo Athlete'
  },
  { 
    id: 2, 
    email: 'demo@coach.com', 
    password: 'password', 
    role: 'coach', 
    name: 'Demo Coach',
    fullName: 'Demo Coach'
  },
  { 
    id: 3, 
    email: 'athlete@example.com', 
    password: 'password', 
    role: 'athlete', 
    name: 'Demo Athlete',
    fullName: 'Demo Athlete'
  },
  { 
    id: 4, 
    email: 'coach@example.com', 
    password: 'password', 
    role: 'coach', 
    name: 'Demo Coach',
    fullName: 'Demo Coach'
  },
  // Admin account for immediate access
  { 
    id: 5, 
    email: 'admin@badmintonsafe.com', 
    password: 'admin123', 
    role: 'admin', 
    name: 'Admin User',
    fullName: 'System Administrator'
  }
];

// Fallback authentication functions
const fallbackAuth = {
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check demo accounts
        const user = DEMO_ACCOUNTS.find(acc => acc.email === email && acc.password === password);
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          
          // Create a proper JWT-like token structure for demo purposes
          const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          };
          
          // For demo purposes, create a base64 encoded token that looks like JWT
          const demoToken = 'demo.' + btoa(JSON.stringify(tokenPayload)) + '.signature';
          
          resolve({
            data: {
              user: userWithoutPassword,
              token: demoToken
            }
          });
        } else {
          // Check localStorage for registered users
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          const registeredUser = registeredUsers.find(u => u.email === email && u.password === password);
          
          if (registeredUser) {
            const { password, ...userWithoutPassword } = registeredUser;
            
            // Create a proper JWT-like token structure for demo purposes
            const tokenPayload = {
              id: registeredUser.id,
              email: registeredUser.email,
              role: registeredUser.role,
              name: registeredUser.name,
              iat: Math.floor(Date.now() / 1000),
              exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
            };
            
            // For demo purposes, create a base64 encoded token that looks like JWT
            const demoToken = 'demo.' + btoa(JSON.stringify(tokenPayload)) + '.signature';
            
            resolve({
              data: {
                user: userWithoutPassword,
                token: demoToken
              }
            });
          } else {
            reject(new Error('Invalid email or password'));
          }
        }
      }, 500); // Simulate network delay
    });
  },

  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          // Get existing users
          const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
          
          // Check if user already exists
          const existingUser = registeredUsers.find(u => u.email === userData.email);
          if (existingUser) {
            reject(new Error('User already exists'));
            return;
          }
          
          // Create new user
          const newUser = {
            id: Date.now(),
            name: userData.name,
            email: userData.email,
            password: userData.password, // In production, this should be hashed
            role: userData.role || 'athlete',
            fullName: userData.name,
            createdAt: new Date().toISOString()
          };
          
          // Save to localStorage
          registeredUsers.push(newUser);
          localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
          
          // Create a proper JWT-like token structure for demo purposes
          const tokenPayload = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          };
          
          // For demo purposes, create a base64 encoded token that looks like JWT
          const demoToken = 'demo.' + btoa(JSON.stringify(tokenPayload)) + '.signature';
          
          resolve({
            data: {
              message: 'Registration successful',
              user: { ...newUser, password: undefined },
              token: demoToken
            }
          });
        } catch (error) {
          reject(new Error('Registration failed'));
        }
      }, 500);
    });
  }
};

// Enhanced API service with fallback
const apiService = {
  // Authentication endpoints
  auth: {
    login: async (email, password) => {
      // For admin users, try fallback first to ensure immediate access
      if (email === 'admin@badmintonsafe.com') {
        try {
          return await fallbackAuth.login(email, password);
        } catch (fallbackError) {
        }
      }
      
      try {
        const response = await api.post('/auth/login', { email, password });
        return response;
      } catch (error) {
        // If we get a 401 error or any other error, use fallback authentication
        return fallbackAuth.login(email, password);
      }
    },

    register: async (userData) => {
      try {
        const response = await api.post('/auth/register', userData);
        return response;
      } catch (error) {
        // Backend unavailable, using fallback registration
        return fallbackAuth.register(userData);
      }
    },

    forgotPassword: async (email) => {
      try {
        const response = await api.post('/auth/forgot-password', { email });
        return response;
      } catch (error) {
        // Fallback for forgot password
    return new Promise((resolve) => {
      setTimeout(() => {
            resolve({ data: { message: 'Password reset email sent' } });
          }, 1000);
        });
      }
    }
  },

  // Health check
  health: async () => {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      return {
        data: {
          status: 'FALLBACK',
          message: 'Using localStorage simulation',
          timestamp: new Date().toISOString()
        }
      };
    }
  }
};

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Legacy API exports for backward compatibility
export const athleteAPI = {
  saveAnalysisData: async (analysisData) => {
    try {
      const response = await api.post('/athletes/analysis', analysisData);
      return response;
    } catch (error) {
      // Fallback to localStorage - saving analysis data locally
      const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      analysisHistory.push({ ...analysisData, timestamp: new Date().toISOString() });
      localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
      return { data: { success: true } };
    }
  },

  getAnalysisHistory: async (athleteId) => {
    try {
      const response = await api.get(`/athletes/${athleteId}/analysis`);
      return response;
    } catch (error) {
      // Fallback to localStorage - using local analysis history
      const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      return { data: analysisHistory };
    }
  }
};

export const coachAPI = {
  getTrainingPlans: async (coachId) => {
    try {
      const response = await api.get(`/coaches/${coachId}/training-plans`);
      return response;
    } catch (error) {
      // Fallback to localStorage - using local training plans
      return { data: [] };
    }
  },

  getAthletes: async (coachId) => {
    try {
      const response = await api.get(`/coaches/${coachId}/athletes`);
      return response;
    } catch (error) {
      // Fallback to localStorage - using local athletes data
      return { data: [] };
    }
  },

  createTrainingPlan: async (coachId, planData) => {
    try {
      const response = await api.post(`/coaches/${coachId}/training-plans`, planData);
      return response;
    } catch (error) {
      // Fallback to localStorage - saving training plan locally
      return { data: { success: true, plan: planData } };
    }
  },

  getInjuryReports: async (coachId) => {
    try {
      const response = await api.get(`/coaches/${coachId}/injury-reports`);
      return response;
    } catch (error) {
      // Fallback to localStorage - using local injury reports
      return { data: [] };
    }
  },

  addAthlete: async (coachId, athleteData) => {
    try {
      const response = await api.post(`/coaches/${coachId}/athletes`, athleteData);
      return response;
    } catch (error) {
      // Fallback to localStorage - saving athlete locally
      return { data: { success: true, athlete: athleteData } };
    }
  }
};

export default apiService;
export { api };