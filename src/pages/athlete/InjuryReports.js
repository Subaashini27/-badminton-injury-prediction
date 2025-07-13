import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAnalysis } from '../../context/AnalysisContext';

const InjuryReports = () => {
  const { user } = useAuth();
  const { analysisResults, metricsHistory } = useAnalysis();
  const metrics = analysisResults?.metrics;
  const riskLevel = analysisResults?.riskLevel;
  const [injuryReports, setInjuryReports] = useState([]);
  const [showNewInjuryModal, setShowNewInjuryModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newInjury, setNewInjury] = useState({
    type: '',
    severity: '',
    status: 'Active',
    description: '',
    recommendations: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Load injury reports from localStorage or initialize with sample data
  useEffect(() => {
    const savedReports = localStorage.getItem('injuryReports');
    if (savedReports) {
      setInjuryReports(JSON.parse(savedReports));
    } else {
      // Initial sample data
      const sampleReports = [
        {
          id: 1,
          date: '2024-03-01',
          type: 'Ankle Sprain',
          severity: 'Moderate',
          status: 'Recovered',
          description: 'Right ankle sprain during practice match',
          recommendations: 'Rest and physiotherapy for 2 weeks',
          createdAt: new Date('2024-03-01').toISOString()
        },
        {
          id: 2,
          date: '2024-02-15',
          type: 'Shoulder Strain',
          severity: 'Mild',
          status: 'Recovered',
          description: 'Left shoulder strain from overtraining',
          recommendations: 'Reduced training intensity for 1 week',
          createdAt: new Date('2024-02-15').toISOString()
        }
      ];
      setInjuryReports(sampleReports);
      localStorage.setItem('injuryReports', JSON.stringify(sampleReports));
    }
  }, []);

  // Save to localStorage whenever reports change
  useEffect(() => {
    if (injuryReports.length > 0) {
      localStorage.setItem('injuryReports', JSON.stringify(injuryReports));
    }
  }, [injuryReports]);

  const handleAddNewInjury = (e) => {
    e.preventDefault();
    const newReport = {
      id: Date.now(),
      ...newInjury,
      createdAt: new Date().toISOString()
    };
    
    setInjuryReports(prev => [newReport, ...prev]);
    setShowNewInjuryModal(false);
    setNewInjury({
      type: '',
      severity: '',
      status: 'Active',
      description: '',
      recommendations: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetailsModal(true);
  };

  const handleUpdateInjury = (report) => {
    setSelectedReport(report);
    setNewInjury(report);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    setInjuryReports(prev => 
      prev.map(report => 
        report.id === selectedReport.id 
          ? { ...newInjury, id: selectedReport.id, createdAt: selectedReport.createdAt, updatedAt: new Date().toISOString() }
          : report
      )
    );
    setShowUpdateModal(false);
    setSelectedReport(null);
    setNewInjury({
      type: '',
      severity: '',
      status: 'Active',
      description: '',
      recommendations: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleDeleteInjury = (reportId) => {
    if (window.confirm('Are you sure you want to delete this injury report?')) {
      setInjuryReports(prev => prev.filter(report => report.id !== reportId));
    }
  };

  // Smart risk analysis based on current metrics and injury history
  const analyzeCurrentRisk = () => {
    if (!metrics || injuryReports.length === 0) return null;
    
    const activeInjuries = injuryReports.filter(r => r.status === 'Active');
    const recentInjuries = injuryReports.filter(r => {
      const injuryDate = new Date(r.date);
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 3);
      return injuryDate > monthsAgo;
    });

    const commonInjuryAreas = {};
    injuryReports.forEach(injury => {
      commonInjuryAreas[injury.type] = (commonInjuryAreas[injury.type] || 0) + 1;
    });

    return {
      activeCount: activeInjuries.length,
      recentCount: recentInjuries.length,
      mostCommonInjury: Object.keys(commonInjuryAreas).length > 0 
        ? Object.keys(commonInjuryAreas).reduce((a, b) => commonInjuryAreas[a] > commonInjuryAreas[b] ? a : b)
        : 'None',
      totalInjuries: injuryReports.length,
      currentRiskLevel: riskLevel || 'Unknown'
    };
  };

  // Generate smart recommendations based on analysis
  const generateSmartRecommendations = () => {
    const analysis = analyzeCurrentRisk();
    if (!analysis) return [];

    const recommendations = [];

    if (analysis.activeCount > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Active Injury Monitoring',
        message: `You have ${analysis.activeCount} active injury(ies). Consider reducing training intensity and focusing on recovery.`,
        action: 'Review active injuries and consult with medical staff'
      });
    }

    if (analysis.currentRiskLevel === 'high' && analysis.recentCount > 0) {
      recommendations.push({
        type: 'danger',
        title: 'High Risk Pattern Detected',
        message: 'Your current movement analysis shows high risk patterns similar to your recent injury history.',
        action: 'Consider immediate rest and technique review'
      });
    }

    if (analysis.mostCommonInjury !== 'None' && analysis.totalInjuries > 2) {
      recommendations.push({
        type: 'info',
        title: 'Recurring Injury Pattern',
        message: `${analysis.mostCommonInjury} appears to be your most common injury type. Consider preventive measures.`,
        action: 'Focus on strengthening exercises for this area'
      });
    }

    if (metrics && (metrics.shoulderRotation > 120 || metrics.kneeAngle > 140)) {
      recommendations.push({
        type: 'warning',
        title: 'Movement Risk Detected',
        message: 'Current analysis shows joint angles that may increase injury risk.',
        action: 'Focus on proper form and consider technique coaching'
      });
    }

    return recommendations;
  };

  // Auto-suggest injury report based on high-risk analysis
  const shouldSuggestInjuryReport = () => {
    if (!metrics || !riskLevel) return false;
    
    const highRiskMetrics = [
      metrics.shoulderRotation > 130,
      metrics.elbowBend > 160,
      metrics.kneeAngle > 150,
      metrics.hipRotation > 135
    ].filter(Boolean).length;

    return riskLevel === 'high' && highRiskMetrics >= 2;
  };

  // Show injury risk alert when patterns are detected
  useEffect(() => {
    // This could be integrated with a proper notification system in the future
    // For now, we'll handle it through the UI components directly
  }, [metrics, riskLevel]);

  const smartRecommendations = generateSmartRecommendations();
  const riskAnalysis = analyzeCurrentRisk();

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Injury Reports</h1>
          <p className="mt-1 text-gray-600">Track and manage your injury history.</p>
        </div>
        <button
          onClick={() => setShowNewInjuryModal(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
        >
          Add New Injury
        </button>
      </div>

      {/* Injury Analytics Dashboard */}
      {riskAnalysis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Active Injuries</h3>
            <p className={`text-2xl font-bold ${riskAnalysis.activeCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {riskAnalysis.activeCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Recent Injuries (3mo)</h3>
            <p className={`text-2xl font-bold ${riskAnalysis.recentCount > 2 ? 'text-yellow-500' : 'text-gray-800'}`}>
              {riskAnalysis.recentCount}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Most Common</h3>
            <p className="text-2xl font-bold text-gray-800 truncate" title={riskAnalysis.mostCommonInjury}>
              {riskAnalysis.mostCommonInjury}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-500">Current Risk Level</h3>
            <p className={`text-2xl font-bold capitalize ${
              riskAnalysis.currentRiskLevel === 'high' ? 'text-red-500' :
              riskAnalysis.currentRiskLevel === 'medium' ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {riskAnalysis.currentRiskLevel}
            </p>
          </div>
        </div>
      )}

      {/* Smart Recommendations */}
      {smartRecommendations.length > 0 && (
        <div className="mb-6 space-y-4">
          {smartRecommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg flex items-start gap-3 ${
                rec.type === 'danger' ? 'bg-red-100 border-l-4 border-red-500' :
                rec.type === 'warning' ? 'bg-yellow-100 border-l-4 border-yellow-500' :
                'bg-blue-100 border-l-4 border-blue-500'
            }`}>
              <div>
                <h4 className={`font-semibold ${
                  rec.type === 'danger' ? 'text-red-800' :
                  rec.type === 'warning' ? 'text-yellow-800' :
                  'text-blue-800'
                }`}>{rec.title}</h4>
                <p className={`text-sm ${
                  rec.type === 'danger' ? 'text-red-700' :
                  rec.type === 'warning' ? 'text-yellow-700' :
                  'text-blue-700'
                }`}>{rec.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Injury Reports Table */}
      <div className="bg-white shadow-md rounded-lg">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {injuryReports.map(report => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(report.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            report.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                            report.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                        }`}>{report.severity}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            report.status === 'Active' ? 'bg-red-100 text-red-800' :
                            report.status === 'Recovering' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>{report.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-x-4">
                        <button onClick={() => handleViewDetails(report)} className="text-gray-500 hover:text-blue-600">Details</button>
                        <button onClick={() => handleUpdateInjury(report)} className="text-blue-600 hover:text-blue-900">Update</button>
                        <button onClick={() => handleDeleteInjury(report.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
      
      {/* Modals */}
      <NewInjuryModal show={showNewInjuryModal} onClose={() => setShowNewInjuryModal(false)} onSave={handleAddNewInjury} newInjury={newInjury} setNewInjury={setNewInjury} />
      <UpdateInjuryModal show={showUpdateModal} onClose={() => setShowUpdateModal(false)} onSave={handleUpdateSubmit} injury={selectedReport} setInjury={setNewInjury} />
      <InjuryDetailsModal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} report={selectedReport} />
    </div>
  );
};

const NewInjuryModal = ({ show, onClose, onSave, newInjury, setNewInjury }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSave}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Report New Injury</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Injury Type</label>
                                <input type="text" id="type" value={newInjury.type} onChange={(e) => setNewInjury({...newInjury, type: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date Occurred</label>
                                <input type="date" id="date" value={newInjury.date} onChange={(e) => setNewInjury({...newInjury, date: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
                                <select id="severity" value={newInjury.severity} onChange={(e) => setNewInjury({...newInjury, severity: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                                    <option value="">Select Severity</option>
                                    <option>Mild</option>
                                    <option>Moderate</option>
                                    <option>Severe</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea id="description" rows="3" value={newInjury.description} onChange={(e) => setNewInjury({...newInjury, description: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 text-right">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Save Report</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const UpdateInjuryModal = ({ show, onClose, onSave, injury, setInjury }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <form onSubmit={onSave}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Injury Report</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Injury Type</label>
                                <input type="text" id="type" value={injury.type} onChange={(e) => setInjury({...injury, type: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date Occurred</label>
                                <input type="date" id="date" value={injury.date} onChange={(e) => setInjury({...injury, date: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="severity" className="block text-sm font-medium text-gray-700">Severity</label>
                                <select id="severity" value={injury.severity} onChange={(e) => setInjury({...injury, severity: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required>
                                    <option value="">Select Severity</option>
                                    <option>Mild</option>
                                    <option>Moderate</option>
                                    <option>Severe</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea id="description" rows="3" value={injury.description} onChange={(e) => setInjury({...injury, description: e.target.value})} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 text-right">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700">Update Report</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const InjuryDetailsModal = ({ show, onClose, report }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Injury Details</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <span className="sr-only">Close</span>
                            &times;
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Injury Type</label>
                            <p className="mt-1 text-sm text-gray-900">{report.type}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date of Injury</label>
                            <p className="mt-1 text-sm text-gray-900">{new Date(report.date).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Severity</label>
                            <p className="mt-1">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    report.severity === 'Severe' ? 'bg-red-100 text-red-800' :
                                    report.severity === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {report.severity}
                                </span>
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Status</label>
                             <p className="mt-1">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    report.status === 'Active' ? 'bg-red-100 text-red-800' :
                                    report.status === 'Recovering' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {report.status}
                                </span>
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500">Description</label>
                            <p className="mt-1 text-sm text-gray-900">{report.description || 'No description provided'}</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-500">Recommendations</label>
                            <p className="mt-1 text-sm text-gray-900">{report.recommendations || 'No recommendations provided'}</p>
                        </div>
                        {report.updatedAt && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                                <p className="mt-1 text-sm text-gray-500">
                                    {new Date(report.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 text-right">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    );
}

export default InjuryReports;