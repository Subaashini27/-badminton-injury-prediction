import React from 'react';

const AthleteTraining = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Training Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Training plan cards will go here */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Training Plan</h2>
          <p className="text-gray-600">Your training plan will be displayed here.</p>
        </div>
      </div>
    </div>
  );
};

export default AthleteTraining; 