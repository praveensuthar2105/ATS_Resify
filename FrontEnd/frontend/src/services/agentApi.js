import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.atsresify.me/api';

const agentClient = axios.create({
  baseURL: `${API_BASE_URL}/agent`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export const agentAPI = {
  // ==================== Main Chat ====================
  
  /**
   * Send a message to the AI agent
   * @param {Object} params
   * @param {string} params.message - User message
   * @param {number} params.userId - User ID
   * @param {string} [params.sessionId] - Existing session ID (null for new)
   * @param {string} [params.agentType] - BULLET_IMPROVER | JOB_MATCHER | CONTENT_GENERATOR | GENERAL
   * @param {string} [params.context] - Resume content context
   * @param {string} [params.jobDescription] - Job description for matching
   * @param {string} [params.targetRole] - Target role
   */
  chat: async ({ message, userId, sessionId, agentType = 'GENERAL', context, jobDescription, targetRole }) => {
    const response = await agentClient.post('/chat', {
      message,
      userId,
      sessionId,
      agentType,
      context,
      jobDescription,
      targetRole,
    });
    return response.data;
  },

  // ==================== Bullet Improvement ====================

  improveBullet: async (bullet, targetRole = '', context = '') => {
    const response = await agentClient.post('/bullet/improve', { bullet, targetRole, context });
    return response.data;
  },

  batchImproveBullets: async (bullets, targetRole = '', context = '') => {
    const response = await agentClient.post('/bullet/batch', { bullets, targetRole, context });
    return response.data;
  },

  getSuggestions: async (text, targetRole = '') => {
    const response = await agentClient.post('/bullet/suggest', { text, targetRole });
    return response.data;
  },

  // ==================== Job Matching ====================

  analyzeJobMatch: async (resumeContent, jobDescription) => {
    const response = await agentClient.post('/job/match', { resumeContent, jobDescription });
    return response.data;
  },

  getKeywordGaps: async (resumeContent, jobDescription) => {
    const response = await agentClient.post('/job/keywords', { resumeContent, jobDescription });
    return response.data;
  },

  tailorContent: async (currentContent, jobDescription, section = 'experience') => {
    const response = await agentClient.post('/job/tailor', { currentContent, jobDescription, section });
    return response.data;
  },

  // ==================== Content Generation ====================

  generateSummary: async (jobTitle, yearsExperience = 3, targetRole = '', keySkills = '') => {
    const response = await agentClient.post('/content/summary', { jobTitle, yearsExperience, targetRole, keySkills });
    return response.data;
  },

  generateExperience: async (jobTitle, company, description, targetRole = '') => {
    const response = await agentClient.post('/content/experience', { jobTitle, company, description, targetRole });
    return response.data;
  },

  generateProject: async (projectName, techStack, outline, targetRole = '') => {
    const response = await agentClient.post('/content/project', { projectName, techStack, outline, targetRole });
    return response.data;
  },

  generateSkills: async (targetRole, currentSkills = [], jobDescription = '') => {
    const response = await agentClient.post('/content/skills', { targetRole, currentSkills, jobDescription });
    return response.data;
  },

  // ==================== Conversation Management ====================

  getConversations: async (userId) => {
    const response = await agentClient.get('/conversations', { params: { userId } });
    return response.data;
  },

  getConversation: async (sessionId) => {
    const response = await agentClient.get(`/conversation/${sessionId}`);
    return response.data;
  },

  endConversation: async (sessionId) => {
    const response = await agentClient.delete(`/conversation/${sessionId}`);
    return response.data;
  },

  // ==================== Health Check ====================

  healthCheck: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health/redis`);
      return response.data;
    } catch {
      return { status: 'DOWN', available: false };
    }
  },

  // ==================== User Preferences ====================

  /**
   * Get user preferences
   * @param {string} userId
   */
  getPreferences: async (userId) => {
    const response = await agentClient.get('/preferences', { params: { userId } });
    return response.data;
  },

  /**
   * Update user preferences (partial update)
   * @param {string} userId
   * @param {object} updates
   */
  updatePreferences: async (userId, updates) => {
    const response = await agentClient.put('/preferences', updates, { params: { userId } });
    return response.data;
  },

  /**
   * Delete user preferences
   * @param {string} userId
   */
  deletePreferences: async (userId) => {
    const response = await agentClient.delete('/preferences', { params: { userId } });
    return response.data;
  },
};

export default agentAPI;
