/**
 * Safety API
 * Handles incident reporting and report tracking with strict role sensitivity.
 */
import { apiClient } from './client';
import { SafetyReport, SafetyStatusEnum } from '../types';
import { MOCK_SAFETY_REPORTS } from '../data/mockData';

let localSafetyReports = [...MOCK_SAFETY_REPORTS];

export interface CreateSafetyReportPayload {
  incident_type: string;
  description: string;
}

export const safetyApi = {
  async getMyReports(userId: number): Promise<SafetyReport[]> {
    try {
      const res = await apiClient.get<SafetyReport[]>(`/users/${userId}/safety-reports`);
      return res.data;
    } catch {
      return localSafetyReports.filter((r) => r.user_id === userId);
    }
  },

  async getAllReports(): Promise<SafetyReport[]> {
    try {
      const res = await apiClient.get<SafetyReport[]>('/admin/safety-reports');
      return res.data;
    } catch {
      return localSafetyReports;
    }
  },

  async submitReport(userId: number, payload: CreateSafetyReportPayload): Promise<SafetyReport> {
    try {
      const res = await apiClient.post<SafetyReport>('/safety-reports', {
        user_id: userId,
        ...payload,
      });
      return res.data;
    } catch {
      const newReport: SafetyReport = {
        report_id: Date.now(),
        user_id: userId,
        incident_type: payload.incident_type,
        description: payload.description,
        status: 'submitted',
        reported_at: new Date().toISOString(),
      };
      localSafetyReports.unshift(newReport);
      return newReport;
    }
  },

  async updateReportStatus(reportId: number, status: SafetyStatusEnum): Promise<SafetyReport> {
    try {
      const res = await apiClient.patch<SafetyReport>(`/admin/safety-reports/${reportId}`, { status });
      return res.data;
    } catch {
      const rep = localSafetyReports.find((r) => r.report_id === reportId);
      if (rep) {
        rep.status = status;
        return { ...rep };
      }
      throw new Error('Report not found');
    }
  },
};
