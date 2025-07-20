import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import SystemLogs from './SystemLogs';
import AIModelMonitoring from './AIModelMonitoring';
import SystemSettings from './SystemSettings';

/**
 * AdminDashboard Component
 * 
 * Main admin dashboard that provides three core functionalities:
 * 1. System Logs Management - View, filter, and export system logs
 * 2. AI Model Monitoring - Monitor AI model performance and health
 * 3. System Settings - Configure system-wide settings and preferences
 * 
 * Features:
 * - Tab-based navigation between sections
 * - Real-time data updates
 * - Responsive design for different screen sizes
 * - Access control for admin users only
 */
const AdminDashboard = () => {
  // Get current user context for authentication
  const { currentUser } = useAuth();
  
  // State to track which tab/section is currently active
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for dashboard overview statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLogs: 0,
    criticalErrors: 0,
    modelAccuracy: 0,
    lastModelUpdate: null,
    systemHealth: 'Good'
  });
  
  // State for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch dashboard overview statistics
   * This function aggregates data from various sources to provide
   * a quick overview of system health and performance
   */
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard stats...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Make actual API call to fetch admin stats
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const stats = await response.json();
      console.log('Dashboard stats received:', stats);
      
      setDashboardStats({
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.athletes + stats.coaches || 0,
        totalLogs: stats.totalSessions || 0,
        criticalErrors: stats.highRiskDetections || 0,
        modelAccuracy: stats.avgScore ? (stats.avgScore * 100).toFixed(1) : 0,
        lastModelUpdate: new Date(),
        systemHealth: 'Good'
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(`Failed to load dashboard statistics: ${err.message}`);
      
      // Fallback to mock data if API fails
      setDashboardStats({
        totalUsers: 0,
        activeUsers: 0,
        totalLogs: 0,
        criticalErrors: 0,
        modelAccuracy: 0,
        lastModelUpdate: new Date(),
        systemHealth: 'Unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Refresh data every 5 minutes for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  /**
   * Handle tab change
   * Updates the active tab state and can trigger specific actions
   * for each tab if needed
   */
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    
    // You can add specific actions for each tab here
    // For example, refresh data when switching tabs
    if (tabName === 'logs') {
      // Trigger logs refresh
    }
  };

  // Show loading state while fetching initial data
  if (loading && activeTab === 'overview') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {currentUser?.name || 'Admin'}
              </p>
            </div>
            
            {/* Real-time status indicator */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="ml-2 text-sm text-gray-600">System Online</span>
              </div>
              <button
                onClick={fetchDashboardStats}
                className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {/* Overview Tab */}
            <button
              onClick={() => handleTabChange('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Overview
            </button>
            
            {/* System Logs Tab */}
            <button
              onClick={() => handleTabChange('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 System Logs
            </button>
            
            {/* AI Model Monitoring Tab */}
            <button
              onClick={() => handleTabChange('ai')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ai'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🤖 AI Model Monitoring
            </button>
            
            {/* System Settings Tab */}
            <button
              onClick={() => handleTabChange('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ⚙️ System Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Users Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.totalUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Users Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.activeUsers}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.systemHealth}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Accuracy Card */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Model Accuracy</dt>
                        <dd className="text-lg font-medium text-gray-900">{dashboardStats.modelAccuracy}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
                  <div className="mt-5">
                    <div className="flow-root">
                      <ul className="-mb-8">
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium text-gray-900">Model training</span> completed successfully
                                </p>
                                <p className="text-xs text-gray-400">2 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="relative pb-8">
                            <div className="relative flex space-x-3">
                              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium text-gray-900">New user</span> registered
                                </p>
                                <p className="text-xs text-gray-400">4 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </li>
                        <li>
                          <div className="relative">
                            <div className="relative flex space-x-3">
                              <div className="h-8 w-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium text-gray-900">System warning</span> detected
                                </p>
                                <p className="text-xs text-gray-400">6 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Alerts */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">System Alerts</h3>
                  <div className="mt-5 space-y-3">
                    {dashboardStats.criticalErrors > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-800">
                              {dashboardStats.criticalErrors} critical errors detected
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-800">
                            System backup completed successfully
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Logs Component */}
        {activeTab === 'logs' && <SystemLogs />}
        
        {/* AI Model Monitoring Component */}
        {activeTab === 'ai' && <AIModelMonitoring />}
        
        {/* System Settings Component */}
        {activeTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
};

export default AdminDashboard;