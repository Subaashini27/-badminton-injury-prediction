import React from 'react';
import BodyHeatmap from './BodyHeatmapNew';
import { getRiskLevel } from '../../utils/liveAnalysisUtils';

const MetricsDisplay = ({ 
  metrics, 
  isAnalyzing, 
  hasAtLeastOneValidMetric, 
  formatMetric, 
  recommendations 
}) => {
  // Enhanced risk calculation and color coding
  const getRiskColor = (value, type) => {
    const riskLevel = getRiskLevel(value || 0, type);
    switch (riskLevel) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Calculate overall risk score based on actual risk levels from AnalysisContext
  const calculateOverallRisk = () => {
    if (!hasAtLeastOneValidMetric(metrics)) return 0;
    
    // Map risk levels to numeric values
    const riskValues = {
      'Safe': 0,
      'Low': 0.2,
      'Medium Risk': 0.5,
      'High Risk': 1.0
    };
    
    // Get risk values from the processed metrics
    const risks = [];
    
    if (metrics.kneeRisk) risks.push(riskValues[metrics.kneeRisk] || 0);
    if (metrics.hipRisk) risks.push(riskValues[metrics.hipRisk] || 0);
    if (metrics.shoulderRisk) risks.push(riskValues[metrics.shoulderRisk] || 0);
    if (metrics.elbowRisk) risks.push(riskValues[metrics.elbowRisk] || 0);
    
    // If no risk levels are available, calculate from raw angles
    if (risks.length === 0) {
      // Fallback to raw angle analysis
      const kneeRisk = metrics.kneeAngle > 170 ? 1.0 : metrics.kneeAngle > 150 ? 0.5 : 0;
      const hipRisk = metrics.hipRotation > 45 ? 1.0 : metrics.hipRotation > 30 ? 0.5 : 0;
      const shoulderRisk = metrics.shoulderRotation > 90 ? 1.0 : metrics.shoulderRotation > 60 ? 0.5 : 0;
      const elbowRisk = metrics.elbowBend > 90 ? 1.0 : metrics.elbowBend > 70 ? 0.5 : 0;
      
      risks.push(kneeRisk, hipRisk, shoulderRisk, elbowRisk);
    }
    
    return risks.length > 0 ? risks.reduce((sum, risk) => sum + risk, 0) / risks.length : 0;
  };

  const overallRisk = calculateOverallRisk();
  const overallRiskColor = overallRisk > 0.7 ? 'bg-red-100 border-red-300 text-red-800' :
                           overallRisk > 0.4 ? 'bg-orange-100 border-orange-300 text-orange-800' :
                           'bg-green-100 border-green-300 text-green-800';

  return (
    <div className="w-full lg:w-1/4"> {/* Changed from lg:w-1/3 to lg:w-1/4 to accommodate wider camera */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Movement Analysis</h2>
        
        {!isAnalyzing && !hasAtLeastOneValidMetric(metrics) && (
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-500 font-medium">No metrics available yet</p>
            <p className="text-sm text-gray-400">Start analysis to see movement data</p>
          </div>
        )}
        
        {isAnalyzing && !hasAtLeastOneValidMetric(metrics) && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center mb-2">
              <div className="animate-pulse w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <h3 className="font-bold text-amber-700">Detecting movement...</h3>
            </div>
            <p className="text-sm text-amber-700">Position yourself so your full body is visible in the frame.</p>
          </div>
        )}
        
        {hasAtLeastOneValidMetric(metrics) && (
          <>
            {/* Overall Risk Score */}
            <div className={`mb-4 p-4 rounded-lg border-2 ${overallRiskColor}`}>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Overall Risk Score</span>
                <span className="text-2xl font-bold">{(overallRisk * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    overallRisk > 0.7 ? 'bg-red-500' :
                    overallRisk > 0.4 ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(overallRisk * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Current Metrics with Enhanced Display */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-3 text-gray-700">Live Joint Angles</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { key: 'kneeAngle', label: '🦵 Knee Angle', type: 'knee' },
                  { key: 'hipRotation', label: '🏃 Hip Rotation', type: 'hip' },
                  { key: 'shoulderRotation', label: '💪 Shoulder Rotation', type: 'shoulder' },
                  { key: 'elbowBend', label: '🤏 Elbow Bend', type: 'elbow' }
                ].map(({ key, label, type }) => {
                  const value = metrics[key];
                  const riskLevel = getRiskLevel(value || 0, type);
                  return (
                    <div key={key} className={`p-3 rounded-lg border ${getRiskColor(value, type)}`}>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{label}</span>
                        <div className="text-right">
                          <div className="font-bold">{formatMetric(value)}°</div>
                          <div className="text-xs">{riskLevel} Risk</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fallback Mode Indicator */}
            {metrics.isFallback && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-blue-600 mr-2">ℹ️</span>
                  <span className="text-sm text-blue-700 font-medium">Training Mode Active</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Using simulated data for educational purposes
                </p>
              </div>
            )}

            {/* Body Heatmap */}
            <BodyHeatmap metrics={metrics} />

            {/* Movement Tips */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                💡 Movement Tips
              </h3>
              {recommendations && recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.map((tip, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-500 text-sm">No specific recommendations at this time</p>
                  <p className="text-xs text-gray-400 mt-1">Keep maintaining good form!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MetricsDisplay;
