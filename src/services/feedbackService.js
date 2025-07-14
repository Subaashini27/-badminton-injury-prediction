import api from './api';

const getFeedback = async () => {
  try {
    const response = await api.get('/feedback');
    return response.data;
  } catch (error) {
    throw error;
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

const feedbackService = {
  getFeedback,
  sendFeedback
};

export default feedbackService; 