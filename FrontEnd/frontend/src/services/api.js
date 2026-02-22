import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '') || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
});

export const resumeAPI = {
  generateResume: async (userResumeDescription, templateType = 'modern') => {
    const response = await apiClient.post('/resume/generate', {
      userResumeDescription,
      templateType,
    });
    let data = response?.data;
    // Some backends return JSON as string (text/plain). Parse if needed.
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse generateResume response as JSON:', e, data);
        throw new Error('Invalid response from server. Expected JSON.');
      }
    }
    return data;
  },

  calculateAtsScore: async (file, jobDescription = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription && jobDescription.trim()) {
      formData.append('jobDescription', jobDescription.trim());
    }

    const response = await axios.post(`${API_BASE_URL}/resume/ats-score`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    let data = response?.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse calculateAtsScore response as JSON:', e, data);
        throw new Error('Invalid response from server. Expected JSON.');
      }
    }
    return data;
  },
};

export default apiClient;
