import React, { useState, useEffect } from 'react';
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
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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

const AIModelMonitoring = () => {
  const [modelMetrics, setModelMetrics] = useState(null);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock model metrics
    const mockMetrics = {
      currentAccuracy: 94.2,
      currentPrecision: 91.8,
      currentRecall: 93.5,
      currentF1Score: 92.6,
      modelVersion: 'v2.3.1',
      lastTrained: '2024-01-15',
      trainingDataSize: '50,000 samples',
      avgProcessingTime: '0.08s',
      totalPredictions: 15420,
      predictionsToday: 156,
      highRiskDetections: 340,
      modelSize: '245 MB',
      memoryUsage: '1.2 GB',
      cpuUsage: '15%',
      gpuUsage: '45%'
    };

    // Mock training history
    const mockTrainingHistory = [
      {
        id: 1,
        version: 'v2.3.1',
        date: '2024-01-15',
        accuracy: 94.2,
        precision: 91.8,
        recall: 93.5,
        f1Score: 92.6,
        trainingTime: '2h 15m',
        dataSize: '50,000 samples',
        status: 'completed'
      },
      {
        id: 2,
        version: 'v2.2.0',
        date: '2024-01-01',
        accuracy: 93.1,
        precision: 90.5,
        recall: 92.8,
        f1Score: 91.6,
        trainingTime: '2h 30m',
        dataSize: '45,000 samples',
        status: 'completed'
      },
      {
        id: 3,
        version: 'v2.1.0',
        date: '2023-12-15',
        accuracy: 92.3,
        precision: 89.2,
        recall: 91.7,
        f1Score: 90.4,
        trainingTime: '2h 45m',
        dataSize: '40,000 samples',
        status: 'completed'
      }
    ];

    // Mock recent predictions
    const mockPredictions = [
      {
        id: 1,
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        athleteName: 'John Doe',
        riskScore: 0.85,
        confidence: 0.92,
        prediction: 'High Risk',
        processingTime: '0.12s'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 12),
        athleteName: 'Sarah Johnson',
        riskScore: 0.23,
        confidence: 0.88,
        prediction: 'Low Risk',
        processingTime: '0.09s'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        athleteName: 'Mike Wilson',
        riskScore: 0.67,
        confidence: 0.91,
        prediction: 'Medium Risk',
        processingTime: '0.11s'
      },
      {
        id: 4,
        timestamp: new Date(Date.now() - 1000 * 60 * 40),
        athleteName: 'Emily Chen',
        riskScore: 0.91,
        confidence: 0.94,
        prediction: 'High Risk',
        processingTime: '0.15s'
      },
      {
        id: 5,
        timestamp: new Date(Date.now() - 1000 * 60 * 55),
        athleteName: 'David Brown',
        riskScore: 0.34,
        confidence: 0.87,
        prediction: 'Low Risk',
        processingTime: '0.08s'
      }
    ];

    // Mock alerts
    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        message: 'Model accuracy dropped below 95% threshold',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        severity: 'medium',
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        message: 'Scheduled model retraining completed successfully',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        severity: 'low',
        resolved: true
      },
      {
        id: 3,
        type: 'error',
        message: 'High API response time detected (>2s)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        severity: 'high',
        resolved: false
      }
    ];

    setModelMetrics(mockMetrics);
    setTrainingHistory(mockTrainingHistory);
    setPredictions(mockPredictions);
    setAlerts(mockAlerts);
    setIsLoading(false);
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 0.7) return 'text-red-600';
    if (riskScore >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const accuracyTrendData = {
    labels: ['v2.1.0', 'v2.2.0', 'v2.3.1'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: [92.3, 93.1, 94.2],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      },
      {
        label: 'F1 Score (%)',
        data: [90.4, 91.6, 92.6],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const predictionDistributionData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [65, 25, 10],
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
        max: 100,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI model monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Model Monitoring</h1>
        <p className="text-gray-600">Monitor AI model performance and system health</p>
      </div>

      {/* Model Alerts */}
      {alerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🚨 Active Model Alerts</h2>
          <div className="space-y-3">
            {alerts.filter(alert => !alert.resolved).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                    alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.severity} severity
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800">Model Accuracy</h3>
          <p className="text-3xl font-bold text-blue-600">{modelMetrics.currentAccuracy}%</p>
          <p className="text-sm text-gray-600">Current performance</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-800">Total Predictions</h3>
          <p className="text-3xl font-bold text-green-600">{modelMetrics.totalPredictions.toLocaleString()}</p>
          <p className="text-sm text-gray-600">{modelMetrics.predictionsToday} today</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-800">Avg Processing Time</h3>
          <p className="text-3xl font-bold text-yellow-600">{modelMetrics.avgProcessingTime}</p>
          <p className="text-sm text-gray-600">Per prediction</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold text-gray-800">High Risk Detections</h3>
          <p className="text-3xl font-bold text-red-600">{modelMetrics.highRiskDetections}</p>
          <p className="text-sm text-gray-600">Total alerts</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Accuracy Trend */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Model Performance Trend</h3>
          <div className="h-64">
            <Line data={accuracyTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Prediction Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Risk Distribution</h3>
          <div className="h-64">
            <Doughnut data={predictionDistributionData} options={{
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
      </div>

      {/* System Resources and Model Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* System Resources */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💻 System Resources</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-semibold">{modelMetrics.cpuUsage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: modelMetrics.cpuUsage }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">GPU Usage</span>
                <span className="text-sm font-semibold">{modelMetrics.gpuUsage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: modelMetrics.gpuUsage }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-semibold">{modelMetrics.memoryUsage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Model Information */}
        <div className="bg-white p-6 rounded-lg shadow-md col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 Model Information</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Model Version</p>
                <p className="font-semibold">{modelMetrics.modelVersion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Trained</p>
                <p className="font-semibold">{modelMetrics.lastTrained}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Training Data Size</p>
                <p className="font-semibold">{modelMetrics.trainingDataSize}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model Size</p>
                <p className="font-semibold">{modelMetrics.modelSize}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Precision</p>
                <p className="font-semibold">{modelMetrics.currentPrecision}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Recall</p>
                <p className="font-semibold">{modelMetrics.currentRecall}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">F1 Score</p>
                <p className="font-semibold">{modelMetrics.currentF1Score}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
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

      {/* Recent Predictions and Training History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Predictions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔮 Recent Predictions</h3>
          <div className="space-y-3">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">{prediction.athleteName}</p>
                    <p className="text-sm text-gray-600">
                      {prediction.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${getRiskColor(prediction.riskScore)}`}>
                      {prediction.prediction}
                    </p>
                    <p className="text-xs text-gray-600">
                      Confidence: <span className={getConfidenceColor(prediction.confidence)}>
                        {(prediction.confidence * 100).toFixed(0)}%
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Risk Score: {(prediction.riskScore * 100).toFixed(0)}% | 
                  Processing: {prediction.processingTime}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training History */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Training History</h3>
          <div className="space-y-3">
            {trainingHistory.map((training) => (
              <div key={training.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-800">Version {training.version}</p>
                    <p className="text-sm text-gray-600">{training.date}</p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    {training.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>Accuracy: <span className="font-semibold">{training.accuracy}%</span></div>
                  <div>F1 Score: <span className="font-semibold">{training.f1Score}%</span></div>
                  <div>Training Time: <span className="font-semibold">{training.trainingTime}</span></div>
                  <div>Data Size: <span className="font-semibold">{training.dataSize}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIModelMonitoring;