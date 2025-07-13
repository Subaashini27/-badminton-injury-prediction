import React from 'react';

const AnalysisControls = ({ 
  analysisDuration, 
  onDurationChange, 
  onStartAnalysis, 
  isAnalyzing, 
  analysisComplete 
}) => {
  if (isAnalyzing || analysisComplete) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Analyze Your Performance</h2>
      <p className="mb-4">Capture your badminton movements to get detailed performance metrics.</p>
      
      <div className="mb-4">
        <label className="block mb-2">Analysis Duration:</label>
        <select 
          value={analysisDuration} 
          onChange={onDurationChange}
          className="border rounded px-3 py-2 w-full max-w-xs"
        >
          <option value={30}>30 seconds</option>
          <option value={60}>1 minute</option>
          <option value={120}>2 minutes</option>
          <option value={300}>5 minutes</option>
        </select>
      </div>
      
      <button 
        onClick={onStartAnalysis} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Start Analysis
      </button>
    </div>
  );
};

export default AnalysisControls; 