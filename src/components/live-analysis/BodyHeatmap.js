import React from 'react';

const BodyHeatmap = ({ metrics }) => {
  // Convert risk levels to numeric values for color mapping
  const getRiskValue = (riskLevel) => {
    if (!riskLevel) return 0;
    switch (riskLevel.toLowerCase()) {
      case 'high risk': return 1.0;
      case 'medium risk': return 0.6;
      case 'safe': 
      case 'low risk': return 0.2;
      default: return 0;
    }
  };

  // Get color class based on risk value with modern styling
  const getRiskColor = (riskLevel) => {
    const risk = getRiskValue(riskLevel);
    if (risk >= 0.8) return 'bg-gradient-to-br from-red-400 to-red-600 border-red-300';
    if (risk >= 0.6) return 'bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300';
    if (risk >= 0.4) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300';
    return 'bg-gradient-to-br from-green-400 to-green-600 border-green-300';
  };

  // Get text color for better contrast
  const getTextColor = (riskLevel) => {
    const risk = getRiskValue(riskLevel);
    if (risk >= 0.4) return 'text-white';
    return 'text-gray-800';
  };

  // Get pulse animation for high risk areas
  const getPulseAnimation = (riskLevel) => {
    const risk = getRiskValue(riskLevel);
    if (risk >= 0.8) return 'animate-pulse';
    return '';
  };

  return (
    <div className="relative">
      <div className="flex flex-col items-center">
        {/* Human figure outline with modern styling */}
        <div className="relative w-40 h-80 mx-auto">
          {/* Modern body silhouette */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="160" height="320" viewBox="0 0 160 320" className="text-gray-300">
              {/* Head */}
              <circle cx="80" cy="40" r="25" fill="currentColor" />
              {/* Torso */}
              <rect x="60" y="65" width="40" height="80" rx="20" fill="currentColor" />
              {/* Arms */}
              <rect x="35" y="75" width="20" height="60" rx="10" fill="currentColor" />
              <rect x="105" y="75" width="20" height="60" rx="10" fill="currentColor" />
              {/* Legs */}
              <rect x="65" y="145" width="15" height="100" rx="7" fill="currentColor" />
              <rect x="80" y="145" width="15" height="100" rx="7" fill="currentColor" />
              {/* Feet */}
              <ellipse cx="72" cy="260" rx="8" ry="15" fill="currentColor" />
              <ellipse cx="88" cy="260" rx="8" ry="15" fill="currentColor" />
            </svg>
          </div>
          
          {/* Risk indicators positioned over body parts */}
          {/* Shoulders */}
          <div 
            className={`absolute top-16 left-8 w-12 h-12 rounded-full ${getRiskColor(metrics?.shoulderRisk)} ${getPulseAnimation(metrics?.shoulderRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Left Shoulder: ${metrics?.shoulderRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.shoulderRisk)}`}>
              L.S
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.shoulderRisk || 'Safe'}
            </div>
          </div>
          
          <div 
            className={`absolute top-16 right-8 w-12 h-12 rounded-full ${getRiskColor(metrics?.shoulderRisk)} ${getPulseAnimation(metrics?.shoulderRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Right Shoulder: ${metrics?.shoulderRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.shoulderRisk)}`}>
              R.S
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.shoulderRisk || 'Safe'}
            </div>
          </div>

          {/* Elbows */}
          <div 
            className={`absolute top-24 left-4 w-10 h-10 rounded-full ${getRiskColor(metrics?.elbowRisk)} ${getPulseAnimation(metrics?.elbowRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Left Elbow: ${metrics?.elbowRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.elbowRisk)}`}>
              E
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.elbowRisk || 'Safe'}
            </div>
          </div>
          
          <div 
            className={`absolute top-24 right-4 w-10 h-10 rounded-full ${getRiskColor(metrics?.elbowRisk)} ${getPulseAnimation(metrics?.elbowRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Right Elbow: ${metrics?.elbowRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.elbowRisk)}`}>
              E
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.elbowRisk || 'Safe'}
            </div>
          </div>

          {/* Hips */}
          <div 
            className={`absolute top-36 left-10 w-11 h-11 rounded-full ${getRiskColor(metrics?.hipRisk)} ${getPulseAnimation(metrics?.hipRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Left Hip: ${metrics?.hipRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.hipRisk)}`}>
              H
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.hipRisk || 'Safe'}
            </div>
          </div>
          
          <div 
            className={`absolute top-36 right-10 w-11 h-11 rounded-full ${getRiskColor(metrics?.hipRisk)} ${getPulseAnimation(metrics?.hipRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Right Hip: ${metrics?.hipRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.hipRisk)}`}>
              H
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.hipRisk || 'Safe'}
            </div>
          </div>

          {/* Knees */}
          <div 
            className={`absolute bottom-20 left-12 w-11 h-11 rounded-full ${getRiskColor(metrics?.kneeRisk)} ${getPulseAnimation(metrics?.kneeRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Left Knee: ${metrics?.kneeRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.kneeRisk)}`}>
              K
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.kneeRisk || 'Safe'}
            </div>
          </div>
          
          <div 
            className={`absolute bottom-20 right-12 w-11 h-11 rounded-full ${getRiskColor(metrics?.kneeRisk)} ${getPulseAnimation(metrics?.kneeRisk)} opacity-90 flex items-center justify-center shadow-lg border-2 transition-all duration-300 hover:scale-110 cursor-pointer group`}
            title={`Right Knee: ${metrics?.kneeRisk || 'Safe'}`}
          >
            <span className={`text-xs font-bold ${getTextColor(metrics?.kneeRisk)}`}>
              K
            </span>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {metrics?.kneeRisk || 'Safe'}
            </div>
          </div>
        </div>

        {/* Risk Legend */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border w-full">
          <p className="text-xs font-medium text-gray-700 mb-2 text-center">Risk Levels</p>
          <div className="flex justify-between text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-br from-green-400 to-green-600 rounded-full mr-1"></div>
              <span className="text-gray-600">Safe</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mr-1"></div>
              <span className="text-gray-600">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full mr-1 animate-pulse"></div>
              <span className="text-gray-600">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyHeatmap;
                K
              </span>
            </div>
            <div 
              className={`absolute bottom-20 right-8 w-9 h-9 rounded-full ${getRiskColor(metrics?.kneeRisk)} opacity-80 flex items-center justify-center shadow-md`}
              title={`Right Knee: ${metrics?.kneeRisk || 'Safe'}`}
            >
              <span className={`text-xs font-bold ${getTextColor(metrics?.kneeRisk)}`}>
                K
              </span>
            </div>

            {/* Body center indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Legend with current values */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-white rounded-lg p-3 shadow-md border">
            <div className="flex justify-center space-x-4 text-xs mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="font-medium">High Risk</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                <span className="font-medium">Medium</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="font-medium">Low Risk</span>
              </div>
            </div>
            
            {/* Current status summary */}
            {metrics && (
              <div className="text-center text-xs text-gray-600">
                <div className="font-medium">Current Status:</div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <span>Shoulder: {metrics.shoulderRisk || 'Safe'}</span>
                  <span>Elbow: {metrics.elbowRisk || 'Safe'}</span>
                  <span>Hip: {metrics.hipRisk || 'Safe'}</span>
                  <span>Knee: {metrics.kneeRisk || 'Safe'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyHeatmap;
      }
    };
    
    // Calculate risk levels for each body part
    const shoulderRisk = getRiskLevel(metrics.shoulderRotation || 0, 'shoulder').toLowerCase();
    const elbowRisk = getRiskLevel(metrics.elbowBend || 0, 'elbow').toLowerCase();
    const hipRisk = getRiskLevel(metrics.hipRotation || 0, 'hip').toLowerCase();
    const kneeRisk = getRiskLevel(metrics.kneeAngle || 0, 'knee').toLowerCase();
    
    // Draw body parts with their respective risk levels and angles
    // Head
    ctx.fillStyle = '#ddd';
    ctx.beginPath();
    ctx.arc(width/2, height * 0.15, 20, 0, Math.PI * 2);
    ctx.fill();
    
    // Shoulders
    drawBodyPart(width/2 - 40, height * 0.25, 15, shoulderRisk, metrics.shoulderRotation, 'Shoulder');
    drawBodyPart(width/2 + 40, height * 0.25, 15, shoulderRisk, metrics.shoulderRotation, 'Shoulder');
    
    // Elbows
    drawBodyPart(width/2 - 60, height * 0.35, 12, elbowRisk, metrics.elbowBend, 'Elbow');
    drawBodyPart(width/2 + 60, height * 0.35, 12, elbowRisk, metrics.elbowBend, 'Elbow');
    
    // Hips
    drawBodyPart(width/2 - 30, height * 0.5, 15, hipRisk, metrics.hipRotation, 'Hip');
    drawBodyPart(width/2 + 30, height * 0.5, 15, hipRisk, metrics.hipRotation, 'Hip');
    
    // Knees
    drawBodyPart(width/2 - 25, height * 0.7, 15, kneeRisk, metrics.kneeAngle, 'Knee');
    drawBodyPart(width/2 + 25, height * 0.7, 15, kneeRisk, metrics.kneeAngle, 'Knee');
    
    // Draw connecting lines
    ctx.beginPath();
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.moveTo(width/2, height * 0.15); // Head
    ctx.lineTo(width/2, height * 0.25); // Neck
    ctx.lineTo(width/2 - 40, height * 0.25); // Left shoulder
    ctx.moveTo(width/2, height * 0.25); // Neck
    ctx.lineTo(width/2 + 40, height * 0.25); // Right shoulder
    ctx.moveTo(width/2 - 40, height * 0.25); // Left shoulder
    ctx.lineTo(width/2 - 60, height * 0.35); // Left elbow
    ctx.moveTo(width/2 + 40, height * 0.25); // Right shoulder
    ctx.lineTo(width/2 + 60, height * 0.35); // Right elbow
    ctx.moveTo(width/2, height * 0.25); // Neck
    ctx.lineTo(width/2, height * 0.5); // Torso
    ctx.lineTo(width/2 - 30, height * 0.5); // Left hip
    ctx.lineTo(width/2 - 25, height * 0.7); // Left knee
    ctx.moveTo(width/2, height * 0.5); // Torso
    ctx.lineTo(width/2 + 30, height * 0.5); // Right hip
    ctx.lineTo(width/2 + 25, height * 0.7); // Right knee
    ctx.stroke();
    
    // Reset text alignment
    ctx.textAlign = 'left';
  }, [metrics]);
  
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Body Heatmap</h3>
      <div className="h-64 flex justify-center items-center">
        <canvas 
          ref={canvasRef} 
          width={200} 
          height={400}
          className="w-full h-full"
        />
      </div>
      <div className="mt-2 flex justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
          <span>Safe</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
          <span>High Risk</span>
        </div>
      </div>
    </div>
  );
};

export default BodyHeatmap;
