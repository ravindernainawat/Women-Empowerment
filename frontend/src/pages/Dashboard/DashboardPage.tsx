import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assessmentsApi } from '../../api/assessments';
import { recommendationsApi } from '../../api/recommendations';
import { skillsApi } from '../../api/skills';
import { mentorshipApi } from '../../api/mentorship';
import { SkillGapAssessment, Recommendation, UserSkill, MentorshipRequest } from '../../types';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PageTitle } from '../../components/common/PageTitle';
import { Spinner } from '../../components/ui/Spinner';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState<SkillGapAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user.role === 'mentee') {
          const [assess, recs, us, reqs] = await Promise.all([
            assessmentsApi.getLatestAssessment(user.user_id),
            recommendationsApi.getRecommendations(user.user_id),
            skillsApi.getUserSkills(user.user_id),
            mentorshipApi.getRequestsForMentee(user.user_id),
          ]);
          setLatestAssessment(assess);
          setRecommendations(recs.slice(0, 3));
          setUserSkills(us);
          setRequests(reqs);
        } else if (user.role === 'mentor') {
          const reqs = await mentorshipApi.getRequestsForMentor(user.user_id);
          setRequests(reqs);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  // --- MENTEE DASHBOARD (per UI/UX Section 4.2) ---
  if (user.role === 'mentee') {
    const score = latestAssessment?.overall_score ?? 0;
    const targetRole = latestAssessment?.target_role ?? 'Target Role Not Set';

    return (
      <div>
        <PageTitle
          title={`Hello, ${user.full_name.split(' ')[0]} 👋`}
          description="Welcome back to your career growth hub. Here is your current readiness and learning path."
          action={
            <Link to="/assessment">
              <Button variant="primary">⚡ Run Assessment</Button>
            </Link>
          }
        />

        {/* Top Grid: Progress Ring + Stat Summaries */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Readiness Score Progress Ring Card */}
          <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Career Readiness Index
            </h3>
            {latestAssessment ? (
              <ProgressRing
                score={score}
                size={150}
                label={`${score}% ready for`}
                sublabel={targetRole}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-3)' }}>
                  You haven't run a skill-gap assessment yet.
                </p>
                <Link to="/assessment">
                  <Button size="sm">Start First Assessment</Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card padding="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Logged Skills
                </div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>
                  {userSkills.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  Technical & soft competencies
                </div>
              </div>
              <Link to="/skills">
                <Button size="sm" variant="outline">
                  Manage →
                </Button>
              </Link>
            </Card>

            <Card padding="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Mentorship Requests
                </div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>
                  {requests.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  {requests.filter((r) => r.status === 'accepted').length} active mentor connection(s)
                </div>
              </div>
              <Link to="/mentorship/requests">
                <Button size="sm" variant="outline">
                  View →
                </Button>
              </Link>
            </Card>

            <Card padding="md" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                  Course Pathways
                </div>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>
                  {recommendations.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  Tailored to your skill gaps
                </div>
              </div>
              <Link to="/recommendations">
                <Button size="sm" variant="outline">
                  Catalog →
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Middle: "Continue Learning" Top Recommendations */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)' }}>
              Top Recommended Learning
            </h2>
            <Link to="/recommendations" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'bold' }}>
              View all courses →
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {recommendations.map((rec) => (
              <Card key={rec.recommendation_id} padding="md" hoverEffect>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <Badge variant={rec.status === 'enrolled' ? 'primary' : 'neutral'} size="sm">
                    {rec.status}
                  </Badge>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
                    {rec.match_score ? `${Math.round(rec.match_score)}% Match` : 'Recommended'}
                  </span>
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)', lineHeight: 1.4 }}>
                  {rec.course?.title}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)' }}>
                  Provider: {rec.course?.provider || 'WEIS Learning'} • {rec.course?.duration_hours || 10} hrs
                </p>
                <Link to="/recommendations">
                  <Button size="sm" variant="outline" style={{ width: '100%' }}>
                    View Course Details
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom: Quick Links (Find Mentor, Run Assessment, Safety Concern) */}
        <Card padding="md" style={{ backgroundColor: 'var(--color-white)' }}>
          <h3 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-3)' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/assessment">
              <Button size="sm" variant="outline">⚡ Retake Skill Assessment</Button>
            </Link>
            <Link to="/mentorship/directory">
              <Button size="sm" variant="outline">🤝 Browse Mentor Directory</Button>
            </Link>
            <Link to="/safety/report">
              <Button size="sm" variant="safety">🛡️ File a Platform Concern</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // --- MENTOR DASHBOARD ---
  if (user.role === 'mentor') {
    return (
      <div>
        <PageTitle
          title={`Mentor Workspace — ${user.full_name}`}
          description="Manage incoming mentorship inquiries, track active mentees, and share professional guidance."
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
          <Card padding="md">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
              Verification Status
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <Badge variant="success" size="md">
                ✓ Verified Mentor
              </Badge>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
              Your profile is visible in the public directory
            </p>
          </Card>

          <Card padding="md">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
              Pending Requests
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-warning)' }}>
              {requests.filter((r) => r.status === 'pending').length}
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
              Mentees awaiting your confirmation
            </p>
          </Card>

          <Card padding="md">
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
              Active Mentees
            </div>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-primary-600)' }}>
              {requests.filter((r) => r.status === 'accepted').length}
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
              Ongoing mentorship partnerships
            </p>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)' }}>
            Recent Mentorship Inquiries
          </h2>
          <Link to="/mentorship/requests">
            <Button size="sm" variant="outline">Manage All Requests →</Button>
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {requests.map((r) => (
            <Card key={r.request_id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-gray-900)' }}>
                  {r.mentee?.full_name || 'Mentee Candidate'}
                </h4>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                  Location: {r.mentee?.location || 'Remote'} • Requested on {new Date(r.requested_at || '').toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'pending' ? 'warning' : 'neutral'}>
                  {r.status}
                </Badge>
                <Link to="/mentorship/requests">
                  <Button size="sm" variant="outline">Review</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- ADMIN REDIRECT/SUMMARY ---
  return (
    <div>
      <PageTitle
        title="Admin Portal"
        description="Oversee verified mentors, platform safety reports, and platform users."
      />
      <Card padding="lg">
        <p style={{ marginBottom: 'var(--space-4)' }}>
          You are signed in as an Administrator. Access the administrative dashboards below:
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link to="/admin">
            <Button variant="primary">Go to Admin Dashboard</Button>
          </Link>
          <Link to="/admin/safety">
            <Button variant="safety">Review Safety Reports Queue</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
