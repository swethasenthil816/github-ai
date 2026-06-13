import axios from 'axios';

const api = axios.create({
  baseURL: 'https://github-ai-y5yx.onrender.com', // Live Render production backend URL
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Sends a POST request to analyze a GitHub repository.
 * 
 * @param {string} githubUrl - The URL of the GitHub repository
 * @returns {Promise<Object>} The analysis data
 */
export async function analyzeRepository(githubUrl) {
  try {
    const response = await api.post('/api/analyze', { githubUrl });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || 'Failed to analyze repository.');
    }
    throw new Error(error.message || 'Network error occurred. Please check your server connection.');
  }
}
