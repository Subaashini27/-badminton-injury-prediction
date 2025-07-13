import React from 'react';

const CoachAnalytics = () => {
  // Demo data - replace with real data from your backend
  const performanceData = {
    teamMetrics: {
      averagePerformance: 82,
      totalSessions: 156,
      activeAthletes: 12,
      riskDistribution: {
        low: 8,
        medium: 3,
        high: 1
      }
    },
    recentImprovements: [
      { name: 'John Doe', metric: 'Knee Angle', improvement: '+15%' },
      { name: 'Jane Smith', metric: 'Movement Speed', improvement: '+8%' },
      { name: 'Mike Johnson', metric: 'Recovery Time', improvement: '+12%' }
    ],
    commonIssues: [
      { issue: 'Incorrect Landing Posture', count: 8, risk: 'High' },
      { issue: 'Rapid Direction Changes', count: 12, risk: 'Medium' },
      { issue: 'Extended Training Duration', count: 5, risk: 'Low' }
    ]
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        <p className="mt-2 text-gray-600">Track and analyze your team's performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Team Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Team Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Average Performance</h3>
              <p className="text-2xl font-bold text-blue-600">{performanceData.teamMetrics.averagePerformance}%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total Sessions</h3>
              <p className="text-2xl font-bold text-green-600">{performanceData.teamMetrics.totalSessions}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Active Athletes</h3>
              <p className="text-2xl font-bold text-purple-600">{performanceData.teamMetrics.activeAthletes}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Risk Distribution</h3>
              <div className="flex items-center space-x-2 mt-2">
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">{performanceData.teamMetrics.riskDistribution.low} Low</span>
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">{performanceData.teamMetrics.riskDistribution.medium} Med</span>
                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">{performanceData.teamMetrics.riskDistribution.high} High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Improvements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Improvements</h2>
          <div className="space-y-4">
            {performanceData.recentImprovements.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.metric}</p>
                </div>
                <span className="text-green-600 font-semibold">{item.improvement}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Issues */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Common Issues</h2>
          <div className="space-y-4">
            {performanceData.commonIssues.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{item.issue}</h3>
                  <p className="text-sm text-gray-600">Occurrences: {item.count}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  item.risk === 'High' ? 'bg-red-100 text-red-800' :
                  item.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.risk} Risk
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Recommended Actions</h2>
          <div className="space-y-4">
            <button className="w-full p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <h3 className="font-medium text-blue-900">Generate Performance Report</h3>
              <p className="text-sm text-blue-600">Create a detailed report of team performance</p>
            </button>
            <button className="w-full p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <h3 className="font-medium text-green-900">Schedule Team Review</h3>
              <p className="text-sm text-green-600">Plan a session to discuss improvements</p>
            </button>
            <button className="w-full p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <h3 className="font-medium text-purple-900">Update Training Plans</h3>
              <p className="text-sm text-purple-600">Adjust plans based on analytics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachAnalytics; 