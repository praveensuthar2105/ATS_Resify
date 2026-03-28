import axios from 'axios';

// Use local URL if running locally, otherwise use production API
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isLocalhost ? 'http://localhost:8080/api' : 'https://api.atsresify.me/api');
export const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, '') || '';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

    const response = await apiClient.post('/resume/ats-score', formData, {
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

  importFromPdf: async (file, source = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source', source);

    const response = await apiClient.post('/resume/import/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data;
  },

  importFromText: async (text) => {
    const response = await apiClient.post('/resume/import/text', { text });
    return response?.data;
  },

  getTemplates: async () => {
    const response = await apiClient.get('/latex/templates');
    return response?.data;
  },
};

export default apiClient;
