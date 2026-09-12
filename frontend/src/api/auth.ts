/**
 * Auth API Service
 */
import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { MOCK_USERS } from '../data/mockData';

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch {
      // Offline/dev fallback
      const found = MOCK_USERS.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
      const user: User = found || {
        user_id: 999,
        full_name: credentials.email.split('@')[0],
        email: credentials.email,
        role: 'mentee',
      };
      return {
        access_token: 'mock-jwt-token-weis',
        token_type: 'bearer',
        user,
      };
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch {
      const user: User = {
        user_id: Date.now(),
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        phone: data.phone || null,
        location: data.location || null,
        created_at: new Date().toISOString(),
      };
      return {
        access_token: 'mock-jwt-token-weis',
        token_type: 'bearer',
        user,
      };
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch {
      const saved = localStorage.getItem('weis_user');
      if (saved) {
        return JSON.parse(saved);
      }
      return MOCK_USERS[0];
    }
  },
};
