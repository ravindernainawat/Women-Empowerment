/**
 * WEIS Frontend Type Definitions
 * Mirrors app/models.py and weis_schema.sql exactly.
 * Field names are kept identical to the backend — do NOT rename them.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type RoleEnum = 'mentee' | 'mentor' | 'admin';

export type ProficiencyEnum = 'beginner' | 'intermediate' | 'advanced';

export type RecommendationStatusEnum = 'pending' | 'viewed' | 'enrolled' | 'completed';

export type MentorshipStatusEnum = 'pending' | 'accepted' | 'declined' | 'completed';

export type SafetyStatusEnum = 'submitted' | 'under_review' | 'resolved' | 'dismissed';

// ─── Core entities ────────────────────────────────────────────────────────────

/** users table */
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  /** Never expose this in the UI; only the backend handles it. */
  password_hash?: string;
  role: RoleEnum;
  phone?: string | null;
  location?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** skills table */
export interface Skill {
  skill_id: number;
  skill_name: string;
  category?: string | null;
}

/** user_skills table */
export interface UserSkill {
  user_skill_id: number;
  user_id: number;
  skill_id: number;
  proficiency_level: ProficiencyEnum;
  /** Joined from skills when returned by API */
  skill?: Skill;
}

/** skill_gap_assessments table */
export interface SkillGapAssessment {
  assessment_id: number;
  user_id: number;
  target_role: string;
  overall_score?: number | null;
  assessed_at?: string;
  /** Joined detail rows */
  gap_details?: AssessmentGapDetail[];
}

/** assessment_gap_details table */
export interface AssessmentGapDetail {
  gap_detail_id: number;
  assessment_id: number;
  skill_id: number;
  required_level: ProficiencyEnum;
  current_level: ProficiencyEnum;
  gap_score?: number | null;
  /** Joined from skills */
  skill?: Skill;
}

/** courses table */
export interface Course {
  course_id: number;
  title: string;
  provider?: string | null;
  skill_id?: number | null;
  url?: string | null;
  duration_hours?: number | null;
  /** Joined from skills */
  skill?: Skill;
}

/** recommendations table */
export interface Recommendation {
  recommendation_id: number;
  user_id: number;
  course_id: number;
  course_title?: string;
  course_provider?: string | null;
  course_url?: string | null;
  skill_name?: string | null;
  match_score?: number | null;
  recommended_at?: string;
  status: RecommendationStatusEnum;
  /** Joined from courses */
  course?: Course;
}

/** mentors table */
export interface Mentor {
  mentor_id: number;
  user_id: number;
  /** Flat field returned by MentorResponse schema (joined from users on the backend) */
  full_name?: string;
  expertise_area?: string | null;
  bio?: string | null;
  is_verified: boolean;
  /** Joined from users */
  user?: User;
}

/** mentorship_requests table */
export interface MentorshipRequest {
  request_id: number;
  mentee_id: number;
  mentor_id: number;
  status: MentorshipStatusEnum;
  requested_at?: string;
  /**
   * Flat name strings returned directly by the backend API
   * (MentorshipRequestResponse schema). These are the canonical fields
   * when data comes from the real API.
   */
  mentee_name?: string;
  mentor_name?: string;
  mentor_expertise?: string | null;
  /** Joined entities — populated only when using mock data or enriched client-side */
  mentor?: Mentor;
  mentee?: User;
}

/** safety_reports table */
export interface SafetyReport {
  report_id: number;
  user_id: number;
  incident_type: string;
  description: string;
  status: SafetyStatusEnum;
  reported_at?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  role: RoleEnum;
  phone?: string;
  location?: string;
  /** Mentor-only additional fields */
  expertise_area?: string;
  bio?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  user: User;
}

// ─── API helpers ──────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface AdminStats {
  total_users: number;
  total_mentees: number;
  total_mentors: number;
  verified_mentors: number;
  pending_mentors: number;
  total_assessments: number;
  avg_readiness_score: number;
  total_skills_logged: number;
  catalog_skills_count: number;
  total_safety_reports: number;
  open_safety_reports: number;
  resolved_safety_reports: number;
  total_mentorship_requests: number;
  accepted_mentorship_requests: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
