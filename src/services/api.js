import axios from 'axios';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status } = error.response;

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        // Only redirect if not already on login page
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
