import React, { useState, useEffect, useCallback } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';

const TrainingPlans = () => {
  const { analysisResults } = useAnalysis();
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [completedSessions, setCompletedSessions] = useState({});

  const loadTrainingPlans = useCallback(() => {
    // Load from localStorage or generate based on user profile
    const savedPlans = localStorage.getItem('trainingPlans');
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      setTrainingPlans(plans);
      setCurrentPlan(plans.find(p => p.status === 'active') || plans[0]);
    } else {
      // Generate default plans based on risk analysis
      const defaultPlans = generateDefaultPlans();
      setTrainingPlans(defaultPlans);
      setCurrentPlan(defaultPlans[0]);
      localStorage.setItem('trainingPlans', JSON.stringify(defaultPlans));
    }
  }, [analysisResults, generateDefaultPlans]);

  useEffect(() => {
    loadTrainingPlans();
    loadCompletedSessions();
  }, [loadTrainingPlans]);



  const loadCompletedSessions = () => {
    const saved = localStorage.getItem('completedSessions');
    if (saved) {
      setCompletedSessions(JSON.parse(saved));
    }
  };

  const generateDefaultPlans = useCallback(() => {
    const riskLevel = analysisResults?.riskLevel || 'low';
    
    const plans = [
      {
        id: 1,
        name: 'Injury Prevention Basics',
        description: 'Foundation exercises to prevent common badminton injuries',
        duration: '4 weeks',
        level: 'Beginner',
        status: 'active',
        assignedBy: 'System Generated',
        assignedDate: new Date().toISOString(),
        riskFocus: ['shoulder', 'knee', 'ankle'],
        exercises: [
          {
            id: 1,
            name: 'Shoulder Rotations',
            description: 'Gentle shoulder mobility exercises',
            duration: '10 minutes',
            sets: 3,
            reps: 15,
            restPeriod: '30 seconds',
            difficulty: 'Easy',
            targetArea: 'Shoulder'
          },
          {
            id: 2,
            name: 'Knee Strengthening',
            description: 'Quadriceps and hamstring strengthening',
            duration: '15 minutes',
            sets: 3,
            reps: 12,
            restPeriod: '45 seconds',
            difficulty: 'Medium',
            targetArea: 'Knee'
          },
          {
            id: 3,
            name: 'Ankle Stability',
            description: 'Balance and stability exercises',
            duration: '12 minutes',
            sets: 3,
            reps: 10,
            restPeriod: '30 seconds',
            difficulty: 'Easy',
            targetArea: 'Ankle'
          }
        ]
      },
      {
        id: 2,
        name: 'Performance Enhancement',
        description: 'Advanced training for improved badminton performance',
        duration: '6 weeks',
        level: 'Intermediate',
        status: 'available',
        assignedBy: 'System Generated',
        assignedDate: new Date().toISOString(),
        riskFocus: ['agility', 'power', 'endurance'],
        exercises: [
          {
            id: 4,
            name: 'Agility Ladder Drills',
            description: 'Footwork and coordination improvement',
            duration: '20 minutes',
            sets: 4,
            reps: 8,
            restPeriod: '60 seconds',
            difficulty: 'Hard',
            targetArea: 'Agility'
          },
          {
            id: 5,
            name: 'Plyometric Jumps',
            description: 'Explosive power development',
            duration: '18 minutes',
            sets: 3,
            reps: 10,
            restPeriod: '90 seconds',
            difficulty: 'Hard',
            targetArea: 'Power'
          }
        ]
      }
    ];

    // Adjust plan based on risk level
    if (riskLevel === 'high') {
      plans[0].name = 'High-Risk Recovery Plan';
      plans[0].description = 'Gentle rehabilitation and risk reduction exercises';
      plans[0].status = 'active';
    }

    return plans;
  }, [analysisResults]);

  const markExerciseComplete = (planId, exerciseId) => {
    const key = `${planId}-${exerciseId}`;
    const newCompleted = {
      ...completedSessions,
      [key]: {
        completedAt: new Date().toISOString(),
        planId,
        exerciseId
      }
    };
    setCompletedSessions(newCompleted);
    localStorage.setItem('completedSessions', JSON.stringify(newCompleted));
  };

  const isExerciseCompleted = (planId, exerciseId) => {
    const key = `${planId}-${exerciseId}`;
    const completed = completedSessions[key];
    if (!completed) return false;
    
    // Check if completed today
    const completedDate = new Date(completed.completedAt).toDateString();
    const today = new Date().toDateString();
    return completedDate === today;
  };

  const getCompletionPercentage = (plan) => {
    const totalExercises = plan.exercises.length;
    const completedToday = plan.exercises.filter(ex => 
      isExerciseCompleted(plan.id, ex.id)
    ).length;
    return Math.round((completedToday / totalExercises) * 100);
  };

  const activatePlan = (planId) => {
    const updatedPlans = trainingPlans.map(plan => ({
      ...plan,
      status: plan.id === planId ? 'active' : 'available'
    }));
    setTrainingPlans(updatedPlans);
    setCurrentPlan(updatedPlans.find(p => p.id === planId));
    localStorage.setItem('trainingPlans', JSON.stringify(updatedPlans));
  };

  return (
    <div className="flex-1 p-8 bg-gray-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Training Plans</h1>
        <p className="mt-2 text-gray-600">
          Personalized training programs designed for injury prevention and performance improvement
        </p>
      </div>

      {/* Current Active Plan */}
      {currentPlan && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h2>
              <p className="text-gray-600">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {getCompletionPercentage(currentPlan)}%
              </div>
              <div className="text-sm text-gray-500">Today's Progress</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">Duration</div>
              <div className="text-lg font-semibold">{currentPlan.duration}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Level</div>
              <div className="text-lg font-semibold">{currentPlan.level}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600 font-medium">Focus Areas</div>
              <div className="text-lg font-semibold">{currentPlan.riskFocus.join(', ')}</div>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Today's Exercises</h3>
          <div className="space-y-4">
            {currentPlan.exercises.map((exercise) => {
              const isCompleted = isExerciseCompleted(currentPlan.id, exercise.id);
              return (
                <div
                  key={exercise.id}
                  className={`p-4 rounded-lg border ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                      <p className="text-gray-600 text-sm">{exercise.description}</p>
                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <span>{exercise.duration}</span>
                        <span>{exercise.sets} sets × {exercise.reps} reps</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          exercise.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                          exercise.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exercise.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {isCompleted ? (
                        <div className="text-green-600 font-medium">✓ Completed</div>
                      ) : (
                        <button
                          onClick={() => markExerciseComplete(currentPlan.id, exercise.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Training Plans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Available Training Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trainingPlans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  plan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>Duration: {plan.duration}</div>
                <div>Level: {plan.level}</div>
                <div>Exercises: {plan.exercises.length}</div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setShowPlanDetails(true);
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm hover:bg-gray-300"
                >
                  View Details
                </button>
                {plan.status !== 'active' && (
                  <button
                    onClick={() => activatePlan(plan.id)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedPlan.name}</h3>
              <button
                onClick={() => setShowPlanDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">{selectedPlan.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Duration:</strong> {selectedPlan.duration}
                </div>
                <div>
                  <strong>Level:</strong> {selectedPlan.level}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exercises:</h4>
                <div className="space-y-3">
                  {selectedPlan.exercises.map((exercise) => (
                    <div key={exercise.id} className="bg-gray-50 p-3 rounded">
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-600">{exercise.description}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {exercise.sets} sets × {exercise.reps} reps • {exercise.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPlanDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
                {selectedPlan.status !== 'active' && (
                  <button
                    onClick={() => {
                      activatePlan(selectedPlan.id);
                      setShowPlanDetails(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Activate Plan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPlans;