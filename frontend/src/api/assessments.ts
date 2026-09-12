/**
 * Assessments API
 */
import { apiClient } from './client';
import { ProficiencyEnum, SkillGapAssessment } from '../types';
import { MOCK_ASSESSMENTS, MOCK_SKILLS } from '../data/mockData';

let localAssessments = [...MOCK_ASSESSMENTS];

export interface CreateAssessmentPayload {
  user_id: number;
  target_role: string;
  skill_ratings: {
    skill_id: number;
    required_level: ProficiencyEnum;
    current_level: ProficiencyEnum;
  }[];
}

export const assessmentsApi = {
  async getAssessments(userId: number): Promise<SkillGapAssessment[]> {
    try {
      const res = await apiClient.get<SkillGapAssessment[]>(`/users/${userId}/assessments`);
      return res.data;
    } catch {
      return localAssessments.filter((a) => a.user_id === userId);
    }
  },

  async getLatestAssessment(userId: number): Promise<SkillGapAssessment | null> {
    const list = await this.getAssessments(userId);
    return list.length > 0 ? list[list.length - 1] : null;
  },

  async createAssessment(payload: CreateAssessmentPayload): Promise<SkillGapAssessment> {
    try {
      const res = await apiClient.post<SkillGapAssessment>('/assessments', payload);
      return res.data;
    } catch {
      // Calculate simple gap score
      const gapDetails = payload.skill_ratings.map((sr, idx) => {
        const skill = MOCK_SKILLS.find((s) => s.skill_id === sr.skill_id);
        const levelScore = (lvl: ProficiencyEnum) => (lvl === 'advanced' ? 3 : lvl === 'intermediate' ? 2 : 1);
        const diff = Math.max(0, levelScore(sr.required_level) - levelScore(sr.current_level));
        const gapScore = diff * 33.3;
        return {
          gap_detail_id: Date.now() + idx,
          assessment_id: Date.now(),
          skill_id: sr.skill_id,
          required_level: sr.required_level,
          current_level: sr.current_level,
          gap_score: gapScore,
          skill,
        };
      });

      const avgGap = gapDetails.reduce((acc, curr) => acc + (curr.gap_score || 0), 0) / (gapDetails.length || 1);
      const overallScore = Math.max(10, Math.round(100 - avgGap));

      const newAssessment: SkillGapAssessment = {
        assessment_id: Date.now(),
        user_id: payload.user_id,
        target_role: payload.target_role,
        overall_score: overallScore,
        assessed_at: new Date().toISOString(),
        gap_details: gapDetails,
      };

      localAssessments.unshift(newAssessment);
      return newAssessment;
    }
  },
};
