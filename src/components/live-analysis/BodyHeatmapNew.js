import React from 'react';

const BodyHeatmap = ({ jointAngles }) => {
  // Define optimal angle ranges
  const optimalRanges = {
    shoulder: { min: 90, max: 140 },
    elbow: { min: 140, max: 170 },
    hip: { min: 80, max: 120 },
    knee: { min: 140, max: 165 },
  };

  // Calculate risk based on angle and optimal range
  const calculateRisk = (angle, range) => {
    if (angle === null || angle === undefined) return 'Safe';
    if (angle >= range.min && angle <= range.max) {
      return 'Safe';
    } else if (angle >= range.min - 15 && angle <= range.max + 15) {
      return 'Medium Risk';
    } else {
      return 'High Risk';
    }
  };

  const shoulderRisk = calculateRisk(jointAngles?.shoulderRotation, optimalRanges.shoulder);
  const elbowRisk = calculateRisk(jointAngles?.elbowBend, optimalRanges.elbow);
  const hipRisk = calculateRisk(jointAngles?.hipRotation, optimalRanges.hip);
  const kneeRisk = calculateRisk(jointAngles?.kneeAngle, optimalRanges.knee);

  // Get color based on risk level
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high risk': return '#EF4444'; // red-500
      case 'medium risk': return '#F59E0B'; // amber-500  
      case 'safe':
      case 'low risk':
      default: return '#10B981'; // emerald-500
    }
  };

  // Get background color for indicators
  const getBgColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high risk': return 'bg-red-100 border-red-300';
      case 'medium risk': return 'bg-amber-100 border-amber-300';
      case 'safe':
      case 'low risk':
      default: return 'bg-emerald-100 border-emerald-300';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Body Diagram */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-40 h-72">
          {/* SVG Body Diagram */}
          <svg width="160" height="288" viewBox="0 0 160 288" className="mx-auto">
            {/* Body outline */}
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#F3F4F6', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#E5E7EB', stopOpacity:1}} />
              </linearGradient>
            </defs>
            
            {/* Head */}
            <circle cx="80" cy="25" r="20" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Torso */}
            <ellipse cx="80" cy="80" rx="30" ry="35" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Arms */}
            <ellipse cx="50" cy="70" rx="8" ry="25" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            <ellipse cx="110" cy="70" rx="8" ry="25" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Forearms */}
            <ellipse cx="45" cy="110" rx="6" ry="20" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            <ellipse cx="115" cy="110" rx="6" ry="20" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Hips */}
            <ellipse cx="80" cy="130" rx="25" ry="15" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Thighs */}
            <ellipse cx="70" cy="170" rx="10" ry="30" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            <ellipse cx="90" cy="170" rx="10" ry="30" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Calves */}
            <ellipse cx="70" cy="220" rx="8" ry="25" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            <ellipse cx="90" cy="220" rx="8" ry="25" fill="url(#bodyGradient)" stroke="#9CA3AF" strokeWidth="2"/>
            
            {/* Risk indicators */}
            {/* Shoulders */}
            <circle cx="55" cy="55" r="8" fill={getRiskColor(shoulderRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            <circle cx="105" cy="55" r="8" fill={getRiskColor(shoulderRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            
            {/* Elbows */}
            <circle cx="45" cy="95" r="6" fill={getRiskColor(elbowRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            <circle cx="115" cy="95" r="6" fill={getRiskColor(elbowRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            
            {/* Hips */}
            <circle cx="65" cy="130" r="7" fill={getRiskColor(hipRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            <circle cx="95" cy="130" r="7" fill={getRiskColor(hipRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            
            {/* Knees */}
            <circle cx="70" cy="200" r="7" fill={getRiskColor(kneeRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
            <circle cx="90" cy="200" r="7" fill={getRiskColor(kneeRisk)} opacity="0.8" stroke="#fff" strokeWidth="1"/>
          </svg>
        </div>
      </div>
      
      {/* Risk Level Labels */}
      <div className="space-y-2 mt-4">
        <div className={`flex items-center justify-between p-2 rounded-lg border ${getBgColor(shoulderRisk)}`}>
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{backgroundColor: getRiskColor(shoulderRisk)}}
            ></div>
            <span className="text-sm font-medium text-gray-700">Shoulders</span>
          </div>
          <span className="text-xs text-gray-600">{shoulderRisk}</span>
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded-lg border ${getBgColor(elbowRisk)}`}>
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{backgroundColor: getRiskColor(elbowRisk)}}
            ></div>
            <span className="text-sm font-medium text-gray-700">Elbows</span>
          </div>
          <span className="text-xs text-gray-600">{elbowRisk}</span>
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded-lg border ${getBgColor(hipRisk)}`}>
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{backgroundColor: getRiskColor(hipRisk)}}
            ></div>
            <span className="text-sm font-medium text-gray-700">Hips</span>
          </div>
          <span className="text-xs text-gray-600">{hipRisk}</span>
        </div>
        
        <div className={`flex items-center justify-between p-2 rounded-lg border ${getBgColor(kneeRisk)}`}>
          <div className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{backgroundColor: getRiskColor(kneeRisk)}}
            ></div>
            <span className="text-sm font-medium text-gray-700">Knees</span>
          </div>
          <span className="text-xs text-gray-600">{kneeRisk}</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs font-medium text-gray-700 mb-2">Risk Levels:</p>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Safe - Good form</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Medium - Watch technique</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">High - Adjust form</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyHeatmap;
