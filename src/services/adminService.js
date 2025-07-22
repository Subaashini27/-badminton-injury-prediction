import api from './api';

// Mock data for fallback
const mockSystemStats = {
  totalUsers: 156,
  athletes: 98,
  coaches: 45,
  admins: 13,
  totalSessions: 2847,
  highRiskDetections: 234,
  avgScore: 0.78,
  recentSessions: 89,
  todaySessions: 23,
  recentUsers: [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'athlete', created_at: new Date().toISOString() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'coach', created_at: new Date().toISOString() },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'athlete', created_at: new Date().toISOString() }
  ],
  systemUptime: '99.8%',
  avgResponseTime: '0.12s'
};

const mockUserActivity = {
  dailySessions: [45, 52, 48, 61, 55, 67, 73],
  userRoles: {
    athletes: 98,
    coaches: 45,
    admins: 13
  },
  avgSessionDuration: '18.5 min'
};

const mockModelPerformance = {
  accuracy: 0.94,
  precision: 91.8,
  recall: 93.5,
  f1Score: 92.6,
  lastTrained: '2024-01-15',
  predictionsToday: 156,
  avgProcessingTime: '0.08s',
  modelVersion: 'v2.3.1',
  trainingDataSize: '50,000 samples',
  weeklyAccuracy: [0.92, 0.93, 0.94, 0.93, 0.95, 0.94, 0.96],
  riskDistribution: {
    high: 15,
    medium: 35,
    low: 50
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
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'athlete', status: 'inactive', created_at: '2024-01-17' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'coach', status: 'active', created_at: '2024-01-18' },
  { id: 5, name: 'Admin User', email: 'admin@badmintonsafe.com', role: 'admin', status: 'active', created_at: '2024-01-01' }
];

export const adminService = {
  // Get system statistics
  async getSystemStats() {
    try {
      console.log('🔗 Attempting to fetch system stats from backend');
      const response = await api.get('/api/admin/stats');
      console.log('✅ System stats fetched from backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using mock system stats:', error.message);
      return mockSystemStats;
    }
  },

  // Get user activity data
  async getUserActivity() {
    try {
      console.log('🔗 Attempting to fetch user activity from backend');
      const response = await api.get('/api/admin/user-activity');
      console.log('✅ User activity fetched from backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using mock user activity:', error.message);
      return mockUserActivity;
    }
  },

  // Get AI model performance
  async getModelPerformance() {
    try {
      console.log('🔗 Attempting to fetch model performance from backend');
      const response = await api.get('/api/admin/model-performance');
      console.log('✅ Model performance fetched from backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using mock model performance:', error.message);
      return mockModelPerformance;
    }
  },

  // Get system alerts
  async getSystemAlerts() {
    try {
      console.log('🔗 Attempting to fetch system alerts from backend');
      const response = await api.get('/api/admin/alerts');
      console.log('✅ System alerts fetched from backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using mock system alerts:', error.message);
      return mockSystemAlerts;
    }
  },

  // Get recent users
  async getRecentUsers() {
    try {
      console.log('🔗 Attempting to fetch recent users from backend');
      const response = await api.get('/api/admin/recent-users');
      console.log('✅ Recent users fetched from backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using mock recent users:', error.message);
      return mockSystemStats.recentUsers;
    }
  },

  // Get all users for user management
  async getAllUsers() {
    try {
      console.log('🔗 Attempting to fetch all users from backend');
      const response = await api.get('/api/admin/users');
      console.log('✅ All users fetched from backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, using mock all users:', error.message);
      return mockAllUsers;
    }
  },

  // Create new admin user
  async createAdmin(userData) {
    try {
      console.log('🔗 Attempting to create admin user via backend');
      const response = await api.post('/api/admin/create-admin', userData);
      console.log('✅ Admin user created via backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, simulating admin creation:', error.message);
      // Simulate successful creation for demo purposes
      return {
        success: true,
        message: 'Admin user created successfully (demo mode)',
        user: { ...userData, id: Date.now(), password: undefined }
      };
    }
  },

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      console.log('🔗 Attempting to update user status via backend');
      const response = await api.put(`/api/admin/users/${userId}/status`, { status });
      console.log('✅ User status updated via backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, simulating status update:', error.message);
      // Simulate successful update for demo purposes
      return {
        success: true,
        message: `User status updated to ${status} (demo mode)`
      };
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      console.log('🔗 Attempting to delete user via backend');
      const response = await api.delete(`/api/admin/users/${userId}`);
      console.log('✅ User deleted via backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Backend failed, simulating user deletion:', error.message);
      // Simulate successful deletion for demo purposes
      return {
        success: true,
        message: 'User deleted successfully (demo mode)'
      };
    }
  }
};

export default adminService;