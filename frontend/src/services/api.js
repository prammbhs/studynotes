import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH ENDPOINTS
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (credentials) => api.post('/api/auth/login', credentials),
  recordLogin: () => api.post('/api/auth/login'),
  getCurrentUser: () => api.get('/api/auth/user'),
  getUserById: (userId) => api.get(`/api/auth/users/${userId}`),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  deleteAccount: () => api.delete('/api/auth/profile'),
};

// DOCUMENT ENDPOINTS
export const documentAPI = {
  uploadDocument: (formData) =>
    api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserDocuments: () => api.get('/api/documents/'),
  getDocumentById: (documentId) => api.get(`/api/documents/${documentId}`),
  getDocumentText: (documentId) => api.get(`/api/documents/${documentId}/text`),
  getDownloadUrl: (documentId) => api.get(`/api/documents/${documentId}/download-url`),
  deleteDocument: (documentId) => api.delete(`/api/documents/${documentId}`),
};

// SUBTOPIC ENDPOINTS
export const subtopicAPI = {
  extractWithGemini: (documentId) =>
    api.post(`/api/documents/${documentId}/subtopics/gemini-extract`),
  compareExtractionMethods: (documentId) =>
    api.get(`/api/documents/${documentId}/subtopics/compare`),
};

// NOTES ENDPOINTS
export const notesAPI = {
  generateNotesForSubtopic: (subtopicId) =>
    api.post(`/api/subtopics/${subtopicId}/generate-notes`),
  generateNotesForAllSubtopics: (documentId) =>
    api.post(`/api/documents/${documentId}/generate-all-notes`),
  getNotesForSubtopic: (subtopicId) =>
    api.get(`/api/subtopics/${subtopicId}/notes`),
  getNotesForDocument: (documentId) =>
    api.get(`/api/documents/${documentId}/all-notes`),
};

export default api;
