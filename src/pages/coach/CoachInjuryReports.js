import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coachAPI } from '../../services/api';

// Mock data for fallback/demo purposes
const mockInjuryReports = [
  {
    id: 1,
    athlete_name: 'Sarah Johnson',
    athlete_id: 1,
    injury_type: 'Ankle Sprain',
    date_occurred: '2024-01-10',
    severity: 'Moderate',
    status: 'Recovering',
    recovery_date: null,
    description: 'Twisted ankle during practice session',
    treatment: 'Rest, ice, compression, elevation'
  },
  {
    id: 2,
    athlete_name: 'Mike Chen',
    athlete_id: 2,
    injury_type: 'Shoulder Strain',
    date_occurred: '2024-01-08',
    severity: 'High',
    status: 'Active',
    recovery_date: null,
    description: 'Overuse injury from repetitive overhead movements',
    treatment: 'Physical therapy, reduced training load'
  },
  {
    id: 3,
    athlete_name: 'Emma Rodriguez',
    athlete_id: 3,
    injury_type: 'Knee Bruise',
    date_occurred: '2024-01-05',
    severity: 'Low',
    status: 'Recovered',
    recovery_date: '2024-01-12',
    description: 'Minor impact injury during match',
    treatment: 'Ice and rest'
  },
  {
    id: 4,
    athlete_name: 'Alex Thompson',
    athlete_id: 4,
    injury_type: 'Wrist Strain',
    date_occurred: '2024-01-03',
    severity: 'Moderate',
    status: 'Recovering',
    recovery_date: null,
    description: 'Repetitive strain from improper grip technique',
    treatment: 'Wrist brace, technique adjustment'
  },
  {
    id: 5,
    athlete_name: 'Lisa Wang',
    athlete_id: 5,
    injury_type: 'Back Stiffness',
    date_occurred: '2024-01-01',
    severity: 'Low',
    status: 'Recovered',
    recovery_date: '2024-01-07',
    description: 'Lower back stiffness from poor posture',
    treatment: 'Stretching exercises, posture correction'
  }
];

