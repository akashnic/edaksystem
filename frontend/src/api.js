import axios from 'axios';

// For development, use: http://localhost:8000/api/
// For production (NICNET), use: http://<SERVER_IP>:8001/api/ or '/api/'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/';
  let rootUrl = baseUrl;
  if (baseUrl.includes('/api/')) {
    rootUrl = baseUrl.split('/api/')[0];
  }
  return `${rootUrl}${path.startsWith('/') ? path : '/' + path}`;
};

export default api;
