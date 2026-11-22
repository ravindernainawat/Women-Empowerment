/**
 * Mentorship API
 *
 * URL corrections vs. the old file:
 *   getMentors()              → GET  /api/mentors                    (was missing /api prefix)
 *   getMentorsPending()       → GET  /api/mentors/all                (new — admin only)
 *   getRequestsForMentee()    → GET  /api/mentorship-requests/me     (was wrong path)
 *   getRequestsForMentor()    → GET  /api/mentorship-requests/incoming (was nonexistent path)
 *   sendRequest()             → POST /api/mentorship-requests        (was wrong path)
 *   updateRequestStatus()     → PATCH /api/mentorship-requests/{id}  (was wrong path)
 *   verifyMentor()            → PATCH /api/mentors/{id}/verify       (new — admin only)
 *
 * Mock fallback has been REMOVED. Errors propagate so callers can show real
 * error UI instead of silently serving stale mock data.
 */
import { apiClient } from './client';
import { Mentor, MentorshipRequest, MentorshipStatusEnum } from '../types';

export const mentorshipApi = {
  /**
   * List verified mentors. Optionally filter by expertise substring.
   * Requires auth. Available to all roles.
   */
  async getMentors(expertise?: string): Promise<Mentor[]> {
    const params = expertise ? { expertise } : undefined;
    const res = await apiClient.get<Mentor[]>('/api/mentors', { params });
    return res.data;
  },

  /**
   * List ALL mentors (verified + unverified) for admin dashboard.
   * Requires admin role.
   */
  async getMentorsPending(): Promise<Mentor[]> {
    const res = await apiClient.get<Mentor[]>('/api/mentors/all');
    return res.data;
  },

  /**
   * Get all mentorship requests that the current authenticated user sent
   * (mentee perspective). Sorted newest-first.
   */
  async getRequestsForMentee(): Promise<MentorshipRequest[]> {
    const res = await apiClient.get<MentorshipRequest[]>('/api/mentorship-requests/me');
    return res.data;
  },

  /**
   * Get incoming mentorship requests directed at the current authenticated
   * user's mentor profile (mentor perspective). Sorted newest-first.
   */
  async getRequestsForMentor(): Promise<MentorshipRequest[]> {
    const res = await apiClient.get<MentorshipRequest[]>('/api/mentorship-requests/incoming');
    return res.data;
  },

  /**
   * Send a mentorship request to a verified mentor.
   * The backend derives the mentee_id from the JWT — no need to pass it.
   */
  async sendRequest(mentorId: number): Promise<MentorshipRequest> {
    const res = await apiClient.post<MentorshipRequest>('/api/mentorship-requests', {
      mentor_id: mentorId,
    });
    return res.data;
  },

  /**
   * Update the status of a mentorship request (accept / decline / complete).
   * Only the receiving mentor or an admin can call this.
   */
  async updateRequestStatus(
    requestId: number,
    newStatus: MentorshipStatusEnum,
  ): Promise<MentorshipRequest> {
    const res = await apiClient.patch<MentorshipRequest>(
      `/api/mentorship-requests/${requestId}`,
      { status: newStatus },
    );
    return res.data;
  },

  /**
   * Admin-only: set a mentor profile's is_verified flag to true.
   */
  async verifyMentor(mentorId: number): Promise<Mentor> {
    const res = await apiClient.patch<Mentor>(`/api/mentors/${mentorId}/verify`);
    return res.data;
  },
};
