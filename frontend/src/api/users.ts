/**
 * Users / Profile API Service
 * Communicates with FastAPI backend /api/users/me
 */
import { apiClient } from './client';
import { User } from '../types';

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string | null;
  location?: string | null;
}

export const usersApi = {
  async getProfile(): Promise<User> {
    const res = await apiClient.get<User>('/api/users/me');
    return res.data;
  },

  async updateProfile(updates: UpdateProfilePayload): Promise<User> {
    const res = await apiClient.put<User>('/api/users/me', updates);
    localStorage.setItem('weis_user', JSON.stringify(res.data));
    return res.data;
  },
};
