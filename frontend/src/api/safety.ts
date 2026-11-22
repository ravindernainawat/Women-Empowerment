/**
 * Safety API — corrected paths and no mock fallback.
 *
 * Endpoints used:
 *   getMyReports()           → GET  /api/safety-reports/me       (auth user's own reports)
 *   getAllReports()           → GET  /api/safety-reports           (admin only)
 *   submitReport(payload)    → POST /api/safety-reports           (any authenticated user)
 *   updateReportStatus(…)    → PATCH /api/safety-reports/{id}     (admin only)
 *
 * user_id is derived from the JWT on the backend — never sent in the request body.
 * Errors propagate so callers can show real error UI instead of silently serving stale mock data.
 */
import { apiClient } from './client';
import { SafetyReport, SafetyStatusEnum } from '../types';

export interface CreateSafetyReportPayload {
  incident_type: string;
  description: string;
}

export const safetyApi = {
  /**
   * Get the authenticated user's own safety reports, sorted newest-first.
   * Backend derives user identity from JWT — no userId argument needed.
   */
  async getMyReports(): Promise<SafetyReport[]> {
    const res = await apiClient.get<SafetyReport[]>('/api/safety-reports/me');
    return res.data;
  },

  /**
   * Admin-only: list all safety reports with optional status filter.
   */
  async getAllReports(status?: string): Promise<SafetyReport[]> {
    const params = status && status !== 'all' ? { status } : undefined;
    const res = await apiClient.get<SafetyReport[]>('/api/safety-reports', { params });
    return res.data;
  },

  /**
   * File a new safety report. user_id is derived from JWT on the backend.
   */
  async submitReport(payload: CreateSafetyReportPayload): Promise<SafetyReport> {
    const res = await apiClient.post<SafetyReport>('/api/safety-reports', payload);
    return res.data;
  },

  /**
   * Admin-only: update the status of a safety report.
   */
  async updateReportStatus(reportId: number, status: SafetyStatusEnum): Promise<SafetyReport> {
    const res = await apiClient.patch<SafetyReport>(`/api/safety-reports/${reportId}`, { status });
    return res.data;
  },
};
