// src/config/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - فقط data رو برگردون
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || 'خطای سرور';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
