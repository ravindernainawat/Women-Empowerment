/**
 * WEIS Mock Data
 * Realistic data mirroring the Tier 1 schema and UI/UX requirements.
 * Used when backend is in mock/offline mode or during standalone frontend dev.
 */
import {
  User,
  Skill,
  UserSkill,
  SkillGapAssessment,
  Course,
  Recommendation,
  Mentor,
  MentorshipRequest,
  SafetyReport,
} from '../types';

export const MOCK_USERS: User[] = [
  {
    user_id: 1,
    full_name: 'Amina Rao',
    email: 'amina@example.com',
    role: 'mentee',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    created_at: '2026-08-15T10:00:00Z',
  },
  {
    user_id: 2,
    full_name: 'Dr. Sunita Sharma',
    email: 'sunita.sharma@example.com',
    role: 'mentor',
    phone: '+91 98111 22334',
    location: 'Mumbai, India',
    created_at: '2026-07-10T09:30:00Z',
  },
  {
    user_id: 3,
    full_name: 'Priya Iyer',
    email: 'priya.tech@example.com',
    role: 'mentor',
    phone: '+91 97222 33445',
    location: 'Hyderabad, India',
    created_at: '2026-07-12T11:20:00Z',
  },
  {
    user_id: 4,
    full_name: 'Admin User',
    email: 'admin@weis.org',
    role: 'admin',
    phone: '+91 99999 00000',
    location: 'New Delhi, India',
    created_at: '2026-06-01T08:00:00Z',
  },
];

export const MOCK_SKILLS: Skill[] = [
  { skill_id: 1, skill_name: 'Python Programming', category: 'Technical' },
  { skill_id: 2, skill_name: 'Data Analysis (Pandas/SQL)', category: 'Technical' },
  { skill_id: 3, skill_name: 'Communication & Presentation', category: 'Soft Skills' },
  { skill_id: 4, skill_name: 'Project Management (Agile)', category: 'Management' },
  { skill_id: 5, skill_name: 'Machine Learning Basics', category: 'Technical' },
  { skill_id: 6, skill_name: 'Financial Literacy', category: 'Finance' },
  { skill_id: 7, skill_name: 'Digital Marketing & SEO', category: 'Marketing' },
  { skill_id: 8, skill_name: 'UI/UX Design Thinking', category: 'Design' },
];

export const MOCK_USER_SKILLS: UserSkill[] = [
  {
    user_skill_id: 1,
    user_id: 1,
    skill_id: 1,
    proficiency_level: 'intermediate',
    skill: MOCK_SKILLS[0],
  },
  {
    user_skill_id: 2,
    user_id: 1,
    skill_id: 2,
    proficiency_level: 'beginner',
    skill: MOCK_SKILLS[1],
  },
  {
    user_skill_id: 3,
    user_id: 1,
    skill_id: 3,
    proficiency_level: 'intermediate',
    skill: MOCK_SKILLS[2],
  },
];

export const MOCK_ASSESSMENTS: SkillGapAssessment[] = [
  {
    assessment_id: 1,
    user_id: 1,
    target_role: 'Junior Data Analyst',
    overall_score: 72.5,
    assessed_at: '2026-09-02T14:15:00Z',
    gap_details: [
      {
        gap_detail_id: 1,
        assessment_id: 1,
        skill_id: 2,
        required_level: 'advanced',
        current_level: 'beginner',
        gap_score: 55.0,
        skill: MOCK_SKILLS[1],
      },
      {
        gap_detail_id: 2,
        assessment_id: 1,
        skill_id: 1,
        required_level: 'intermediate',
        current_level: 'intermediate',
        gap_score: 10.0,
        skill: MOCK_SKILLS[0],
      },
      {
        gap_detail_id: 3,
        assessment_id: 1,
        skill_id: 3,
        required_level: 'intermediate',
        current_level: 'intermediate',
        gap_score: 5.0,
        skill: MOCK_SKILLS[2],
      },
      {
        gap_detail_id: 4,
        assessment_id: 1,
        skill_id: 5,
        required_level: 'intermediate',
        current_level: 'beginner',
        gap_score: 40.0,
        skill: MOCK_SKILLS[4],
      },
    ],
  },
];

