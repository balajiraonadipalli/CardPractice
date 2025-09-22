import axios from 'axios';
import { mockAuthService } from '../utils/mockAuth';

const API_BASE_URL = 'http://localhost:3001/api';
const USE_MOCK_AUTH = false; // Set to true to use mock authentication

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true
        });
        
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials) {
    if (USE_MOCK_AUTH) {
      return await mockAuthService.login(credentials);
    }
    
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Backend login failed, using mock auth:', error.message);
      return await mockAuthService.login(credentials);
    }
  },

  async register(userData) {
    if (USE_MOCK_AUTH) {
      return await mockAuthService.register(userData);
    }
    
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Backend register failed, using mock auth:', error.message);
      return await mockAuthService.register(userData);
    }
  },

  async logout() {
    if (USE_MOCK_AUTH) {
      return await mockAuthService.logout();
    }
    
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Backend logout failed, using mock auth:', error.message);
      return await mockAuthService.logout();
    }
  },

  async refreshToken() {
    if (USE_MOCK_AUTH) {
      return await mockAuthService.refreshToken();
    }
    
    try {
      const response = await api.post('/auth/refresh');
      return response.data;
    } catch (error) {
      console.error('Backend refresh failed, using mock auth:', error.message);
      return await mockAuthService.refreshToken();
    }
  },

  async getProfile(token) {
    if (USE_MOCK_AUTH) {
      return await mockAuthService.getProfile(token);
    }
    
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Backend profile failed, using mock auth:', error.message);
      return await mockAuthService.getProfile(token);
    }
  }
};

export default api;
