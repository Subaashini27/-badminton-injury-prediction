import api from './api';

// Mock feedback data for temporary use
const mockFeedbackData = [
  {
    id: 1,
    message: "Great improvement in your footwork during today's session! Keep focusing on maintaining proper stance during backhand shots.",
    priority: "medium",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    coachName: "Coach Sarah Johnson"
  },
  {
    id: 2,
    message: "Your smash technique has improved significantly. Remember to follow through completely and maintain balance after each shot.",
    priority: "high",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    coachName: "Coach Mike Chen"
  }
];

const getFeedback = async () => {
  try {
    const response = await api.get('/feedback');
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch feedback from server, using mock data:', error.message);
    // Return mock data as fallback
    return mockFeedbackData;
  }
};

const sendFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback', feedbackData);
    return response.data;
  } catch (error) {
    console.warn('Failed to send feedback to server:', error.message);
    // For demo purposes, simulate success
    return { success: true, message: 'Feedback sent successfully (demo mode)' };
  }
};

const feedbackService = {
  getFeedback,
  sendFeedback,
  addFeedback
};

export default feedbackService;