export const MOCK_COURSES: Course[] = [
  {
    course_id: 1,
    title: 'SQL & Relational Databases for Business Analytics',
    provider: 'Coursera & IBM',
    skill_id: 2,
    url: 'https://coursera.org',
    duration_hours: 24,
    skill: MOCK_SKILLS[1],
  },
  {
    course_id: 2,
    title: 'Python for Data Analysis Bootcamp',
    provider: 'freeCodeCamp',
    skill_id: 1,
    url: 'https://freecodecamp.org',
    duration_hours: 30,
    skill: MOCK_SKILLS[0],
  },
  {
    course_id: 3,
    title: 'Executive Communication & Public Speaking for Women Leaders',
    provider: 'WEIS Learning Lab',
    skill_id: 3,
    url: 'https://weis.org/courses/comm-101',
    duration_hours: 12,
    skill: MOCK_SKILLS[2],
  },
  {
    course_id: 4,
    title: 'Practical Intro to Machine Learning with Scikit-Learn',
    provider: 'edX',
    skill_id: 5,
    url: 'https://edx.org',
    duration_hours: 20,
    skill: MOCK_SKILLS[4],
  },
];

export const MOCK_RECOMMENDATIONS: Recommendation[] = [
  {
    recommendation_id: 1,
    user_id: 1,
    course_id: 1,
    match_score: 94.0,
    recommended_at: '2026-09-02T15:00:00Z',
    status: 'enrolled',
    course: MOCK_COURSES[0],
  },
  {
    recommendation_id: 2,
    user_id: 1,
    course_id: 4,
    match_score: 86.5,
    recommended_at: '2026-09-02T15:00:00Z',
    status: 'viewed',
    course: MOCK_COURSES[3],
  },
  {
    recommendation_id: 3,
    user_id: 1,
    course_id: 3,
    match_score: 78.0,
    recommended_at: '2026-09-02T15:00:00Z',
    status: 'pending',
    course: MOCK_COURSES[2],
  },
];

export const MOCK_MENTORS: Mentor[] = [
  {
    mentor_id: 1,
    user_id: 2,
    expertise_area: 'Data Science & Career Transition in Tech',
    bio: '15+ years experience in Tech Leadership and AI research. Passionate about empowering women returning to the technology workforce.',
    is_verified: true,
    user: MOCK_USERS[1],
  },
  {
    mentor_id: 2,
    user_id: 3,
    expertise_area: 'Software Engineering & Cloud Architecture',
    bio: 'Principal Architect with experience in microservices, fintech, and mentoring junior engineers through high-growth career milestones.',
    is_verified: true,
    user: MOCK_USERS[2],
  },
  {
    mentor_id: 3,
    user_id: 1, // sample pending profile
    expertise_area: 'Digital Marketing & Content Strategy',
    bio: 'Growth strategist specializing in early-stage startups and freelance consulting.',
    is_verified: false,
    user: {
      user_id: 5,
      full_name: 'Ananya Deshmukh',
      email: 'ananya.d@example.com',
      role: 'mentor',
      location: 'Pune, India',
    },
  },
];

export const MOCK_MENTORSHIP_REQUESTS: MentorshipRequest[] = [
  {
    request_id: 1,
    mentee_id: 1,
    mentor_id: 1,
    status: 'accepted',
    requested_at: '2026-08-20T11:00:00Z',
    mentor: MOCK_MENTORS[0],
    mentee: MOCK_USERS[0],
  },
  {
    request_id: 2,
    mentee_id: 1,
    mentor_id: 2,
    status: 'pending',
    requested_at: '2026-09-05T09:45:00Z',
    mentor: MOCK_MENTORS[1],
    mentee: MOCK_USERS[0],
  },
];

export const MOCK_SAFETY_REPORTS: SafetyReport[] = [
  {
    report_id: 1,
    user_id: 1,
    incident_type: 'Workplace Discrimination / Exclusion',
    description: 'Encountered biased remarks regarding career gap during a platform networking interview.',
    status: 'under_review',
    reported_at: '2026-08-28T16:30:00Z',
  },
  {
    report_id: 2,
    user_id: 1,
    incident_type: 'Harassment / Inappropriate Communication',
    description: 'Received unsolicited and inappropriate messages from an unverified third party.',
    status: 'resolved',
    reported_at: '2026-07-15T12:10:00Z',
  },
  {
    report_id: 3,
    user_id: 3,
    incident_type: 'Platform Safety / Privacy Concern',
    description: 'Requested verification and anonymity check on external profile link display.',
    status: 'submitted',
    reported_at: '2026-09-10T14:20:00Z',
  },
];
