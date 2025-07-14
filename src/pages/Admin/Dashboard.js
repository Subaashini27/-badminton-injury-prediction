import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAnalysis } from '../../context/AnalysisContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const AdminDashboard = () => {
  const [systemStats, setSystemStats] = useState(null);
  const [modelPerformance, setModelPerformance] = useState(null);
  const [userActivity, setUserActivity] = useState(null);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    loadSystemStats();
    loadModelPerformance();
    loadUserActivity();
    loadSystemAlerts();
  }, []);

  const loadSystemStats = () => {
    // Mock system statistics - in real app, this would come from backend
    const stats = {
      totalUsers: 245,
      activeUsers: 89,
      totalSessions: 1240,
      todaySessions: 23,
      systemUptime: '99.8%',
      avgResponseTime: '0.12s',
      totalPredictions: 15420,
      highRiskDetections: 340
    };
    setSystemStats(stats);
  };

  const loadModelPerformance = () => {
    // Mock AI model performance data
    const performance = {
      accuracy: 94.2,
      precision: 91.8,
      recall: 93.5,
      f1Score: 92.6,
      lastTrained: '2024-01-15',
      predictionsToday: 156,
      avgProcessingTime: '0.08s',
      modelVersion: 'v2.3.1',
      trainingDataSize: '50,000 samples',
      weeklyAccuracy: [92.1, 93.4, 94.1, 93.8, 94.2, 94.5, 94.2],
      riskDistribution: {
        low: 65,
        medium: 25,
        high: 10
      }
    };
    setModelPerformance(performance);
  };

  const loadUserActivity = () => {
    // Mock user activity data
    const activity = {
      dailyActiveUsers: [45, 52, 48, 67, 71, 89, 78],
      userRoles: {
        athletes: 180,
        coaches: 45,
        admins: 5
      },
      sessionsPerDay: [23, 34, 28, 41, 52, 67, 45],
      avgSessionDuration: '18.5 min'
    };
    setUserActivity(activity);
  };

  const loadSystemAlerts = () => {
    const alerts = [
      {
        id: 1,
        type: 'warning',
        message: 'Model accuracy dropped below 95% threshold',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        message: 'Scheduled model retraining completed',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        resolved: true
      },
      {
        id: 3,
        type: 'success',
        message: 'System backup completed successfully',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        resolved: true
      },
      {
        id: 4,
        type: 'error',
        message: 'High API response time detected',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        resolved: false
      }
    ];
    setSystemAlerts(alerts);
  };

  const renderMetricCard = (title, value, subtitle, icon, color = 'blue') => (
    <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
        <div className="text-3xl" style={{ color }}>
          {icon}
        </div>
      </div>
    </div>
  );

  const weeklyAccuracyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Model Accuracy (%)',
        data: modelPerformance?.weeklyAccuracy || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const userActivityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Active Users',
        data: userActivity?.dailyActiveUsers || [],
        backgroundColor: '#10B981',
        borderColor: '#059669',
        borderWidth: 1
      },
      {
        label: 'Sessions per Day',
        data: userActivity?.sessionsPerDay || [],
        backgroundColor: '#F59E0B',
        borderColor: '#D97706',
        borderWidth: 1
      }
    ]
  };

  const riskDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: modelPerformance ? [
          modelPerformance.riskDistribution.low,
          modelPerformance.riskDistribution.medium,
          modelPerformance.riskDistribution.high
        ] : [],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderColor: ['#059669', '#D97706', '#DC2626'],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!systemStats || !modelPerformance || !userActivity) {
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

      {/* System Alerts */}
      {systemAlerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🚨 Active System Alerts</h2>
          <div className="space-y-3">
            {systemAlerts.filter(alert => !alert.resolved).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'border-red-500 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {renderMetricCard('Total Users', systemStats.totalUsers, `${systemStats.activeUsers} active today`, '👥', '#3B82F6')}
        {renderMetricCard('Model Accuracy', `${modelPerformance.accuracy}%`, 'Current performance', '🎯', '#10B981')}
        {renderMetricCard('System Uptime', systemStats.systemUptime, `${systemStats.avgResponseTime} avg response`, '⚡', '#F59E0B')}
        {renderMetricCard('High Risk Alerts', systemStats.highRiskDetections, 'Total detections', '⚠️', '#EF4444')}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Model Performance Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 AI Model Performance</h3>
          <div className="h-64">
            <Line data={weeklyAccuracyData} options={chartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Precision:</span>
              <span className="font-semibold ml-2">{modelPerformance.precision}%</span>
            </div>
            <div>
              <span className="text-gray-600">Recall:</span>
              <span className="font-semibold ml-2">{modelPerformance.recall}%</span>
            </div>
          </div>
        </div>

        {/* User Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 User Activity</h3>
          <div className="h-64">
            <Bar data={userActivityData} options={chartOptions} />
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Average session duration: <span className="font-semibold">{userActivity.avgSessionDuration}</span>
          </div>
        </div>
      </div>

      {/* Risk Distribution and Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Risk Distribution</h3>
          <div className="h-48">
            <Doughnut data={riskDistributionData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }} />
          </div>
        </div>

        {/* Model Information */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 AI Model Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Model Version</p>
                <p className="font-semibold">{modelPerformance.modelVersion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Trained</p>
                <p className="font-semibold">{modelPerformance.lastTrained}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Training Data Size</p>
                <p className="font-semibold">{modelPerformance.trainingDataSize}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Predictions Today</p>
                <p className="font-semibold">{modelPerformance.predictionsToday}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Processing Time</p>
                <p className="font-semibold">{modelPerformance.avgProcessingTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">F1 Score</p>
                <p className="font-semibold">{modelPerformance.f1Score}%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Retrain Model
            </button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Export Model
            </button>
            <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
              View Logs
            </button>
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

export default AdminDashboard;