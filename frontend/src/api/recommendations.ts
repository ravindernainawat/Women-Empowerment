/**
 * Recommendations & Courses API — Direct Live Backend Integration
 */
import { apiClient } from './client';
import { Recommendation, RecommendationStatusEnum } from '../types';

export interface RecommendationGenerationResult {
  message: string;
  assessment_id?: number | null;
  generated_count: number;
  recommendations: Recommendation[];
}

export const recommendationsApi = {
  async getRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      const res = await apiClient.get<Recommendation[]>('/api/recommendations');
      return res.data;
    } catch {
      return [];
    }
  },

  async generateRecommendations(): Promise<RecommendationGenerationResult> {
    try {
      const res = await apiClient.post<RecommendationGenerationResult>('/api/recommendations/generate');
      return res.data;
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        (error instanceof Error ? error.message : 'Unable to generate course recommendations.');
      throw new Error(message);
    }
  },

  async updateStatus(recommendationId: number, status: RecommendationStatusEnum): Promise<Recommendation> {
    try {
      const res = await apiClient.patch<Recommendation>(`/api/recommendations/${recommendationId}`, { status });
      return res.data;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Unable to update recommendation status.';
      throw new Error(message);
    }
  },
};
