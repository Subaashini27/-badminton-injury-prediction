import React from 'react';

const PerformanceSummary = ({ metrics, onStartNewAnalysis, onShareReport }) => {
  const calculateOverallScore = () => {
    if (!metrics) return 0;

    const weights = {
      shotQuality: 0.3,
      movementMetrics: 0.3,
      technicalMetrics: 0.4
    };

    const shotQualityScore = metrics.shotQuality ? 
      Object.values(metrics.shotQuality).reduce((sum, val) => sum + (val || 0), 0) / Object.values(metrics.shotQuality).length : 0;

    const movementScore = metrics.movementMetrics ?
      Object.values(metrics.movementMetrics).reduce((sum, val) => sum + (val || 0), 0) / Object.values(metrics.movementMetrics).length : 0;

    const technicalScore = metrics.technicalMetrics ?
      Object.values(metrics.technicalMetrics).reduce((sum, val) => sum + (val || 0), 0) / Object.values(metrics.technicalMetrics).length : 0;

    const weightedScore = (
      shotQualityScore * weights.shotQuality +
      movementScore * weights.movementMetrics +
      technicalScore * weights.technicalMetrics
    );

    return Math.round(weightedScore);
  };

  if (!metrics) {
    return null;
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Analysis Complete!</h2>
        <p>Your performance metrics have been calculated.</p>
      </div>
      
      {/* Overall Performance Score */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 text-center">
        <h2 className="text-lg font-semibold mb-3">Overall Performance</h2>
        <div className="text-5xl font-bold text-blue-600 mb-2">
          {calculateOverallScore()}
          <span className="text-2xl text-gray-400">/100</span>
        </div>
        <p className="text-gray-500">Based on your movement analysis</p>
      </div>
      
      <div className="mt-6">
        <button 
          onClick={onStartNewAnalysis} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Start New Analysis
        </button>
        
        <button 
          onClick={onShareReport}
          className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Share with Coach
        </button>
      </div>
    </div>
  );
};

export default PerformanceSummary; 