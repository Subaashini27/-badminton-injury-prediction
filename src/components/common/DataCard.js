import React from 'react';

const DataCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = 'neutral', 
  suffix = '', 
  onClick,
  className = ''
}) => {
  // Determine the color based on change type
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'neutral':
      default:
        return 'text-gray-500';
    }
  };
  
  // Determine the icon for change
  const getChangeIcon = () => {
    if (!change) return null;
    
    if (changeType === 'positive') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12 7a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h2a1 1 0 011 1v1zm-3 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1v-1z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else if (changeType === 'negative') {
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9 7a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm4 4a1 1 0 00-1-1H9a1 1 0 00-1 1v1a1 1 0 001 1h2a1 1 0 001-1v-1z"
            clipRule="evenodd"
          />
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    
    return null;
  };
  
  return (
    <div 
      className={`bg-white rounded-lg shadow p-6 ${className} ${onClick ? 'cursor-pointer transition-transform hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        {icon && (
          <div className="p-2 rounded-full bg-blue-100 text-blue-500">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end">
        <div className="text-3xl font-bold text-gray-800">
          {value}
          {suffix && <span className="text-xl ml-1">{suffix}</span>}
        </div>
        
        {change && (
          <div className={`flex items-center ml-4 ${getChangeColor()}`}>
            {getChangeIcon()}
            <span className="text-sm ml-1">{change}</span>
          </div>
        )}
      </div>
      
      {/* Optional description or additional info */}
      {/* You can add more elements here if needed */}
    </div>
  );
};

// Example usage:
// <DataCard 
//   title="Injury Risk"
//   value="42"
//   suffix="%"
//   change="+5% from last week"
//   changeType="negative"
//   icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">...</svg>}
//   onClick={() => navigate('/detailed-report')}
// />

export default DataCard;