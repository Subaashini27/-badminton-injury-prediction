import React from 'react';

const FeedbackSection = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-medium mb-2">How accurate were these performance metrics?</h3>
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
          Very Accurate
        </button>
        <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">
          Somewhat Accurate
        </button>
        <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
          Not Accurate
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Your feedback helps improve our AI estimation accuracy.
      </p>
    </div>
  );
};

export default FeedbackSection; 