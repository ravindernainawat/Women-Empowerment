/**
 * Mentorship API
 */
import { apiClient } from './client';
import { Mentor, MentorshipRequest, MentorshipStatusEnum } from '../types';
import { MOCK_MENTORS, MOCK_MENTORSHIP_REQUESTS, MOCK_USERS } from '../data/mockData';

let localMentors = [...MOCK_MENTORS];
let localRequests = [...MOCK_MENTORSHIP_REQUESTS];

export const mentorshipApi = {
  async getMentors(): Promise<Mentor[]> {
    try {
      const res = await apiClient.get<Mentor[]>('/mentors');
      return res.data;
    } catch {
      return localMentors;
    }
  },

  async getRequestsForMentee(menteeId: number): Promise<MentorshipRequest[]> {
    try {
      const res = await apiClient.get<MentorshipRequest[]>(`/mentorship/requests/mentee/${menteeId}`);
      return res.data;
    } catch {
      return localRequests.filter((r) => r.mentee_id === menteeId);
    }
  },

  async getRequestsForMentor(mentorId: number): Promise<MentorshipRequest[]> {
    try {
      const res = await apiClient.get<MentorshipRequest[]>(`/mentorship/requests/mentor/${mentorId}`);
      return res.data;
    } catch {
      return localRequests.filter((r) => r.mentor_id === mentorId);
    }
  },

  async sendRequest(menteeId: number, mentorId: number): Promise<MentorshipRequest> {
    try {
      const res = await apiClient.post<MentorshipRequest>('/mentorship/requests', {
        mentor_id: mentorId,
      });
      return res.data;
    } catch {
      const mentor = localMentors.find((m) => m.mentor_id === mentorId);
      const mentee = MOCK_USERS.find((u) => u.user_id === menteeId);
      const newReq: MentorshipRequest = {
        request_id: Date.now(),
        mentee_id: menteeId,
        mentor_id: mentorId,
        status: 'pending',
        requested_at: new Date().toISOString(),
        mentor,
        mentee,
      };
      localRequests.unshift(newReq);
      return newReq;
    }
  },

  async updateRequestStatus(requestId: number, status: MentorshipStatusEnum): Promise<MentorshipRequest> {
    try {
      const res = await apiClient.patch<MentorshipRequest>(`/mentorship/requests/${requestId}`, { status });
      return res.data;
    } catch {
      const req = localRequests.find((r) => r.request_id === requestId);
      if (req) {
        req.status = status;
        return { ...req };
      }
      throw new Error('Request not found');
    }
  },
};
