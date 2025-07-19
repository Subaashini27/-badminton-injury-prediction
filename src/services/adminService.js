import api from './api';

export const adminService = {
  // Get system statistics
  async getSystemStats() {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching system stats:', error);
      throw error;
    }
  },

  // Get user activity data
  async getUserActivity() {
    try {
      const response = await api.get('/admin/user-activity');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  // Get AI model performance
  async getModelPerformance() {
    try {
      const response = await api.get('/admin/model-performance');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching model performance:', error);
      throw error;
    }
  },

  // Get system alerts
  async getSystemAlerts() {
    try {
      const response = await api.get('/admin/alerts');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching system alerts:', error);
      throw error;
    }
  },

  // Get recent users
  async getRecentUsers() {
    try {
      const response = await api.get('/admin/recent-users');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching recent users:', error);
      throw error;
    }
  },

  // Get all users for user management
  async getAllUsers() {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Create new admin user
  async createAdmin(userData) {
    try {
      const response = await api.post('/admin/create-admin', userData);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { status });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default adminService; 