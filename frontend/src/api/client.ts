/**
 * WEIS API client — base axios instance.
 * Reads VITE_API_BASE_URL from environment.
 * All service modules import from here.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10_000,
});

/** Attach JWT token to every request if present. */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('weis_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalise error responses. */
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear credentials
      localStorage.removeItem('weis_token');
      localStorage.removeItem('weis_user');

      // Redirect to /login if on a protected route
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        window.location.pathname !== '/'
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);
