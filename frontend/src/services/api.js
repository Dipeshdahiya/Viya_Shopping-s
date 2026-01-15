import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return value;
    }
  }
  return null;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - Add CSRF token and handle session authentication
api.interceptors.request.use(
  (config) => {
    // Add CSRF token to all requests
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    // Session authentication is handled automatically via withCredentials
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect to login automatically - let components handle it
      // This prevents auto-redirect after logout
      // Only redirect if we're on a protected page
      const protectedPaths = ['/profile', '/orders', '/checkout'];
      const currentPath = window.location.pathname;
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