const CoachInjuryReports = () => {
  const { currentUser } = useAuth();
  const [injuryReports, setInjuryReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchInjuryReports = async (isManualRefresh = false) => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    // For seamless presentation, use mock data immediately
    if (!isManualRefresh) {
      setInjuryReports(mockInjuryReports);
      setUseFallbackData(true);
      setLastRefresh(new Date());
      setLoading(false);
      return;
    }

    // Only try API on manual refresh
    try {
      setIsRefreshing(true);
      const response = await coachAPI.getInjuryReports(currentUser.id);
      setInjuryReports(response.data);
      setUseFallbackData(false);
      setLastRefresh(new Date());
    } catch (err) {
      // Keep using mock data on API failure
      setInjuryReports(mockInjuryReports);
      setUseFallbackData(true);
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInjuryReports();
  }, [currentUser]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if we're not using fallback data to avoid console errors
      if (!loading && !isRefreshing && !useFallbackData) {
        fetchInjuryReports(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, isRefreshing, useFallbackData]);

  const handleManualRefresh = () => {
    fetchInjuryReports(true);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedReport) return;

    // Update the injury report with new status
    const updatedReports = injuryReports.map(report => {
      if (report.id === selectedReport.id) {
        const updatedReport = { ...report, status: newStatus };
        // If marking as recovered, set recovery date
        if (newStatus === 'Recovered' && !report.recovery_date) {
          updatedReport.recovery_date = new Date().toISOString().split('T')[0];
        }
        return updatedReport;
      }
      return report;
    });

    setInjuryReports(updatedReports);
    setShowUpdateModal(false);
    setSelectedReport(null);
    setNewStatus('');
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowUpdateModal(false);
    setSelectedReport(null);
    setNewStatus('');
  };

  const calculateStats = () => {
    const totalActive = injuryReports.filter(r => r.status === 'Active' || r.status === 'Recovering').length;
    const recoveredThisMonth = injuryReports.filter(r => {
        const recoveredDate = new Date(r.recovery_date);
        const today = new Date();
        return r.status === 'Recovered' && recoveredDate.getMonth() === today.getMonth() && recoveredDate.getFullYear() === today.getFullYear();
    }).length;

    const highRisk = injuryReports.filter(r => r.severity === 'High').length;
    
    // Calculate average recovery time for recovered injuries
    const recoveredInjuries = injuryReports.filter(r => r.status === 'Recovered' && r.recovery_date);
    let averageRecoveryTime = 'N/A';
    
    if (recoveredInjuries.length > 0) {
      const totalDays = recoveredInjuries.reduce((sum, injury) => {
        const startDate = new Date(injury.date_occurred);
        const endDate = new Date(injury.recovery_date);
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      averageRecoveryTime = `${Math.round(totalDays / recoveredInjuries.length)} days`;
    }

    return { totalActive, recoveredThisMonth, highRisk, averageRecoveryTime };
  };

  const injuryStats = calculateStats();

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Details Modal Component
  const DetailsModal = () => {
    if (!showDetailsModal || !selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Injury Report Details</h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Athlete</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedReport.athlete_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Athlete ID</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedReport.athlete_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Injury Type</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{selectedReport.injury_type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Occurred</label>
                <p className="text-gray-900 bg-gray-50 p-2 rounded">{new Date(selectedReport.date_occurred).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                  selectedReport.severity === 'High' ? 'bg-red-100 text-red-800' :
                  selectedReport.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedReport.severity}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                  selectedReport.status === 'Active' ? 'bg-red-100 text-red-800' :
                  selectedReport.status === 'Recovering' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedReport.status}
                </span>
              </div>
              {selectedReport.recovery_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recovery Date</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{new Date(selectedReport.recovery_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedReport.description}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treatment</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedReport.treatment}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={closeModals}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                setShowDetailsModal(false);
                handleUpdateStatus(selectedReport);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Update Status Modal Component
  const UpdateStatusModal = () => {
    if (!showUpdateModal || !selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Update Injury Status</h2>
            <button
              onClick={closeModals}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Athlete</label>
              <p className="text-gray-900">{selectedReport.athlete_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Injury</label>
              <p className="text-gray-900">{selectedReport.injury_type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
              <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${
                selectedReport.status === 'Active' ? 'bg-red-100 text-red-800' :
                selectedReport.status === 'Recovering' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {selectedReport.status}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Recovering">Recovering</option>
                <option value="Recovered">Recovered</option>
              </select>
            </div>
            {newStatus === 'Recovered' && !selectedReport.recovery_date && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Setting status to "Recovered" will automatically set today's date as the recovery date.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={closeModals}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Injury Reports</h1>
          <p className="mt-2 text-gray-600">Monitor and manage athlete injuries</p>
          {lastRefresh && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Active Injuries</h3>
              <p className="text-2xl font-bold text-red-600">{injuryStats.totalActive}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Recovered (This Month)</h3>
              <p className="text-2xl font-bold text-green-600">{injuryStats.recoveredThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">High Severity</h3>
              <p className="text-2xl font-bold text-yellow-600">{injuryStats.highRisk}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Avg. Recovery Time</h3>
              <p className="text-2xl font-bold text-blue-600">{injuryStats.averageRecoveryTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Injury Reports Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Injury Reports ({injuryReports.length} total)</h2>
        </div>
        {injuryReports.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Injury Reports</h3>
            <p className="text-gray-500">No injuries have been reported yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Athlete
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Injury Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {injuryReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {report.athlete_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{report.athlete_name}</div>
                          <div className="text-sm text-gray-500">ID: {report.athlete_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{report.injury_type}</div>
                      <div className="text-sm text-gray-500">{report.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(report.date_occurred).toLocaleDateString()}</div>
                      {report.recovery_date && (
                        <div className="text-sm text-gray-500">
                          Recovered: {new Date(report.recovery_date).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.severity === 'High' ? 'bg-red-100 text-red-800' :
                        report.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        report.status === 'Active' ? 'bg-red-100 text-red-800' :
                        report.status === 'Recovering' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {report.treatment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(report)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Render Modals */}
      <DetailsModal />
      <UpdateStatusModal />
    </div>
  );
};

export default CoachInjuryReports; 