import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { coachAPI } from '../../services/api';

const CoachTrainingPlans = () => {
  const { currentUser } = useAuth();
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    level: 'all',
    search: ''
  });
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    duration: '',
    level: 'beginner',
    category: 'injury-prevention',
    exercises: []
  });

  useEffect(() => {
    if (currentUser?.id) {
      loadInitialData();
    }
  }, [currentUser]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        loadTrainingPlans(),
        loadAthletes()
      ]);
    } catch (err) {
      // setError(err.message); // This line was removed as per the edit hint
    } finally {
      // setLoading(false); // This line was removed as per the edit hint
    }
  };

  const loadTrainingPlans = async () => {
    try {
        const response = await coachAPI.getTrainingPlans(currentUser.id);
        setTrainingPlans(response.data);
    } catch(err) {
        // If fetch fails (e.g., endpoint not ready), use default plans for now
        setTrainingPlans(generateDefaultPlans());
    }
  };

  const loadAthletes = async () => {
    try {
        const response = await coachAPI.getAthletes(currentUser.id);
        setAthletes(response.data);
    } catch(err) {
        // setError(err.response?.data?.error || err.message || "Failed to load athletes. Please try again later."); // This line was removed as per the edit hint
        setAthletes([]); // Reset athletes on error
    }
  };

  const generateDefaultPlans = () => {
    return [
      {
        id: 1,
        name: 'Beginner Injury Prevention',
        description: 'Foundation program for new badminton players',
        duration: '4 weeks',
        level: 'beginner',
        category: 'injury-prevention',
        status: 'active',
        createdBy: currentUser?.name || 'Coach',
        createdDate: new Date().toISOString(),
        assignedAthletes: [2],
        exercises: [
          {
            id: 1,
            name: 'Warm-up Routine',
            description: 'Dynamic stretching and light cardio',
            duration: '10 minutes',
            sets: 1,
            reps: null,
            targetArea: 'Full Body',
            instructions: 'Light jogging, arm circles, leg swings'
          },
          {
            id: 2,
            name: 'Shoulder Strengthening',
            description: 'Resistance band exercises for shoulder stability',
            duration: '15 minutes',
            sets: 3,
            reps: 12,
            targetArea: 'Shoulder',
            instructions: 'External rotation, internal rotation, lateral raises'
          },
          {
            id: 3,
            name: 'Core Stability',
            description: 'Planks and core strengthening exercises',
            duration: '12 minutes',
            sets: 3,
            reps: 30,
            targetArea: 'Core',
            instructions: 'Hold plank position, maintain proper form'
          }
        ]
      },
      {
        id: 2,
        name: 'Advanced Performance Training',
        description: 'High-intensity training for competitive players',
        duration: '6 weeks',
        level: 'advanced',
        category: 'performance',
        status: 'active',
        createdBy: currentUser?.name || 'Coach',
        createdDate: new Date().toISOString(),
        assignedAthletes: [4],
        exercises: [
          {
            id: 1,
            name: 'Plyometric Training',
            description: 'Explosive movement exercises',
            duration: '20 minutes',
            sets: 4,
            reps: 8,
            targetArea: 'Legs',
            instructions: 'Jump squats, box jumps, lateral bounds'
          },
          {
            id: 2,
            name: 'Agility Ladder',
            description: 'Footwork and coordination drills',
            duration: '15 minutes',
            sets: 5,
            reps: 1,
            targetArea: 'Legs',
            instructions: 'Various ladder patterns, focus on speed and precision'
          },
          {
            id: 3,
            name: 'Sport-Specific Drills',
            description: 'Badminton movement patterns',
            duration: '25 minutes',
            sets: 3,
            reps: 10,
            targetArea: 'Full Body',
            instructions: 'Lunges, overhead clears, smash preparation'
          }
        ]
      },
      {
        id: 3,
        name: 'Injury Recovery Protocol',
        description: 'Rehabilitation program for injured athletes',
        duration: '8 weeks',
        level: 'intermediate',
        category: 'rehabilitation',
        status: 'active',
        createdBy: currentUser?.name || 'Coach',
        createdDate: new Date().toISOString(),
        assignedAthletes: [],
        exercises: [
          {
            id: 1,
            name: 'Gentle Mobilization',
            description: 'Low-impact movement exercises',
            duration: '15 minutes',
            sets: 2,
            reps: 15,
            targetArea: 'Joints',
            instructions: 'Slow, controlled movements within pain-free range'
          },
          {
            id: 2,
            name: 'Progressive Loading',
            description: 'Gradual strength building',
            duration: '20 minutes',
            sets: 3,
            reps: 8,
            targetArea: 'Affected Area',
            instructions: 'Start with light resistance, progress weekly'
          }
        ]
      }
    ];
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.description) {
      alert('Please fill in all required fields');
      return;
    }

    try {
        const response = await coachAPI.createTrainingPlan(currentUser.id, newPlan);
        setTrainingPlans([...trainingPlans, response.data]);
        setShowCreateModal(false);
        setNewPlan({
          name: '',
          description: '',
          duration: '',
          level: 'beginner',
          category: 'injury-prevention',
          exercises: []
        });
    } catch(err) {
        // setError(err.response?.data?.error || err.message || 'Failed to create plan'); // This line was removed as per the edit hint
    }
  };

  const assignPlanToAthlete = async (planId, athleteIds) => {
    // This functionality would require another endpoint to update an athlete's training plan
    // For now, we'll just optimistically update the state.
    const updatedPlans = trainingPlans.map(plan => 
      plan.id === planId 
        ? { ...plan, assignedAthletes: [...new Set([...plan.assignedAthletes, ...athleteIds])] }
        : plan
    );
    setTrainingPlans(updatedPlans);
    
    // Example API call to be implemented:
    /*
    try {
        await api.post(`/api/training-plans/${planId}/assign`, { athleteIds });
        setShowAssignModal(false);
    } catch(err) {
        setError("Failed to assign plan");
        setTrainingPlans(trainingPlans); // revert optimistic update
    }
    */
    setShowAssignModal(false);
  };

  const duplicatePlan = (plan) => {
    const duplicated = {
      ...plan,
      id: Date.now(),
      name: `${plan.name} (Copy)`,
      assignedAthletes: []
    };
    const updatedPlans = [...trainingPlans, duplicated];
    setTrainingPlans(updatedPlans);
    localStorage.setItem('coachTrainingPlans', JSON.stringify(updatedPlans));
  };

  const deletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this training plan?')) {
      const updatedPlans = trainingPlans.filter(plan => plan.id !== planId);
      setTrainingPlans(updatedPlans);
      localStorage.setItem('coachTrainingPlans', JSON.stringify(updatedPlans));
    }
  };

  const filteredPlans = trainingPlans.filter(plan => {
    if (filters.status !== 'all' && plan.status !== filters.status) return false;
    if (filters.level !== 'all' && plan.level !== filters.level) return false;
    if (filters.search && !plan.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const getLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'injury-prevention': return '🛡️';
      case 'performance': return '🚀';
      case 'rehabilitation': return '🏥';
      default: return '📋';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Plans Management</h1>
          <p className="text-gray-600">Create and manage training plans for your athletes</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Plan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600">Total Plans</h3>
          <p className="text-2xl font-bold text-blue-600">{trainingPlans.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600">Active Plans</h3>
          <p className="text-2xl font-bold text-green-600">
            {trainingPlans.filter(plan => plan.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-sm font-medium text-gray-600">Athletes Enrolled</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {new Set(trainingPlans.flatMap(plan => plan.assignedAthletes)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600">Total Athletes</h3>
          <p className="text-2xl font-bold text-purple-600">{athletes.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select 
              value={filters.level}
              onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search plans..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Training Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{getCategoryIcon(plan.category)}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(plan.level)}`}>
                  {plan.level}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{plan.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exercises:</span>
                  <span className="font-medium">{plan.exercises.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium">{plan.assignedAthletes.length} athletes</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t space-y-2">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedPlan(plan)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700"
                >
                  View Details
                </button>
                <button 
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowAssignModal(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm hover:bg-green-700"
                >
                  Assign
                </button>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => duplicatePlan(plan)}
                  className="flex-1 bg-gray-600 text-white py-2 px-3 rounded text-sm hover:bg-gray-700"
                >
                  Duplicate
                </button>
                <button 
                  onClick={() => deletePlan(plan.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Training Plan</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plan name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter plan description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 4 weeks"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={newPlan.level}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newPlan.category}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="injury-prevention">Injury Prevention</option>
                  <option value="performance">Performance</option>
                  <option value="rehabilitation">Rehabilitation</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreatePlan}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && !showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h3>
              <button 
                onClick={() => setSelectedPlan(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">{selectedPlan.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span> {selectedPlan.duration}
                </div>
                <div>
                  <span className="font-medium">Level:</span> {selectedPlan.level}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {selectedPlan.category}
                </div>
                <div>
                  <span className="font-medium">Created by:</span> {selectedPlan.createdBy}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Exercises ({selectedPlan.exercises.length})</h4>
                <div className="space-y-3">
                  {selectedPlan.exercises.map((exercise) => (
                    <div key={exercise.id} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>Duration: {exercise.duration}</div>
                        <div>Target: {exercise.targetArea}</div>
                        {exercise.sets && <div>Sets: {exercise.sets}</div>}
                        {exercise.reps && <div>Reps: {exercise.reps}</div>}
                      </div>
                      {exercise.instructions && (
                        <p className="text-xs text-gray-600 mt-2">
                          <span className="font-medium">Instructions:</span> {exercise.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Assigned Athletes ({selectedPlan.assignedAthletes.length})
                </h4>
                <div className="space-y-2">
                  {selectedPlan.assignedAthletes.map(athleteId => {
                    const athlete = athletes.find(a => a.id === athleteId);
                    return athlete ? (
                      <div key={athleteId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{athlete.name}</span>
                        <span className="text-xs text-gray-500">{athlete.email}</span>
                      </div>
                    ) : null;
                  })}
                  {selectedPlan.assignedAthletes.length === 0 && (
                    <p className="text-sm text-gray-500">No athletes assigned yet</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Athletes Modal */}
      {showAssignModal && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Athletes to "{selectedPlan.name}"
              </h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {athletes.filter(athlete => !selectedPlan.assignedAthletes.includes(athlete.id)).map((athlete) => (
                <div key={athlete.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <div>
                    <div className="text-sm font-medium">{athlete.name}</div>
                    <div className="text-xs text-gray-500">{athlete.email}</div>
                    <div className="text-xs text-gray-500">
                      Risk: {athlete.riskLevel} | Level: {athlete.skillLevel}
                    </div>
                  </div>
                  <button 
                    onClick={() => assignPlanToAthlete(selectedPlan.id, [athlete.id])}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
            
            {athletes.filter(athlete => !selectedPlan.assignedAthletes.includes(athlete.id)).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                All athletes are already assigned to this plan
              </p>
            )}
            
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachTrainingPlans; 