import React from 'react';

const InjurySummary = ({ jointAngles, riskData }) => {
  
  // Enhanced check: Don't render risk data if no valid analysis is available
  // Check if jointAngles is null, undefined, or doesn't contain valid risk data
  if (!jointAngles || 
      !jointAngles.shoulderRisk || 
      !jointAngles.elbowRisk || 
      !jointAngles.hipRisk || 
      !jointAngles.kneeRisk ||
      (typeof jointAngles.shoulderRotation !== 'number') ||
      (typeof jointAngles.elbowBend !== 'number') ||
      (typeof jointAngles.hipRotation !== 'number') ||
      (typeof jointAngles.kneeAngle !== 'number')) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Injury Risk Summary</h2>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="text-center text-gray-500">
            <p className="text-sm font-medium">Start analysis to see risk assessment</p>
            <p className="text-xs mt-1">Risk levels will appear here once pose detection begins</p>
          </div>
        </div>
      </div>
    );
  }

  // Get risk levels for each joint
  const getRiskSummary = () => {
    const summary = { high: [], medium: [], safe: [] };
    
    if (jointAngles.shoulderRisk === 'High Risk') summary.high.push('Shoulders');
    else if (jointAngles.shoulderRisk === 'Medium Risk') summary.medium.push('Shoulders');
    else if (jointAngles.shoulderRisk === 'Safe') summary.safe.push('Shoulders');
    
    if (jointAngles.elbowRisk === 'High Risk') summary.high.push('Elbows');
    else if (jointAngles.elbowRisk === 'Medium Risk') summary.medium.push('Elbows');
    else if (jointAngles.elbowRisk === 'Safe') summary.safe.push('Elbows');
    
    if (jointAngles.hipRisk === 'High Risk') summary.high.push('Hips');
    else if (jointAngles.hipRisk === 'Medium Risk') summary.medium.push('Hips');
    else if (jointAngles.hipRisk === 'Safe') summary.safe.push('Hips');
    
    if (jointAngles.kneeRisk === 'High Risk') summary.high.push('Knees');
    else if (jointAngles.kneeRisk === 'Medium Risk') summary.medium.push('Knees');
    else if (jointAngles.kneeRisk === 'Safe') summary.safe.push('Knees');
    
    return summary;
  };
  
  const summary = getRiskSummary();
  const overallRisk = summary.high.length > 0 ? 'high' : summary.medium.length > 0 ? 'medium' : 'low';
  
  const getSuggestedAction = () => {
    if (summary.high.length > 0) {
      return `Immediate attention needed for ${summary.high.join(', ')}. Stop activity and consult coach.`;
    } else if (summary.medium.length > 0) {
      return `Monitor ${summary.medium.join(', ')} closely. Adjust form and warm up properly.`;
    }
    return 'Good form! Continue with current technique.';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Injury Risk Summary</h2>
      
      {/* Overall Status */}
      <div className={`p-4 rounded-lg mb-4 ${
        overallRisk === 'high' ? 'bg-red-50 border border-red-200' :
        overallRisk === 'medium' ? 'bg-amber-50 border border-amber-200' :
        'bg-green-50 border border-green-200'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Risk Status</span>
          <span className={`text-lg font-bold ${
            overallRisk === 'high' ? 'text-red-600' :
            overallRisk === 'medium' ? 'text-amber-600' :
            'text-green-600'
          }`}>
            {overallRisk === 'high' ? 'HIGH RISK' :
             overallRisk === 'medium' ? 'MEDIUM RISK' :
             'LOW RISK'}
          </span>
        </div>
      </div>
      
      {/* Risk Zones */}
      <div className="space-y-2 mb-4">
        {summary.high.length > 0 && (
          <div className="flex items-center p-2 bg-red-50 rounded">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-red-700">
              High Risk: {summary.high.join(', ')}
            </span>
          </div>
        )}
        {summary.medium.length > 0 && (
          <div className="flex items-center p-2 bg-amber-50 rounded">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-amber-700">
              Medium Risk: {summary.medium.join(', ')}
            </span>
          </div>
        )}
        {summary.safe.length > 0 && (
          <div className="flex items-center p-2 bg-green-50 rounded">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-green-700">
              Safe: {summary.safe.join(', ')}
            </span>
          </div>
        )}
      </div>
      
      {/* Suggested Action */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-medium text-blue-800">
          <span className="font-bold">Suggested Action:</span> {getSuggestedAction()}
        </p>
      </div>
    </div>
  );
};

export default InjurySummary;