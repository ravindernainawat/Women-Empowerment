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
    try {
      const res = await apiClient.get<User>('/api/users/me');
      return res.data;
    } catch {
      const saved = localStorage.getItem('weis_user');
      if (saved) return JSON.parse(saved);
      throw new Error('User not found');
    }
  },

  async updateProfile(updates: UpdateProfilePayload): Promise<User> {
    try {
      const res = await apiClient.put<User>('/api/users/me', updates);
      localStorage.setItem('weis_user', JSON.stringify(res.data));
      return res.data;
    } catch {
      // Offline fallback: update stored user in localStorage
      const saved = localStorage.getItem('weis_user');
      if (saved) {
        const user = JSON.parse(saved);
        const updated = { ...user, ...updates };
        localStorage.setItem('weis_user', JSON.stringify(updated));
        return updated;
      }
      throw new Error('Unable to update profile');
    }
  },
};
