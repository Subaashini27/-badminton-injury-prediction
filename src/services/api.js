// src/services/api.js
import axios from 'axios';

// Create a base axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API service for athletes
export const athleteAPI = {
  // Dashboard data
  getDashboardData: () => api.get('/athlete/dashboard'),
  
  // Individual data endpoints
  getInjuryRiskData: () => api.get('/athlete/injury-risk'),
  getPerformanceMetrics: () => api.get('/athlete/performance-metrics'),
  getAnalysisHistory: (athleteId) => api.get(`/athletes/${athleteId}/analysis`),
  saveAnalysisData: (analysisData) => api.post('/athletes/analysis', analysisData),
  getRecentActivities: () => api.get('/athlete/recent-activities'),
  getRecommendedExercises: () => api.get('/athlete/recommended-exercises'),
  
  // Mock data for development (remove in production)
  getMockDashboardData: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            injuryRiskData: [
              { area: 'Ankle', risk: 75 },
              { area: 'Knee', risk: 45 },
              { area: 'Shoulder', risk: 30 },
              { area: 'Back', risk: 60 },
              { area: 'Wrist', risk: 25 },
            ],
            performanceData: [
              { metric: 'Speed', value: 82, change: '+5%' },
              { metric: 'Agility', value: 74, change: '+2%' },
              { metric: 'Endurance', value: 68, change: '-3%' },
              { metric: 'Strength', value: 76, change: '+7%' },
            ],
            recentActivities: [
              { date: 'Today, 10:30 AM', activity: 'Training session completed', status: 'Completed' },
              { date: 'Yesterday, 2:15 PM', activity: 'Pose analysis session', status: 'Risk Detected' },
              { date: 'Mar 18, 9:00 AM', activity: 'Updated injury history', status: 'Completed' },
            ],
            recommendedExercises: [
              { name: 'Ankle Strengthening', duration: '15 mins', priority: 'High' },
              { name: 'Shoulder Mobility', duration: '10 mins', priority: 'Medium' },
              { name: 'Core Stability', duration: '20 mins', priority: 'High' },
              { name: 'Knee Stabilization', duration: '12 mins', priority: 'Medium' },
            ]
          }
        });
      }, 800);
    });
  }
};

// API service for coaches
export const coachAPI = {
  // Dashboard data
  getDashboardData: (coachId, timeRange = 'week') => 
    api.get(`/coaches/${coachId}/dashboard?timeRange=${timeRange}`),
  
  // Athletes management
  getAthletes: (coachId) => api.get(`/coaches/${coachId}/athletes`),
  getAthleteDetails: (athleteId) => api.get(`/athletes/${athleteId}`),
  
  // Injury reports
  getInjuryReports: (coachId) => api.get(`/coaches/${coachId}/injury-reports`),
  
  // Training plans
  getTrainingPlans: (coachId) => api.get(`/coaches/${coachId}/training-plans`),
  createTrainingPlan: (coachId, planData) => api.post(`/coaches/${coachId}/training-plans`, planData),
  
  // Training sessions
  getTrainingSessions: (coachId) => api.get(`/coaches/${coachId}/training-sessions`),
  
  // Analytics
  getAnalytics: (coachId) => api.get(`/coaches/${coachId}/analytics`),
  
  // Mock data for development (remove in production)
  getMockAthletes: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              age: 22,
              experience: '3 years',
              level: 'Intermediate',
              risk_level: 0.3,
              last_active: '2024-01-15T10:30:00Z'
            },
            {
              id: 2,
              name: 'Jane Smith',
              email: 'jane@example.com',
              age: 25,
              experience: '5 years',
              level: 'Advanced',
              risk_level: 0.6,
              last_active: '2024-01-14T14:15:00Z'
            }
          ]
        });
      }, 800);
    });
  },
  
  getMockInjuryReports: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            {
              id: 1,
              athlete_name: 'John Doe',
              injury_type: 'Ankle Sprain',
              date_occurred: '2024-01-10',
              status: 'Recovering',
              description: 'Mild ankle sprain during training'
            },
            {
              id: 2,
              athlete_name: 'Jane Smith',
              injury_type: 'Shoulder Strain',
              date_occurred: '2024-01-05',
              status: 'Recovered',
              description: 'Overuse injury from intensive training'
            }
          ]
        });
      }, 800);
    });
  }
};

export default api;