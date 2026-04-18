import axios from 'axios';
import { getToken, clearToken } from '../utils/tokenHelper';

// Use this IP for Expo Go on your phone
const BASE_URL = 'http://192.168.1.68:5000';

/**
 * Axios instance pre-configured with the API base URL.
 * Interceptors automatically attach the PASETO token and handle 401 responses.
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Reads the PASETO token from Expo Secure Store and attaches it as a Bearer token.
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401, clear the stored token so the user is redirected to AuthStack.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearToken();
      // TODO: trigger navigation reset to AuthStack via a navigation ref or event emitter
    }
    return Promise.reject(error);
  }
);

export default api;
