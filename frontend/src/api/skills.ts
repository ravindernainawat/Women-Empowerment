/**
 * Skills & User Skills API
 */
import { apiClient } from './client';
import { ProficiencyEnum, Skill, UserSkill } from '../types';
import { MOCK_SKILLS, MOCK_USER_SKILLS } from '../data/mockData';

let localUserSkills = [...MOCK_USER_SKILLS];

export const skillsApi = {
  async getAllSkills(): Promise<Skill[]> {
    try {
      const res = await apiClient.get<Skill[]>('/api/skills');
      return res.data;
    } catch {
      return MOCK_SKILLS;
    }
  },

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    try {
      // Backend uses JWT-authenticated /api/users/me/skills
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
    } catch {
      return localUserSkills.filter((us) => us.user_id === userId);
    }
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
    } catch {
      const targetSkill = MOCK_SKILLS.find((s) => s.skill_id === skillId) || {
        skill_id: skillId,
        skill_name: 'Selected Skill',
      };
      const newUs: UserSkill = {
        user_skill_id: Date.now(),
        user_id: userId,
        skill_id: skillId,
        proficiency_level: level,
        skill: targetSkill,
      };
      localUserSkills.push(newUs);
      return newUs;
    }
  },

  async updateUserSkill(skillId: number, level: ProficiencyEnum): Promise<UserSkill> {
    try {
      // Backend PUT endpoint uses catalogue skill_id in URL
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
    } catch {
      const idx = localUserSkills.findIndex((us) => us.skill_id === skillId || us.user_skill_id === skillId);
      if (idx !== -1) {
        localUserSkills[idx] = { ...localUserSkills[idx], proficiency_level: level };
        return localUserSkills[idx];
      }
      throw new Error('Skill not found');
    }
  },

  async deleteUserSkill(skillId: number): Promise<void> {
    try {
      // Backend DELETE uses catalogue skill_id
      await apiClient.delete(`/api/users/me/skills/${skillId}`);
    } catch {
      localUserSkills = localUserSkills.filter((us) => us.skill_id !== skillId && us.user_skill_id !== skillId);
    }
  },
};
