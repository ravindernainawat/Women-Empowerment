/**
 * Skills & User Skills API — Direct Live Backend Integration
 */
import { apiClient } from './client';
import { ProficiencyEnum, Skill, UserSkill } from '../types';

export const skillsApi = {
  async getAllSkills(): Promise<Skill[]> {
    const res = await apiClient.get<Skill[]>('/api/skills');
    return res.data;
  },

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    interface BackendUserSkill {
      user_skill_id: number;
      skill_id: number;
      skill_name: string;
      category?: string | null;
      proficiency_level: ProficiencyEnum;
    }
    const res = await apiClient.get<BackendUserSkill[]>('/api/users/me/skills');
    return res.data.map((r) => ({
      user_skill_id: r.user_skill_id,
      user_id: userId,
      skill_id: r.skill_id,
      proficiency_level: r.proficiency_level,
      skill: {
        skill_id: r.skill_id,
        skill_name: r.skill_name,
        category: r.category,
      },
    }));
  },

  async addUserSkill(userId: number, skillId: number, level: ProficiencyEnum): Promise<UserSkill> {
    try {
      const res = await apiClient.post<{
        user_skill_id: number;
        skill_id: number;
        skill_name: string;
        category?: string | null;
        proficiency_level: ProficiencyEnum;
      }>('/api/users/me/skills', {
        skill_id: skillId,
        proficiency_level: level,
      });

      return {
        user_skill_id: res.data.user_skill_id,
        user_id: userId,
        skill_id: res.data.skill_id,
        proficiency_level: res.data.proficiency_level,
        skill: {
          skill_id: res.data.skill_id,
          skill_name: res.data.skill_name,
          category: res.data.category,
        },
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Unable to add skill to inventory.';
      throw new Error(message);
    }
  },

  async updateUserSkill(skillId: number, level: ProficiencyEnum): Promise<UserSkill> {
    try {
      const res = await apiClient.put<{
        user_skill_id: number;
        skill_id: number;
        skill_name: string;
        category?: string | null;
        proficiency_level: ProficiencyEnum;
      }>(`/api/users/me/skills/${skillId}`, {
        proficiency_level: level,
      });

      return {
        user_skill_id: res.data.user_skill_id,
        user_id: 0,
        skill_id: res.data.skill_id,
        proficiency_level: res.data.proficiency_level,
        skill: {
          skill_id: res.data.skill_id,
          skill_name: res.data.skill_name,
          category: res.data.category,
        },
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Unable to update skill proficiency.';
      throw new Error(message);
    }
  },

  async deleteUserSkill(skillId: number): Promise<void> {
    try {
      await apiClient.delete(`/api/users/me/skills/${skillId}`);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Unable to remove skill from inventory.';
      throw new Error(message);
    }
  },
};
