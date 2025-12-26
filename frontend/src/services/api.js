import axios from 'axios';

// Use relative paths - Vite proxy will handle it during development
// For production, set VITE_API_BASE_URL env variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  recordLogin: () => api.post('/auth/login'),
  getCurrentUser: () => api.get('/auth/user'),
  getUserById: (userId) => api.get(`/auth/users/${userId}`),
  updateProfile: (data) => api.put('/auth/profile', data),
  deleteAccount: () => api.delete('/auth/profile'),
};

// DOCUMENT ENDPOINTS
export const documentAPI = {
  uploadDocument: (formData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserDocuments: () => api.get('/documents/'),
  getDocumentById: (documentId) => api.get(`/documents/${documentId}`),
  getDocumentText: (documentId) => api.get(`/documents/${documentId}/text`),
  getDownloadUrl: (documentId) => api.get(`/documents/${documentId}/download-url`),
  deleteDocument: (documentId) => api.delete(`/documents/${documentId}`),
};

// SUBTOPIC ENDPOINTS
export const subtopicAPI = {
  extractWithGemini: (documentId) =>
    api.post(`/documents/${documentId}/subtopics/gemini-extract`),
  compareExtractionMethods: (documentId) =>
    api.get(`/documents/${documentId}/subtopics/compare`),
};

// NOTES ENDPOINTS
export const notesAPI = {
  generateNotesForSubtopic: (subtopicId) =>
    api.post(`/subtopics/${subtopicId}/generate-notes`),
  generateNotesForAllSubtopics: (documentId) =>
    api.post(`/documents/${documentId}/generate-all-notes`),
  getNotesForSubtopic: (subtopicId) =>
    api.get(`/subtopics/${subtopicId}/notes`),
  getNotesForDocument: (documentId) =>
    api.get(`/documents/${documentId}/all-notes`),
};

export default api;
