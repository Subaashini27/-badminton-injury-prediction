import React from 'react';

const MetricCard = ({ title, value = 0, color, icon, description, playerLevel = 'intermediate' }) => {
  const safeValue = value || 0;
  
  // Simple benchmark data
  const getBenchmark = (title) => {
    const benchmarks = {
      'Shot Power': 65,
      'Footwork': 60,
      'Recovery': 55,
      'Consistency': 60,
      'Smash Power': 65,
      'Clear Height': 60,
      'Drop Shot Precision': 55,
      'Net Shot Accuracy': 60,
      'Court Coverage': 60,
      'Recovery Speed': 55,
      'Footwork Efficiency': 60,
      'Reaction Time': 55
    };
    return benchmarks[title] || 50;
  };
  
  const benchmark = getBenchmark(title);
  
  const getProgressColor = (val) => {
    if (val >= 80) return 'bg-green-500';
    if (val >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-600">Your Progress</span>
          <span className="text-sm font-semibold" style={{ color }}>
            {safeValue}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getProgressColor(safeValue)}`}
            style={{ width: `${safeValue}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-500">Benchmark ({playerLevel})</span>
          <span className="text-xs font-medium text-gray-600">{benchmark}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div
            className="h-1 rounded-full bg-blue-300"
            style={{ width: `${benchmark}%` }}
          ></div>
        </div>
      </div>
      {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
  );
};

export default MetricCard; 