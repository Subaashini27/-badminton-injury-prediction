import React from 'react';

const JointAnglesTable = ({ metrics }) => {
  const jointData = [
    {
      joint: 'Shoulder',
      angle: metrics?.shoulderRotation || 0,
      risk: metrics?.shoulderRisk || 'Safe',
      safeRange: '90-140°',
      tooltip: 'Above 140° may increase shoulder injury risk. Maintain controlled rotation to prevent overextension.'
    },
    {
      joint: 'Hip',
      angle: metrics?.hipRotation || 0,
      risk: metrics?.hipRisk || 'Safe',
      safeRange: '80-120°',
      tooltip: 'Over 120° may strain lower back. Focus on core stability and proper hip alignment.'
    },
    {
      joint: 'Knee',
      angle: metrics?.kneeAngle || 0,
      risk: metrics?.kneeRisk || 'Safe',
      safeRange: '140-165°',
      tooltip: 'More than 165° suggests locked knee. Maintain slight flexion to absorb impact.'
    },
    {
      joint: 'Elbow',
      angle: metrics?.elbowBend || 0,
      risk: metrics?.elbowRisk || 'Safe',
      safeRange: '140-170°',
      tooltip: 'Maintain between 140-170° for safe flexion. Avoid hyperextension during racket swings.'
    }
  ];

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high risk':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium risk':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'safe':
      case 'low risk':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high risk':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'medium risk':
        return (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joint
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Angle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Safe Range
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Info
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jointData.map((joint, index) => (
            <tr key={index} className={`hover:bg-gray-50 ${getRiskColor(joint.risk).split(' ')[1]}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {joint.joint}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-lg font-bold ${getRiskColor(joint.risk).split(' ')[0]}`}>
                  {Math.round(joint.angle)}°
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">
                  {joint.safeRange}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="group relative">
                  <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute right-0 top-6 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    <p className="font-medium mb-1">{joint.joint} Angle Guidance:</p>
                    <p>{joint.tooltip}</p>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(JointAnglesTable);
