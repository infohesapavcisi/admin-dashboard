import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clear();
      window.location.href = '/login';
    }
    if (err.response?.status === 403) {
      useAuthStore.getState().clear();
      alert('Bu hesap admin değil');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
