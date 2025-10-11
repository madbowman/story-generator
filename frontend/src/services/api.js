/**
 * API Service
 * Handles all communication with Flask backend
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// AI ENDPOINTS
// ============================================================================

export const aiService = {
  /**
   * Check if Ollama is running
   */
  checkStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  },

  /**
   * List available Ollama models
   */
  listModels: async () => {
    const response = await api.get('/ai/models');
    return response.data;
  },

  /**
   * Chat with AI using conversation history
   */
  chat: async (messages, options = {}) => {
    console.log('Chat messages:', messages);

    const response = await api.post('/ai/chat', {
      messages,
      model: options.model,
      temperature: options.temperature || 0.8,
    });
    return response.data;
  },
};

// ============================================================================
// PROJECT ENDPOINTS
// ============================================================================

export const projectService = {
  /**
   * List all projects
   */
  listProjects: async () => {
    const response = await api.get('/projects');
    return response.data;
  },

  /**
   * Create new project
   */
  createProject: async (title, description = '', genre = '') => {
    const response = await api.post('/projects', {
      title,
      description,
      genre,
    });
    return response.data;
  },

  /**
   * Load project data
   */
  loadProject: async (projectName) => {
    const response = await api.get(`/projects/${projectName}`);
    return response.data;
  },

  /**
   * Save file to project
   */
  saveFile: async (projectName, filePath, data) => {
    const response = await api.post(`/projects/${projectName}/save`, {
      file_path: filePath,
      data,
    });
    return response.data;
  },
};


export default api;