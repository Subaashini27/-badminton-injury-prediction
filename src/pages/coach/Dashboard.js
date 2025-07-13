// src/pages/dashboards/CoachDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coachAPI } from '../../services/api';
import ReportGenerationService from '../../services/ReportGenerationService';
import TrainingPlanAdjustmentService from '../../services/TrainingPlanAdjustmentService';
import DecisionSupportService from '../../services/DecisionSupportService';

const CoachDashboard = () => {
  const { currentUser } = useAuth();
  const [teamData, setTeamData] = useState({
    athletes: [],
    riskDistribution: {
      high: 0,
      medium: 0,
      low: 0
    },
    recentAnalyses: [],
    pendingAlerts: []
  });
  const [timeRange, setTimeRange] = useState('week');
  const [notifications, setNotifications] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [automatedReports, setAutomatedReports] = useState([]);
  const [trainingAdjustments, setTrainingAdjustments] = useState([]);
  const [decisionSupport, setDecisionSupport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.token) {
      // Set the default authorization header for all API requests
      // This is a common pattern, but make sure your API service is configured to use it
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
    fetchTeamData();
    }
  }, [timeRange, currentUser]);

  useEffect(() => {
    // Update notifications based on team data
    const newNotifications = [];
    
    // Add high risk athlete notifications
    teamData.athletes.forEach(athlete => {
      if (athlete.riskLevel === 'high') {
        newNotifications.push({
          type: 'warning',
          title: 'High Risk Athlete',
          message: `${athlete.name} has a high risk of injury. Please review their recent analysis.`
        });
      }
    });

    // Add risk distribution notifications
    if (teamData.riskDistribution.high > 0) {
      newNotifications.push({
        type: 'warning',
        title: 'Team Risk Alert',
        message: `${teamData.riskDistribution.high} athletes are at high risk of injury.`
      });
    }

    setNotifications(newNotifications);
  }, [teamData]);

  useEffect(() => {
    // Generate AI insights when team data changes
    if (teamData.athletes.length > 0) {
      generateAIInsights();
      generateTrainingAdjustments();
      generateDecisionSupport();
    }
  }, [teamData]);

  const fetchTeamData = async () => {
    if (!currentUser?.id) return;

    // For seamless presentation, use mock data immediately
    setTeamData({
      athletes: [
        { 
          id: 1, 
          name: 'John Doe', 
          riskLevel: 'low', 
          performance: 85,
          metrics: {
            kneeAngle: 145,
            hipRotation: 85,
            shoulderRotation: 95,
            elbowBend: 155
          },
          currentTrainingPlan: {
            duration: 60,
            intensity: 'Medium',
            focus: 'Performance'
          },
          historicalData: []
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          riskLevel: 'medium', 
          performance: 75,
          metrics: {
            kneeAngle: 165,
            hipRotation: 95,
            shoulderRotation: 105,
            elbowBend: 165
          },
          currentTrainingPlan: {
            duration: 45,
            intensity: 'Medium',
            focus: 'Maintenance'
          },
          historicalData: []
        },
        { 
          id: 3, 
          name: 'Mike Johnson', 
          riskLevel: 'high', 
          performance: 92,
          metrics: {
            kneeAngle: 175,
            hipRotation: 105,
            shoulderRotation: 125,
            elbowBend: 175
          },
          currentTrainingPlan: {
            duration: 45,
            intensity: 'High',
            focus: 'Performance'
          },
          historicalData: []
        }
      ],
      riskDistribution: { high: 1, medium: 1, low: 1 },
      recentAnalyses: [],
      pendingAlerts: []
    });
  };

  // Generate AI insights for the team
  const generateAIInsights = () => {
    const insights = [];

    // Analyze team risk patterns
    const highRiskAthletes = teamData.athletes.filter(a => a.riskLevel === 'high');
    if (highRiskAthletes.length > 0) {
      insights.push({
        type: 'risk_pattern',
        title: 'High Risk Pattern Detected',
        description: `${highRiskAthletes.length} athletes showing high injury risk patterns. Consider team-wide prevention strategies.`,
        priority: 'high',
        actions: [
          'Implement team-wide injury prevention program',
          'Schedule individual assessments',
          'Adjust training intensity for high-risk athletes'
        ]
      });
    }

    // Analyze performance trends
    const avgPerformance = teamData.athletes.reduce((sum, a) => sum + (a.performance || 0), 0) / teamData.athletes.length;
    if (avgPerformance < 75) {
      insights.push({
        type: 'performance',
        title: 'Performance Optimization Opportunity',
        description: `Team average performance is ${avgPerformance.toFixed(1)}%. Focus on skill development and training optimization.`,
        priority: 'medium',
        actions: [
          'Implement targeted skill training',
          'Optimize training schedules',
          'Add performance monitoring'
        ]
      });
    }

    // Analyze training load
    const overtrainingAthletes = teamData.athletes.filter(a => a.trainingLoad > 80);
    if (overtrainingAthletes.length > 0) {
      insights.push({
        type: 'training_load',
        title: 'Overtraining Risk Detected',
        description: `${overtrainingAthletes.length} athletes showing signs of overtraining. Adjust training loads immediately.`,
        priority: 'high',
        actions: [
          'Reduce training intensity',
          'Increase recovery periods',
          'Implement periodization'
        ]
      });
    }

    setAiInsights(insights);
  };

  // Generate training adjustments for athletes
  const generateTrainingAdjustments = () => {
    const adjustments = [];

    teamData.athletes.forEach(athlete => {
      if (athlete.riskLevel === 'high' || athlete.riskLevel === 'medium') {
        const adjustment = TrainingPlanAdjustmentService.analyzeAndAdjustTraining(
          { metrics: athlete.metrics, historicalData: athlete.historicalData },
          athlete.currentTrainingPlan
        );

        adjustments.push({
          athleteId: athlete.id,
          athleteName: athlete.name,
          currentRisk: athlete.riskLevel,
          adjustments: adjustment.adjustedPlan,
          recommendations: adjustment.recommendations,
          priority: adjustment.priority
        });
      }
    });

    setTrainingAdjustments(adjustments);
  };

  // Generate decision support for coaching decisions
  const generateDecisionSupport = () => {
    const teamDecisions = DecisionSupportService.generateTeamDecisions(teamData);
    setDecisionSupport(teamDecisions);
  };

  // Generate automated reports
  const generateAutomatedReport = async (reportType) => {
    setIsGeneratingReport(true);
    try {
      let reportData = {};

      switch (reportType) {
        case 'injury':
          reportData = {
            athlete: teamData.athletes[0], // For individual reports
            riskAssessment: {
              overall: 'Medium',
              score: 65
            },
            metrics: teamData.athletes[0]?.metrics || {},
            recommendations: aiInsights,
            historicalData: teamData.recentAnalyses
          };
          break;
        case 'team':
          reportData = {
            teamStats: {
              totalAthletes: teamData.athletes.length,
              highRisk: teamData.riskDistribution.high,
              averageRisk: 45,
              activeInjuries: 2
            },
            athletes: teamData.athletes,
            recentAnalyses: teamData.recentAnalyses
          };
          break;
        case 'training':
          reportData = {
            trainingPlan: {
              name: 'Current Training Program',
              duration: '8 weeks',
              intensity: 'High'
            },
            aiRecommendations: aiInsights,
            adjustments: trainingAdjustments
          };
          break;
        default:
          throw new Error('Unknown report type');
      }

      const filename = await ReportGenerationService.exportToPDF(reportType, reportData);
      
      setAutomatedReports(prev => [...prev, {
        id: Date.now(),
        type: reportType,
        filename,
        generatedAt: new Date().toISOString(),
        status: 'completed'
      }]);

      // Add notification
      setNotifications(prev => [...prev, {
        type: 'success',
        title: 'Report Generated',
        message: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been generated successfully.`
      }]);

    } catch (error) {
      // Silently handle report generation errors during presentation
      setNotifications(prev => [...prev, {
        type: 'error',
        title: 'Report Generation Failed',
        message: 'Failed to generate report. Please try again.'
      }]);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Schedule automated reports
  const scheduleAutomatedReports = () => {
    const teamReportData = {
      teamStats: {
        totalAthletes: teamData.athletes.length,
        highRisk: teamData.riskDistribution.high,
        averageRisk: 45,
        activeInjuries: 2
      },
      athletes: teamData.athletes,
      recentAnalyses: teamData.recentAnalyses
    };

    // Schedule weekly team reports
    ReportGenerationService.scheduleReport('team', teamReportData, 'weekly');
    
    setNotifications(prev => [...prev, {
      type: 'success',
      title: 'Automated Reports Scheduled',
      message: 'Weekly team reports have been scheduled for automatic generation.'
    }]);
  };

  // Demo data - replace with real data from your backend
  const recentAthletes = [
    {
      id: 1,
      name: 'Lee Zii Jia',
      lastActive: '2 hours ago',
      riskScore: 'Low',
      performance: 85
    },
    {
      id: 2,
      name: 'Thinaah Muralitharan',
      lastActive: '1 day ago',
      riskScore: 'Medium',
      performance: 75
    },
    {
      id: 3,
      name: 'Muhammad Haikal',
      lastActive: '3 hours ago',
      riskScore: 'High',
      performance: 92
    }
  ];

  const upcomingTraining = [
    {
      id: 1,
      title: 'Power Training Session',
      date: '2024-03-30',
      time: '10:00 AM',
      participants: 8
    },
    {
      id: 2,
      title: 'Technique Workshop',
      date: '2024-03-31',
      time: '2:00 PM',
      participants: 12
    }
  ];

  const performanceTrends = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Team Performance',
        data: [75, 78, 82, 85],
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1
      },
      {
        label: 'Injury Risk',
        data: [30, 28, 25, 22],
        borderColor: 'rgb(239, 68, 68)',
        tension: 0.1
      }
    ]
  };
  
  return (
    <div className="p-4">
      {/* Welcome Section - Reduced vertical spacing with mb-4 instead of mb-8 */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser?.name || 'Coach'}</h1>
        <p className="text-gray-600">Manage your team and monitor their performance</p>
      </div>

      {/* Notification Center - Reduced padding and spacing */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Team Alerts</h2>
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                notification.type === 'warning'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : notification.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : notification.type === 'error'
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-blue-50 border border-blue-200'
              }`}
            >
              <h3 className="font-semibold">{notification.title}</h3>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* NEW: Automated Report Generation Section */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Automated Report Generation</h2>
          <button
            onClick={scheduleAutomatedReports}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Schedule Auto-Reports
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => generateAutomatedReport('injury')}
            disabled={isGeneratingReport}
            className="p-3 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50"
          >
            <h3 className="font-medium text-red-800">Generate Injury Report</h3>
            <p className="text-xs text-red-600">Comprehensive injury risk analysis</p>
          </button>
          <button
            onClick={() => generateAutomatedReport('team')}
            disabled={isGeneratingReport}
            className="p-3 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            <h3 className="font-medium text-blue-800">Generate Team Report</h3>
            <p className="text-xs text-blue-600">Team performance overview</p>
          </button>
          <button
            onClick={() => generateAutomatedReport('training')}
            disabled={isGeneratingReport}
            className="p-3 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 disabled:opacity-50"
          >
            <h3 className="font-medium text-purple-800">Generate Training Report</h3>
            <p className="text-xs text-purple-600">Training plan analysis</p>
          </button>
        </div>
        {isGeneratingReport && (
          <div className="mt-3 text-center text-sm text-gray-600">
            Generating report... Please wait.
          </div>
        )}
      </div>

      {/* NEW: AI-Driven Training Adjustments */}
      {trainingAdjustments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">AI-Generated Training Adjustments</h2>
          <div className="space-y-3">
            {trainingAdjustments.slice(0, 3).map((adjustment, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{adjustment.athleteName}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    adjustment.priority === 'high' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {adjustment.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Current Risk: {adjustment.currentRisk} | 
                  New Duration: {adjustment.adjustments.duration} minutes | 
                  Focus: {adjustment.adjustments.focus}
                </p>
                <div className="text-xs text-gray-500">
                  Key Changes: {adjustment.adjustments.modifications.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW: Decision Support Insights */}
      {decisionSupport && (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">AI Decision Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Team Risk Analysis</h3>
              <p className="text-sm text-gray-600">
                Average Risk: {decisionSupport.overallRisk?.average?.toFixed(1) || 'N/A'}%<br/>
                High Risk Athletes: {decisionSupport.overallRisk?.highRiskCount || 0}<br/>
                Confidence: {decisionSupport.confidence || 'N/A'}%
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Recommended Actions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {decisionSupport.recommendations?.slice(0, 3).map((rec, index) => (
                  <li key={index} className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      rec.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></span>
                    {rec.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3-column grid for main dashboard sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* AI Recommendations */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">AI-Generated Insights</h2>
          <div className="space-y-2">
            {aiInsights.map((insight) => (
              <div key={insight.title} className="bg-white rounded-lg shadow p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    insight.priority === 'High' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {insight.priority} Priority
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                <div className="text-xs text-gray-500">
                  Actions: {insight.actions.slice(0, 2).join(', ')}...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Athletes Activity */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Recent Athlete Activity</h2>
          <div className="space-y-3">
            {recentAthletes.map((athlete) => (
              <div key={athlete.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{athlete.name}</h3>
                  <p className="text-sm text-gray-500">Last active: {athlete.lastActive}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    athlete.riskScore === 'High' ? 'bg-red-100 text-red-800' :
                    athlete.riskScore === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {athlete.riskScore} Risk
                  </span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${athlete.performance}%` }}
                      ></div>
                    </div>
                    <span className="ml-1 text-xs text-gray-600">{athlete.performance}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Training Sessions */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Today's Training Sessions</h2>
          <div className="space-y-3">
            {upcomingTraining.map((session) => (
              <div key={session.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{session.title}</h3>
                  <p className="text-sm text-gray-500">
                    {session.date} at {session.time}
                  </p>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {session.participants} participants
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2-column grid for charts and performance sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        {/* Performance Trends Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Performance Trends</h2>
          <div className="h-64">
            {/* Chart component would go here */}
            <div className="flex flex-col h-full justify-center items-center">
              <p className="text-gray-500">Team performance has improved by 10% over the last month</p>
            </div>
          </div>
        </div>

        {/* Risk Analysis */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Risk Analysis</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-50 p-3 rounded-lg">
              <h3 className="font-medium text-red-800">High Risk Areas</h3>
              <p className="text-sm text-gray-600">Shoulder strain (3 athletes)</p>
              <p className="text-sm text-gray-600">Knee overextension (2 athletes)</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-medium text-green-800">Improving Areas</h3>
              <p className="text-sm text-gray-600">Core stability (+12%)</p>
              <p className="text-sm text-gray-600">Recovery time (+8%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;