import React from 'react';

const ExerciseRecommendations = ({ jointAngles }) => {
  const getRecommendations = () => {
    if (!jointAngles) return [];
    
    const recommendations = [];
    
    // Shoulder recommendations
    if (jointAngles.shoulderRisk === 'High Risk' || jointAngles.shoulderRisk === 'Medium Risk') {
      recommendations.push({
        id: 'shoulder',
        title: 'Shoulder Stabilization',
        risk: jointAngles.shoulderRisk,
        exercises: [
          'Resistance band external rotation',
          'Wall slides',
          'Scapular wall holds'
        ],
        duration: '3 sets x 15 reps',
        icon: '🏋️‍♂️'
      });
    }
    
    // Elbow recommendations
    if (jointAngles.elbowRisk === 'High Risk' || jointAngles.elbowRisk === 'Medium Risk') {
      recommendations.push({
        id: 'elbow',
        title: 'Elbow Strengthening',
        risk: jointAngles.elbowRisk,
        exercises: [
          'Wrist curls',
          'Pronation/Supination with light weight',
          'Eccentric elbow flexion'
        ],
        duration: '3 sets x 12 reps',
        icon: '💪'
      });
    }
    
    // Hip recommendations
    if (jointAngles.hipRisk === 'High Risk' || jointAngles.hipRisk === 'Medium Risk') {
      recommendations.push({
        id: 'hip',
        title: 'Hip Mobility & Strength',
        risk: jointAngles.hipRisk,
        exercises: [
          'Hip circles',
          'Clamshells',
          'Single-leg glute bridges'
        ],
        duration: '3 sets x 15 reps each side',
        icon: '🦵'
      });
    }
    
    // Knee recommendations
    if (jointAngles.kneeRisk === 'High Risk' || jointAngles.kneeRisk === 'Medium Risk') {
      recommendations.push({
        id: 'knee',
        title: 'Knee Stability',
        risk: jointAngles.kneeRisk,
        exercises: [
          'Terminal knee extensions',
          'Step-ups',
          'Single-leg balance'
        ],
        duration: '3 sets x 12 reps',
        icon: '🏃‍♂️'
      });
    }
    
    // If everything is safe, provide maintenance exercises
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'maintenance',
        title: 'Maintenance & Prevention',
        risk: 'Safe',
        exercises: [
          'Dynamic warm-up routine',
          'Core strengthening plank variations',
          'Foam rolling and stretching'
        ],
        duration: '10-15 minutes daily',
        icon: '✨'
      });
    }
    
    return recommendations;
  };
  
  const recommendations = getRecommendations();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Exercise Recommendations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded-lg border-2 ${
              rec.risk === 'High Risk' ? 'border-red-200 bg-red-50' :
              rec.risk === 'Medium Risk' ? 'border-amber-200 bg-amber-50' :
              'border-green-200 bg-green-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-2xl mr-2">{rec.icon}</span>
                <h3 className="inline font-semibold text-gray-800">{rec.title}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                rec.risk === 'High Risk' ? 'bg-red-200 text-red-700' :
                rec.risk === 'Medium Risk' ? 'bg-amber-200 text-amber-700' :
                'bg-green-200 text-green-700'
              }`}>
                {rec.risk}
              </span>
            </div>
            
            <ul className="space-y-1 mb-3">
              {rec.exercises.map((exercise, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  {exercise}
                </li>
              ))}
            </ul>
            
            <div className="text-xs text-gray-500 font-medium">
              📅 {rec.duration}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">💡 Tip:</span> Perform these exercises after your training session or on rest days. Always warm up before exercising.
        </p>
      </div>
    </div>
  );
};

export default ExerciseRecommendations; 