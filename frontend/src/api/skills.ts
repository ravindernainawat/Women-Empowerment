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
      const res = await apiClient.get<Skill[]>('/skills');
      return res.data;
    } catch {
      return MOCK_SKILLS;
    }
  },

  async getUserSkills(userId: number): Promise<UserSkill[]> {
    try {
      const res = await apiClient.get<UserSkill[]>(`/users/${userId}/skills`);
      return res.data;
    } catch {
      return localUserSkills.filter((us) => us.user_id === userId);
    }
  },

  async addUserSkill(userId: number, skillId: number, level: ProficiencyEnum): Promise<UserSkill> {
    try {
      const res = await apiClient.post<UserSkill>(`/users/${userId}/skills`, {
        skill_id: skillId,
        proficiency_level: level,
      });
      return res.data;
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

  async updateUserSkill(userSkillId: number, level: ProficiencyEnum): Promise<UserSkill> {
    try {
      const res = await apiClient.put<UserSkill>(`/user-skills/${userSkillId}`, {
        proficiency_level: level,
      });
      return res.data;
    } catch {
      const idx = localUserSkills.findIndex((us) => us.user_skill_id === userSkillId);
      if (idx !== -1) {
        localUserSkills[idx] = { ...localUserSkills[idx], proficiency_level: level };
        return localUserSkills[idx];
      }
      throw new Error('Skill not found');
    }
  },

  async deleteUserSkill(userSkillId: number): Promise<void> {
    try {
      await apiClient.delete(`/user-skills/${userSkillId}`);
    } catch {
      localUserSkills = localUserSkills.filter((us) => us.user_skill_id !== userSkillId);
    }
  },
};
