import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { athleteAPI } from '../../services/api';

// Import the new components
import PerformanceTrendChart from '../../components/charts/PerformanceTrendChart';
import SessionHistoryTable from '../../components/tables/SessionHistoryTable';

const Performance = () => {
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  
  const { currentUser } = useAuth();
  
  // Fetch analysis history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      try {
        setHistoryLoading(true);
        const response = await athleteAPI.getAnalysisHistory(currentUser.id);
        setAnalysisHistory(response.data);
        setHistoryLoading(false);
      } catch (error) {
        setHistoryError('Failed to load analysis history.');
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Performance History</h1>
        <p className="text-gray-600">
          Review your performance trends over time. New analysis sessions can be started from your main dashboard.
        </p>
      </div>

      {/* Historical Data Section */}
      <div>
        {historyLoading && <p className="text-center">Loading history...</p>}
        {historyError && <p className="text-center text-red-500">{historyError}</p>}
        {!historyLoading && !historyError && (
          <div className="space-y-8">
            <PerformanceTrendChart history={analysisHistory} />
            <SessionHistoryTable history={analysisHistory} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance; 