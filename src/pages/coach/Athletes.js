import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { coachAPI } from '../../services/api';

// Mock data for fallback/demo purposes
const mockAthletes = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    experience: '5 years',
    level: 'Advanced',
    risk_level: 0.25,
    last_analysis: '2024-01-15',
    injuries: 1,
    performance_score: 8.5
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    experience: '3 years',
    level: 'Intermediate',
    risk_level: 0.65,
    last_analysis: '2024-01-14',
    injuries: 2,
    performance_score: 7.2
  },
  {
    id: 3,
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    experience: '7 years',
    level: 'Expert',
    risk_level: 0.15,
    last_analysis: '2024-01-16',
    injuries: 0,
    performance_score: 9.1
  },
  {
    id: 4,
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    experience: '2 years',
    level: 'Beginner',
    risk_level: 0.85,
    last_analysis: '2024-01-13',
    injuries: 3,
    performance_score: 6.8
  },
  {
    id: 5,
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    experience: '4 years',
    level: 'Intermediate',
    risk_level: 0.45,
    last_analysis: '2024-01-15',
    injuries: 1,
    performance_score: 7.9
  }
];

const CoachAthletes = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [useFallbackData, setUseFallbackData] = useState(false);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    experience: '',
    level: 'beginner'
  });
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const fetchAthletes = async (isManualRefresh = false) => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    
    // For seamless presentation, use mock data immediately
    if (!isManualRefresh) {
      setAthletes(mockAthletes);
      setUseFallbackData(true);
      setLastRefresh(new Date());
      setLoading(false);
      return;
    }
    
    // Only try API on manual refresh
    try {
      setIsRefreshing(true);
      const response = await coachAPI.getAthletes(currentUser.id);
      setAthletes(response.data);
      setError(null);
      setUseFallbackData(false);
      setLastRefresh(new Date());
    } catch (err) {
      // Keep using mock data on API failure
      setAthletes(mockAthletes);
      setUseFallbackData(true);
      setLastRefresh(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [currentUser]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only auto-refresh if we're not using fallback data to avoid console errors
      if (!loading && !isRefreshing && !useFallbackData) {
        fetchAthletes(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, isRefreshing, useFallbackData, fetchAthletes]);

  const handleManualRefresh = () => {
    fetchAthletes(true);
  };

  const getRiskLevelText = (riskLevel) => {
    if (riskLevel > 0.7) return 'High';
    if (riskLevel > 0.4) return 'Medium';
    return 'Low';
  };

  const getRiskLevelColor = (riskLevel) => {
    if (riskLevel > 0.7) return 'bg-red-200 text-red-800';
    if (riskLevel > 0.4) return 'bg-yellow-200 text-yellow-800';
    return 'bg-green-200 text-green-800';
  };

  const handleViewProfile = (athlete) => {
    setSelectedAthlete(athlete);
    setShowProfileModal(true);
  };

  const handleAnalyze = (athlete) => {
    // Navigate to the existing injury analysis page
    navigate('/coach/injury-analysis', { 
      state: { 
        athleteId: athlete.id, 
        athleteName: athlete.name 
      } 
    });
  };

  const closeModal = () => {
    setShowProfileModal(false);
    setSelectedAthlete(null);
  };

  const handleAddAthleteSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await coachAPI.addAthlete(currentUser.id, addForm);
      setShowAddModal(false);
      setAddForm({ name: '', email: '', password: '', experience: '', level: 'beginner' });
      fetchAthletes(true); // Refresh with real data
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add athlete.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddAthleteChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({ ...prev, [name]: value }));
  };

  // Profile Modal Component
  const ProfileModal = () => {
    if (!showProfileModal || !selectedAthlete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Athlete Profile</h2>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Athlete Header */}
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {selectedAthlete.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedAthlete.name}</h3>
                <p className="text-gray-600">{selectedAthlete.email}</p>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(selectedAthlete.risk_level)}`}>
                  {getRiskLevelText(selectedAthlete.risk_level)} Risk
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Experience</h4>
                <p className="text-lg font-semibold text-gray-900">{selectedAthlete.experience}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Level</h4>
                <p className="text-lg font-semibold text-gray-900">{selectedAthlete.level}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Performance</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedAthlete.performance_score ? `${selectedAthlete.performance_score}/10` : 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500">Injuries</h4>
                <p className="text-lg font-semibold text-gray-900">{selectedAthlete.injuries || 0}</p>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Assessment</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Injury Risk Level</span>
                    <span className="text-sm font-medium">{(selectedAthlete.risk_level * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedAthlete.risk_level > 0.7 ? 'bg-red-500' :
                        selectedAthlete.risk_level > 0.4 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${selectedAthlete.risk_level * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {selectedAthlete.risk_level > 0.7 ? 'High risk athlete requiring close monitoring' :
                     selectedAthlete.risk_level > 0.4 ? 'Moderate risk athlete with regular check-ups needed' :
                     'Low risk athlete with good technique and conditioning'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Last Analysis: {selectedAthlete.last_analysis ? new Date(selectedAthlete.last_analysis).toLocaleDateString() : 'No recent analysis'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Training Status: {selectedAthlete.injuries > 0 ? 'Modified training due to injury' : 'Full training capacity'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={() => {
                closeModal();
                handleAnalyze(selectedAthlete);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Analyze Performance
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AddAthleteModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <form
          className="bg-white rounded-lg p-6 w-full max-w-md"
          onSubmit={handleAddAthleteSubmit}
        >
          <h2 className="text-xl font-bold mb-4">Add New Athlete</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              name="name"
              value={addForm.name}
              onChange={handleAddAthleteChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={addForm.email}
              onChange={handleAddAthleteChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={addForm.password}
              onChange={handleAddAthleteChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Experience</label>
            <input
              name="experience"
              value={addForm.experience}
              onChange={handleAddAthleteChange}
              className="w-full border rounded px-3 py-2"
              placeholder="e.g. 3 years"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              name="level"
              value={addForm.level}
              onChange={handleAddAthleteChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          {addError && <div className="text-red-600 mb-2">{addError}</div>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-200 rounded"
              disabled={addLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
              disabled={addLoading}
            >
              {addLoading ? 'Adding...' : 'Add Athlete'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Athletes</h1>
          <p className="mt-1 text-gray-500">
            {useFallbackData ? 'Showing demo data.' : 'Manage and monitor your team.'} 
            {lastRefresh && <span className="text-xs ml-2"> (Last updated: {new Date(lastRefresh).toLocaleTimeString()})</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            Add Athlete
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading athletes...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Analysis</th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {athletes.map((athlete) => (
                  <tr key={athlete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold">
                          {athlete.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{athlete.name}</div>
                          <div className="text-sm text-gray-500">{athlete.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{athlete.experience}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(athlete.risk_level)}`}>
                        {getRiskLevelText(athlete.risk_level)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{athlete.performance_score}/10</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{athlete.last_analysis}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleViewProfile(athlete)} className="text-blue-600 hover:text-blue-900">View</button>
                          <button onClick={() => handleAnalyze(athlete)} className="text-indigo-600 hover:text-indigo-900">Analyze</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ProfileModal />
      <AddAthleteModal />
    </div>
  );
};

export default CoachAthletes; 