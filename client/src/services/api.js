import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenGetter = null;

export function setTokenGetter(getter) {
  tokenGetter = getter;
}

api.interceptors.request.use(async (config) => {
  const isAdminRequest = config.url && (config.url.startsWith('/api/admin') || config.url.includes('/api/admin'));

  if (isAdminRequest) {
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
  } else {
    if (tokenGetter) {
      const token = await tokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

export default api;
