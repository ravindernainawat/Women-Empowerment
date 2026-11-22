/**
 * Assessments API — Direct Live Backend Integration
 */
import { apiClient } from './client';
import { ProficiencyEnum, SkillGapAssessment } from '../types';

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
  async getAssessments(userId?: number): Promise<SkillGapAssessment[]> {
    const res = await apiClient.get<any[]>('/api/users/me/assessments');
    return res.data.map((item) => ({
      assessment_id: item.assessment_id,
      user_id: item.user_id,
      target_role: item.target_role,
      overall_score: item.overall_score,
      assessed_at: item.assessed_at,
      gap_details: (item.gap_details || []).map((d: any) => ({
        gap_detail_id: d.gap_detail_id,
        assessment_id: d.assessment_id,
        skill_id: d.skill_id,
        required_level: d.required_level,
        current_level: d.current_level,
        gap_score: d.gap_score,
        skill: {
          skill_id: d.skill_id,
          skill_name: d.skill_name,
          category: d.category,
        },
      })),
    }));
  },

  async getLatestAssessment(userId?: number): Promise<SkillGapAssessment | null> {
    try {
      const list = await this.getAssessments(userId);
      return list.length > 0 ? list[0] : null;
    } catch {
      return null;
    }
  },

  async getAssessmentById(assessmentId: number): Promise<SkillGapAssessment> {
    const res = await apiClient.get<any>(`/api/assessments/${assessmentId}`);
    const item = res.data;
    return {
      assessment_id: item.assessment_id,
      user_id: item.user_id,
      target_role: item.target_role,
      overall_score: item.overall_score,
      assessed_at: item.assessed_at,
      gap_details: (item.gap_details || []).map((d: any) => ({
        gap_detail_id: d.gap_detail_id,
        assessment_id: d.assessment_id,
        skill_id: d.skill_id,
        required_level: d.required_level,
        current_level: d.current_level,
        gap_score: d.gap_score,
        skill: {
          skill_id: d.skill_id,
          skill_name: d.skill_name,
          category: d.category,
        },
      })),
    };
  },

  async createAssessment(payload: CreateAssessmentPayload): Promise<SkillGapAssessment> {
    try {
      const res = await apiClient.post<any>('/api/assessments', {
        target_role: payload.target_role,
        skill_ratings: payload.skill_ratings.map((sr) => ({
          skill_id: sr.skill_id,
          required_level: sr.required_level,
          current_level: sr.current_level,
        })),
      });

      const item = res.data;
      return {
        assessment_id: item.assessment_id,
        user_id: item.user_id,
        target_role: item.target_role,
        overall_score: item.overall_score,
        assessed_at: item.assessed_at,
        gap_details: (item.gap_details || []).map((d: any) => ({
          gap_detail_id: d.gap_detail_id,
          assessment_id: d.assessment_id,
          skill_id: d.skill_id,
          required_level: d.required_level,
          current_level: d.current_level,
          gap_score: d.gap_score,
          skill: {
            skill_id: d.skill_id,
            skill_name: d.skill_name,
            category: d.category,
          },
        })),
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to submit skill assessment.';
      throw new Error(message);
    }
  },
};
