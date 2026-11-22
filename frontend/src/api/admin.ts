/**
 * Admin Governance API endpoints client.
 */

import { apiClient } from './client';
import { AdminStats } from '../types';

export const adminApi = {
  /**
   * Fetches high-level ecosystem telemetry, KPIs, and resolution rates.
   * Requires admin authorization.
   */
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/admin/stats');
    return response.data;
  },
};
