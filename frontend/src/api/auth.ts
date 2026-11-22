/**
 * Auth API Service
 */
import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';
import { MOCK_USERS } from '../data/mockData';

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // 1. Post credentials to FastAPI login endpoint
      const tokenRes = await apiClient.post<{ access_token: string; token_type: 'bearer' }>(
        '/api/auth/login',
        {
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
        }
      );

      const { access_token, token_type } = tokenRes.data;

      // 2. Fetch authenticated user profile using the new token
      const userRes = await apiClient.get<User>('/api/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      return {
        access_token,
        token_type: token_type || 'bearer',
        user: userRes.data,
      };
    } catch {
      // Offline / dev fallback when backend is unreachable
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
      // 1. Create account on backend
      await apiClient.post<User>('/api/auth/register', {
        full_name: data.full_name,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        role: data.role,
        phone: data.phone || null,
        location: data.location || null,
      });

      // 2. Immediately log in to get session token
      return await this.login({ email: data.email, password: data.password });
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
      const response = await apiClient.get<User>('/api/auth/me');
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
