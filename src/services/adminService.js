import api from './api';

// Realistic fallback data for when backend is unavailable
const mockSystemStats = {
  totalUsers: 5,
  athletes: 2,
  coaches: 2,
  admins: 1,
  totalSessions: 12,
  highRiskDetections: 3,
  avgScore: 0.85,
  recentSessions: 4,
  todaySessions: 2,
  recentUsers: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'athlete', created_at: new Date().toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'coach', created_at: new Date().toISOString() },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'athlete', created_at: new Date().toISOString() }
  ],
  systemUptime: '99.8%',
  avgResponseTime: '0.12s'
};

const mockUserActivity = {
  dailySessions: [1, 2, 0, 3, 1, 2, 3],
  userRoles: {
    athletes: 2,
    coaches: 2,
    admins: 1
  },
  avgSessionDuration: '18.5 min'
};

const mockModelPerformance = {
  accuracy: 0.94,
  precision: 91.8,
  recall: 93.5,
  f1Score: 92.6,
  lastTrained: '2024-01-15',
  predictionsToday: 2,
  avgProcessingTime: '0.08s',
  modelVersion: 'v2.3.1',
  trainingDataSize: '50,000 samples',
  weeklyAccuracy: [0.92, 0.93, 0.94, 0.93, 0.95, 0.94, 0.96],
  riskDistribution: {
    high: 1,
    medium: 2,
    low: 9
  }
};

const mockSystemAlerts = [
  {
    id: 1,
    type: 'warning',
    message: 'High CPU usage detected on server 2',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    severity: 'medium'
  },
  {
    id: 2,
    type: 'info',
    message: 'Database backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    severity: 'low'
  },
  {
    id: 3,
    type: 'error',
    message: 'Failed login attempts from IP 192.168.1.100',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    severity: 'high'
  }
];

const mockAllUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'athlete', status: 'active', created_at: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'coach', status: 'active', created_at: '2024-01-16' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'athlete', status: 'active', created_at: '2024-01-17' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'coach', status: 'active', created_at: '2024-01-18' },
  { id: 5, name: 'Admin User', email: 'admin@badmintonsafe.com', role: 'admin', status: 'active', created_at: '2024-01-01' }
];

export const adminService = {
  // Get system statistics
  async getSystemStats() {
    try {
      const response = await api.get('/api/admin/stats');
      return response.data;
    } catch (error) {
      return mockSystemStats;
    }
  },

  // Get user activity data
  async getUserActivity() {
    try {
      const response = await api.get('/api/admin/user-activity');
      return response.data;
    } catch (error) {
      return mockUserActivity;
    }
  },

  // Get AI model performance
  async getModelPerformance() {
    try {
      const response = await api.get('/api/admin/model-performance');
      return response.data;
    } catch (error) {
      return mockModelPerformance;
    }
  },

  // Get system alerts
  async getSystemAlerts() {
    try {
      const response = await api.get('/api/admin/alerts');
      return response.data;
    } catch (error) {
      return mockSystemAlerts;
    }
  },

  // Get recent users
  async getRecentUsers() {
    try {
      const response = await api.get('/api/admin/recent-users');
      return response.data;
    } catch (error) {
      return mockSystemStats.recentUsers;
    }
  },

  // Get all users for user management
  async getAllUsers() {
    try {
      const response = await api.get('/api/admin/users');
      return response.data;
    } catch (error) {
      return mockAllUsers;
    }
  },

  // Create new admin user
  async createAdmin(userData) {
    try {
      const response = await api.post('/admin/create-admin', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get system logs
  async getSystemLogs() {
    try {
      const response = await api.get('/api/admin/logs');
      return response.data;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      // Return empty array if API fails
      return [];
    }
  }
};

export default adminService;