/**
 * Recommendations & Courses API
 */
import { apiClient } from './client';
import { Recommendation, RecommendationStatusEnum } from '../types';
import { MOCK_RECOMMENDATIONS } from '../data/mockData';

let localRecommendations = [...MOCK_RECOMMENDATIONS];

export const recommendationsApi = {
  async getRecommendations(userId: number): Promise<Recommendation[]> {
    try {
      const res = await apiClient.get<Recommendation[]>(`/users/${userId}/recommendations`);
      return res.data;
    } catch {
      return localRecommendations.filter((r) => r.user_id === userId);
    }
  },

  async updateStatus(recommendationId: number, status: RecommendationStatusEnum): Promise<Recommendation> {
    try {
      const res = await apiClient.patch<Recommendation>(`/recommendations/${recommendationId}`, { status });
      return res.data;
    } catch {
      const item = localRecommendations.find((r) => r.recommendation_id === recommendationId);
      if (item) {
        item.status = status;
        return { ...item };
      }
      throw new Error('Recommendation not found');
    }
  },
};
