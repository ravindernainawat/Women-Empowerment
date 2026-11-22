/**
 * Recommendations & Courses API
 */
import { apiClient } from './client';
import { Recommendation, RecommendationStatusEnum } from '../types';
import { MOCK_RECOMMENDATIONS } from '../data/mockData';

let localRecommendations = [...MOCK_RECOMMENDATIONS];

export interface RecommendationGenerationResult {
  message: string;
  assessment_id?: number | null;
  generated_count: number;
  recommendations: Recommendation[];
}

export const recommendationsApi = {
  isDemoMode: false,

  async getRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      const res = await apiClient.get<Recommendation[]>('/api/recommendations');
      this.isDemoMode = false;
      return res.data;
    } catch {
      this.isDemoMode = true;
      return localRecommendations.filter((r) => r.user_id === userId);
    }
  },

  async generateRecommendations(): Promise<RecommendationGenerationResult> {
    try {
      const res = await apiClient.post<RecommendationGenerationResult>('/api/recommendations/generate');
      this.isDemoMode = false;
      return res.data;
    } catch (error) {
      this.isDemoMode = true;
      throw new Error(
        error instanceof Error && error.message ? error.message : 'Recommendation generation is unavailable in live mode.'
      );
    }
  },

  async updateStatus(recommendationId: number, status: RecommendationStatusEnum): Promise<Recommendation> {
    try {
      const res = await apiClient.patch<Recommendation>(`/api/recommendations/${recommendationId}`, { status });
      this.isDemoMode = false;
      return res.data;
    } catch (error) {
      this.isDemoMode = false;
      throw new Error(
        error instanceof Error && error.message ? error.message : 'Unable to update recommendation status in live mode.'
      );
    }
  },
};
