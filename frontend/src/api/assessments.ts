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
  async getAssessments(userId?: number): Promise<SkillGapAssessment[]> {
    try {
      // Backend uses JWT-authenticated /api/users/me/assessments
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
    } catch {
      return localAssessments.filter((a) => (userId ? a.user_id === userId : true));
    }
  },

  async getLatestAssessment(userId?: number): Promise<SkillGapAssessment | null> {
    const list = await this.getAssessments(userId);
    return list.length > 0 ? list[0] : null;
  },

  async getAssessmentById(assessmentId: number): Promise<SkillGapAssessment> {
    try {
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
    } catch {
      const found = localAssessments.find((a) => a.assessment_id === assessmentId);
      if (found) return found;
      throw new Error('Assessment not found');
    }
  },

  async createAssessment(payload: CreateAssessmentPayload): Promise<SkillGapAssessment> {
    try {
      // POST to FastAPI backend /api/assessments
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
    } catch {
      // Offline fallback: deterministic gap scoring
      const gapDetails = payload.skill_ratings.map((sr, idx) => {
        const skill = MOCK_SKILLS.find((s) => s.skill_id === sr.skill_id);
        const levelScore = (lvl: ProficiencyEnum) => (lvl === 'advanced' ? 3 : lvl === 'intermediate' ? 2 : 1);
        const diff = Math.max(0, levelScore(sr.required_level) - levelScore(sr.current_level));
        const gapScore = (diff / 2.0) * 100.0;
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
      const overallScore = Math.max(0, Math.round(100 - avgGap));

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
