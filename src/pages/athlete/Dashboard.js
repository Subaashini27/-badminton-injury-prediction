import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import BodyHeatmapNew from '../../components/live-analysis/BodyHeatmapNew';
import JointAnglesTable from '../../components/live-analysis/JointAnglesTable';
import MediaPipeLiveAnalysis from '../../components/live-analysis/MediaPipeLiveAnalysis';
import InjurySummary from '../../components/common/InjurySummary';
import ExerciseRecommendations from '../../components/common/ExerciseRecommendations';
import CoachFeedback from '../../components/athlete/CoachFeedback';
import feedbackService from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';
import { athleteAPI } from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const Dashboard = () => {
  const [analysisMode, setAnalysisMode] = useState('stopped');
  const [jointAngles, setJointAngles] = useState(null);
  const [poseDataHistory, setPoseDataHistory] = useState({
    shoulder: [],
    elbow: [],
    hip: [],
    knee: []
  });
  const [isRealTimeTracking, setIsRealTimeTracking] = useState(true);
  const [coachFeedback, setCoachFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState(null);
  
  const { currentUser } = useAuth();
  const sessionAnglesHistory = useRef([]);

  // Fetch feedback data
  const fetchFeedback = useCallback(async () => {
    try {
      setFeedbackError(null);
      const data = await feedbackService.getFeedback();
      setCoachFeedback(data);
    } catch (err) {
      setFeedbackError(err.message || 'Could not load feedback.');
    } finally {
      setFeedbackLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback(); // Initial fetch
    const intervalId = setInterval(fetchFeedback, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchFeedback]);

  // Update pose data history for real-time chart
  const updatePoseHistory = useCallback((angles) => {
    if (!angles || !isRealTimeTracking) return;
    
    const timestamp = new Date();
    // Only update if there are valid angle values
    if (Object.values(angles).some(angle => angle !== null && angle > 0)) {
      sessionAnglesHistory.current.push(angles);
      setPoseDataHistory(prev => {
        const maxDataPoints = 50; // Keep last 50 data points
        return {
          shoulder: [...prev.shoulder, { x: timestamp, y: angles.shoulderRotation }].slice(-maxDataPoints),
          elbow: [...prev.elbow, { x: timestamp, y: angles.elbowBend }].slice(-maxDataPoints),
          hip: [...prev.hip, { x: timestamp, y: angles.hipRotation }].slice(-maxDataPoints),
          knee: [...prev.knee, { x: timestamp, y: angles.kneeAngle }].slice(-maxDataPoints)
        };
      });
    }
  }, [isRealTimeTracking]);

  const handlePoseData = useCallback((pose) => {
    // Store pose data if needed for future features
  }, []);

  const handleJointAngles = useCallback((angles) => {
    if (isRealTimeTracking) {
      setJointAngles(angles);
      updatePoseHistory(angles);
    }
  }, [isRealTimeTracking, updatePoseHistory]);

  const handleRiskAnalysis = useCallback((risk) => {
    // This function is no longer used as riskData state was removed
  }, []);

  // Calculate overall score from a set of metrics
  const calculateOverallScore = (metrics) => {
    if (!metrics) return 0;
    const weights = {
      shotQuality: 0.3,
      movementMetrics: 0.3,
      physicalMetrics: 0.2, 
      technicalMetrics: 0.2
    };

    const getCategoryAverage = (category) => {
      if (!metrics[category] || Object.keys(metrics[category]).length === 0) return 0;
      const values = Object.values(metrics[category]);
      return values.reduce((sum, val) => sum + (val || 0), 0) / values.length;
    };

    const weightedScore = (
      getCategoryAverage('shotQuality') * weights.shotQuality +
      getCategoryAverage('movementMetrics') * weights.movementMetrics +
      getCategoryAverage('physicalMetrics') * weights.physicalMetrics +
      getCategoryAverage('technicalMetrics') * weights.technicalMetrics
    );
    return Math.round(weightedScore);
  };


  // Handle stopping analysis and saving data
  useEffect(() => {
    const saveAnalysisSession = async () => {
      if (sessionAnglesHistory.current.length < 10) { // Only save if there's meaningful data
        sessionAnglesHistory.current = [];
        return;
      }

      // Calculate average metrics from the session
      const metricSums = { shoulderRotation: 0, elbowBend: 0, hipRotation: 0, kneeAngle: 0 };
      sessionAnglesHistory.current.forEach(angles => {
        metricSums.shoulderRotation += angles.shoulderRotation || 0;
        metricSums.elbowBend += angles.elbowBend || 0;
        metricSums.hipRotation += angles.hipRotation || 0;
        metricSums.kneeAngle += angles.kneeAngle || 0;
      });

      const count = sessionAnglesHistory.current.length;
      const avgMetrics = {
        shoulderRotation: metricSums.shoulderRotation / count,
        elbowBend: metricSums.elbowBend / count,
        hipRotation: metricSums.hipRotation / count,
        kneeAngle: metricSums.kneeAngle / count,
      };

      // Simplified mapping from angles to performance scores
      const finalMetrics = {
        shotQuality: { smashPower: avgMetrics.shoulderRotation, clearHeight: avgMetrics.elbowBend, dropShotPrecision: 70 + Math.random() * 5, netShotAccuracy: 75 + Math.random() * 5 },
        movementMetrics: { courtCoverage: avgMetrics.hipRotation, recoverySpeed: avgMetrics.kneeAngle, footworkEfficiency: 65 + Math.random() * 5, reactionTime: 80 + Math.random() * 5 },
        physicalMetrics: { stamina: 70, agility: 80, strength: 75, flexibility: 60 },
        technicalMetrics: { racketControl: 85, strokePrecision: 80, tacticalAwareness: 75, consistency: 70 }
      };

      const overallScore = calculateOverallScore(finalMetrics);

      try {
        await athleteAPI.saveAnalysisData({
          athlete_id: currentUser.id,
          session_duration: sessionAnglesHistory.current.length, // Rough duration in seconds
          notes: 'Completed live analysis session from dashboard.',
          overall_score: overallScore,
          ...finalMetrics,
        });
      } catch (error) {
        // setSaveError('Failed to save session. Please try again.'); // Removed as per edit hint
      } finally {
        sessionAnglesHistory.current = []; // Clear history after saving
      }
    };

    if (analysisMode === 'stopped') {
      saveAnalysisSession();
      setPoseDataHistory({ shoulder: [], elbow: [], hip: [], knee: [] });
    } else {
      sessionAnglesHistory.current = [];
    }
  }, [analysisMode, currentUser]);

  // Chart configuration
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0 
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 180,
        title: {
          display: true,
          text: 'Angle (Degrees)'
        }
      },
      x: {
        type: 'time',
        time: {
          unit: 'second',
          displayFormats: {
            second: 'HH:mm:ss'
          }
        },
        title: {
          display: true,
          text: 'Time'
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    }
  };

  const chartData = {
    datasets: [
      {
        label: 'Shoulder',
        data: poseDataHistory.shoulder,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1
      },
      {
        label: 'Elbow',
        data: poseDataHistory.elbow,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.1
      },
      {
        label: 'Hip',
        data: poseDataHistory.hip,
        borderColor: 'rgb(255, 206, 86)',
        backgroundColor: 'rgba(255, 206, 86, 0.1)',
        tension: 0.1
      },
      {
        label: 'Knee',
        data: poseDataHistory.knee,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.1
      }
    ]
  };

  return (
    <div className="flex bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[2.5fr_1fr] gap-4 sm:gap-6">
            {/* Live Analysis Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Live Analysis</h2>
              <MediaPipeLiveAnalysis
                mode={analysisMode}
                onModeChange={setAnalysisMode}
                onPoseData={handlePoseData}
                onJointAngles={handleJointAngles}
                onRiskAnalysis={handleRiskAnalysis}
                className="w-full max-w-4xl mx-auto"
              />
            </div>

            {/* Risk Heatmap Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Risk Assessment</h2>
              <BodyHeatmapNew jointAngles={jointAngles} />
            </div>
          </div>

          {/* Joint Angles Table Section - Full Width Below */}
          <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">Joint Angles</h2>
            <JointAnglesTable metrics={jointAngles} />
          </div>

          {/* Real-time chart section */}
          <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Performance Over Time
                {analysisMode !== 'stopped' && (
                  <span className="ml-2 text-sm font-normal text-green-600">
                    (Live)
                  </span>
                )}
              </h2>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRealTimeTracking}
                    onChange={(e) => setIsRealTimeTracking(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-blue-800">
                    Real-time monitoring active
                  </span>
                </label>
                <p className="text-xs text-blue-600 mt-1">
                  Risk levels and charts update automatically as you move.
                </p>
              </div>
            </div>
            <div className="h-64 sm:h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Injury Summary and Exercise Recommendations */}
          <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <InjurySummary jointAngles={jointAngles} />
            <ExerciseRecommendations jointAngles={jointAngles} />
          </div>

          {/* Coach Feedback Section */}
          <div className="mt-4 sm:mt-6 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <CoachFeedback 
              feedback={coachFeedback}
              isLoading={feedbackLoading}
              error={feedbackError}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;