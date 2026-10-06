import axios from 'axios';

// Use local URL if running locally, otherwise use production API
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://api.atsresify.me/api' : (isLocalhost ? 'http://localhost:8080/api' : 'https://api.atsresify.me/api'));
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
    const response = await apiClient.post('/resume/generate/async', {
      userResumeDescription,
      templateType,
    });

    const jobId = response?.data?.jobId;
    if (!jobId) {
      throw new Error('Failed to start async resume generation: No jobId returned');
    }

    // Poll status until completed or max retries (60 attempts * 2s = 120s max)
    const maxAttempts = 60;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusRes = await apiClient.get(`/resume/generate/status/${jobId}`);
      const statusData = statusRes?.data;

      if (statusData?.status === 'COMPLETED') {
        let data = statusData.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error('Failed to parse generateResume data as JSON:', e, data);
          }
        }
        return data;
      } else if (statusData?.status === 'FAILED') {
        throw new Error(statusData?.error || 'Resume generation failed on server');
      }
    }

    throw new Error('Resume generation timed out after 2 minutes. Please try again.');
  },

  saveResume: async (resumeData, templateType = 'ats') => {
    const response = await apiClient.post('/resume/save', {
      templateType,
      data: resumeData
    });
    return response?.data;
  },

  calculateAtsScore: async (file, jobDescription = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (jobDescription && jobDescription.trim()) {
      formData.append('jobDescription', jobDescription.trim());
    }

    // Submit async ATS request via RabbitMQ
    const response = await apiClient.post('/resume/ats-score/async', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const jobId = response?.data?.jobId;
    if (!jobId) {
      throw new Error('Failed to start async ATS scoring: No jobId returned');
    }

    // Poll status until completed or max retries (120 attempts * 2s = 240s / 4 mins max)
    const maxAttempts = 120;
    let lastStatusData = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      let statusData = null;
      try {
        const statusRes = await apiClient.get(`/resume/ats-score/status/${jobId}`);
        statusData = statusRes?.data;
      } catch (pollErr) {
        // A transient HTTP error (e.g. 500, gateway hiccup) during polling should not
        // crash the analysis. Log warning and continue polling next cycle.
        console.warn(`Poll attempt ${attempt} encountered transient error (${pollErr.message}), retrying...`);
        continue;
      }
      lastStatusData = statusData;

      if (statusData?.status === 'COMPLETED') {
        let result = statusData.result;
        if (typeof result === 'string') {
          try {
            result = JSON.parse(result);
          } catch (e) {
            console.error('Failed to parse calculateAtsScore result as JSON:', e, result);
          }
        }
        return result;
      } else if (statusData?.status === 'FAILED') {
        throw new Error(statusData?.error || 'ATS analysis failed on server');
      }
    }

    // Do not initiate a duplicate analysis if the existing async job is still pending or processing
    if (lastStatusData?.status === 'PROCESSING' || lastStatusData?.status === 'PENDING') {
      const pendingError = new Error(
        `ATS analysis is still processing on the server (Job ID: ${jobId}). Please check back shortly.`
      );
      pendingError.jobId = jobId;
      pendingError.status = lastStatusData.status;
      throw pendingError;
    }

    // Only if the job is not actively running, attempt synchronous fallback with a bounded
    // server-compatible deadline (180s) to allow for multiple Gemini backend retry attempts
    try {
      console.warn('Async ATS score job not active, falling back to direct scoring endpoint...');
      const fallbackRes = await apiClient.post('/resume/ats-score', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 180000,
      });
      if (fallbackRes?.data) {
        return fallbackRes.data;
      }
    } catch (fallbackErr) {
      console.error('Direct fallback ATS scoring also failed:', fallbackErr);
      throw fallbackErr;
    }

    throw new Error('ATS analysis request timed out. Please try again.');
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

  /**
   * Generate LaTeX from structured resume data using a backend template.
   * @param {object} resumeData - structured resume JSON
   * @param {string} templateType - backend template id (ats | minimal)
   */
  generateLatex: async (resumeData, templateType = 'ats') => {
    const response = await apiClient.post('/latex/generate', {
      resumeData,
      templateType,
    });
    return response?.data;
  },
};

export default apiClient;
