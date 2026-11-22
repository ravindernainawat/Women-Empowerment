/**
 * Auth API Service — Direct Live Backend Integration
 * All operations communicate with the FastAPI backend.
 */
import { apiClient } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

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
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid email or password.';
      throw new Error(message);
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

      // 2. If mentor role and expertise/bio supplied, create mentor profile
      const loginRes = await this.login({ email: data.email, password: data.password });

      if (data.role === 'mentor' && (data.expertise_area || data.bio)) {
        try {
          await apiClient.post('/api/mentors/register', {
            expertise_area: data.expertise_area || 'General Mentorship',
            bio: data.bio || '',
          }, {
            headers: { Authorization: `Bearer ${loginRes.access_token}` },
          });
        } catch (e) {
          console.warn('Mentor profile creation warning:', e);
        }
      }

      return loginRes;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed. Please verify your details.';
      throw new Error(message);
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },
};
