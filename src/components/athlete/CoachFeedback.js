import React from 'react';
import { format } from 'date-fns';

const CoachFeedback = ({ feedback, isLoading, error }) => {
  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-l-red-500';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-l-yellow-500';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-l-blue-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-gray-500';
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading feedback...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 text-center bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">Could not load feedback</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      );
    }

    if (!feedback || feedback.length === 0) {
      return (
        <div className="p-4 text-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No feedback from your coach yet.</p>
          <p className="text-xs text-gray-400 mt-1">Keep up the great work!</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {feedback.map((item) => (
          <div key={item.id} className={`p-4 border rounded-lg border-l-4 ${getPriorityStyles(item.priority)}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className={`px-2 py-1 rounded text-sm font-medium ${getPriorityStyles(item.priority).split(' ')[0]} ${getPriorityStyles(item.priority).split(' ')[1]}`}>
                  {item.priority} Priority
                </span>
                <p className="mt-2 text-gray-800">
                  {item.message}
                </p>
                <div className="mt-2 text-sm text-gray-500">
                  {item.coachName} • {format(new Date(item.timestamp), "MMM d, yyyy, h:mm a")}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {feedback.length > 3 && (
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all feedback →
            </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Coach Feedback</h2>
      {renderContent()}
    </div>
  );
};

export default CoachFeedback; 