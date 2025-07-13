import React, { useState, useEffect, useCallback } from 'react';
import { coachAPI } from '../../services/api';
import feedbackService from '../../services/feedbackService';
import { useAuth } from '../../context/AuthContext';

const AthleteMonitoring = () => {
  const { currentUser } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackPriority, setFeedbackPriority] = useState('Medium');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAthletes = useCallback(async () => {
    if (!currentUser?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await coachAPI.getAthletes(currentUser.id);
      setAthletes(response.data);
      setIsLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch athletes. Please try again later.');
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAthletes();
  }, [fetchAthletes]);
  
  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackMessage || !selectedAthlete) return;

    try {
      await feedbackService.addFeedback({
        athleteId: selectedAthlete.id,
        message: feedbackMessage,
        priority: feedbackPriority,
      });
      setSuccessMessage(`Feedback sent to ${selectedAthlete.name} successfully!`);
      setFeedbackMessage('');
      setFeedbackPriority('Medium');
      setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
    } catch (err) {
      setError('Failed to send feedback. Please try again.');
    }
  };

  const renderSelectedAthleteDetails = () => {
    if (!selectedAthlete) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Select an athlete to view their details and send feedback.</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Feedback for {selectedAthlete.name}
        </h3>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-800 border border-green-200 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSendFeedback}>
          <div className="mb-4">
            <label htmlFor="feedbackMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Feedback Message
            </label>
            <textarea
              id="feedbackMessage"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="w-full p-2 border rounded-lg"
              rows="4"
              placeholder={`e.g., "Great work on your footwork today. Let's focus on your serve tomorrow."`}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="feedbackPriority" className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              id="feedbackPriority"
              value={feedbackPriority}
              onChange={(e) => setFeedbackPriority(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Feedback
          </button>
        </form>
      </div>
    );
  };

  if (isLoading) return <div className="p-6">Loading athletes...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Athlete Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Athlete List */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-md h-fit">
          <h2 className="text-xl font-bold text-gray-800 p-4 border-b">My Athletes</h2>
          <ul>
            {athletes.map((athlete) => (
              <li
                key={athlete.id}
                onClick={() => setSelectedAthlete(athlete)}
                className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedAthlete?.id === athlete.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
              >
                <p className="font-semibold text-gray-900">{athlete.name}</p>
                <p className="text-sm text-gray-500">Risk Level: {athlete.riskProfile?.overall || 'N/A'}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Athlete Details & Feedback Form */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-md">
          {renderSelectedAthleteDetails()}
        </div>
      </div>
    </div>
  );
};

export default AthleteMonitoring;
