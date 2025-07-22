import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    athletes: 0,
    coaches: 0,
    admins: 0,
    totalSessions: 0,
    highRiskDetections: 0,
    avgScore: 0,
    recentSessions: 0,
    todaySessions: 0,
    recentUsers: []
  });
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [stats, alerts] = await Promise.all([
        adminService.getSystemStats(),
        adminService.getSystemAlerts()
      ]);
      setDashboardStats(stats);
      setSystemAlerts(alerts);
    } catch (error) {
      // Handle or log error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      // Update alert status locally
      setSystemAlerts(prev => 
        prev.map(alert => 
          alert.id === alertId ? { ...alert, status: 'resolved' } : alert
        )
      );
      // You can add API call here to update alert status on backend
    } catch (error) {
      // Handle or log error appropriately
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System monitoring and AI model management</p>
      </div>

      {/* System Status Alert */}
      <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
          <span className="text-green-800 font-medium">System Online - All services operational</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{dashboardStats.totalUsers}</p>
              <p className="text-sm text-gray-600">{dashboardStats.athletes} athletes, {dashboardStats.coaches} coaches</p>
            </div>
            <div className="text-3xl text-blue-600">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Model Accuracy</h3>
              <p className="text-2xl font-bold text-green-600">{dashboardStats.avgScore}%</p>
              <p className="text-sm text-gray-600">Current performance</p>
            </div>
            <div className="text-3xl text-green-600">🎯</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">High Risk Detections</h3>
              <p className="text-2xl font-bold text-yellow-600">{dashboardStats.highRiskDetections}</p>
              <p className="text-sm text-gray-600">Recent sessions</p>
            </div>
            <div className="text-3xl text-yellow-600">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Total Sessions</h3>
              <p className="text-2xl font-bold text-red-600">{dashboardStats.totalSessions}</p>
              <p className="text-sm text-gray-600">{dashboardStats.todaySessions} today</p>
            </div>
            <div className="text-3xl text-red-600">📊</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Recent Users</h3>
          <div className="space-y-3">
            {dashboardStats.recentUsers && dashboardStats.recentUsers.length > 0 ? (
              dashboardStats.recentUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{user.name || user.username || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'coach' ? 'bg-green-100 text-green-800' : 
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role || 'athlete'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No recent users found
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ System Alerts</h3>
          <div className="space-y-3">
            {systemAlerts && systemAlerts.length > 0 ? (
              systemAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{alert.message || alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.timestamp || alert.time || 'Recently'}</p>
                    </div>
                    {alert.status === 'resolved' ? (
                      <span className="text-sm text-green-600">Resolved</span>
                    ) : (
                      <button 
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No system alerts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔧 System Management</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              View System Logs
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Backup Database
            </button>
            <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700">
              Configure Settings
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 User Management</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Manage Users
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Export User Data
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700">
              User Analytics
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Reports</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Performance Report
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              Usage Analytics
            </button>
            <button className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              Security Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;