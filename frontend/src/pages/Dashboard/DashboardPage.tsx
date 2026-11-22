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
import { VoiceGuidanceButton } from '../../components/common/VoiceGuidanceButton';
import { ReadinessCertificateModal } from '../../components/assessment/ReadinessCertificateModal';
import {
  Target,
  Zap,
  BookOpen,
  Users,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  TrendingUp,
  Award,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [latestAssessment, setLatestAssessment] = useState<SkillGapAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user.role === 'mentee') {
          const [assess, recs, us, reqs] = await Promise.all([
            assessmentsApi.getLatestAssessment(user.user_id),
            recommendationsApi.getRecommendations(user.user_id),
            skillsApi.getUserSkills(user.user_id),
            mentorshipApi.getRequestsForMentee(),
          ]);
          if (isMounted) {
            setLatestAssessment(assess);
            setRecommendations(recs.slice(0, 3));
            setUserSkills(us);
            setRequests(reqs);
          }
        } else if (user.role === 'mentor') {
          const reqs = await mentorshipApi.getRequestsForMentor();
          if (isMounted) {
            setRequests(reqs);
          }
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" color="var(--color-primary-500)" />
      </div>
    );
  }

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // --- MENTEE DASHBOARD ---
  if (user.role === 'mentee') {
    const score = latestAssessment?.overall_score ?? 0;
    const targetRole = latestAssessment?.target_role ?? 'Target Role Not Set';

    return (
      <div>
        {/* Personalized Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(8, 127, 140, 0.08) 0%, rgba(167, 139, 250, 0.12) 50%, rgba(242, 139, 130, 0.08) 100%)',
            border: '1px solid rgba(8, 127, 140, 0.15)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            marginBottom: 'var(--space-8)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-600)', marginBottom: '8px' }}>
                <Sparkles size={14} style={{ color: 'var(--color-accent-500)' }} />
                <span>AI-POWERED INCLUSION PLATFORM</span>
              </div>
              <h1
                style={{
                  fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
                  fontWeight: 800,
                  color: 'var(--color-gray-900)',
                  lineHeight: 1.2,
                  marginBottom: 'var(--space-2)',
                  letterSpacing: '-0.025em',
                }}
              >
                {greeting}, {user.full_name.split(' ')[0]} ✨
              </h1>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', maxWidth: '600px' }}>
                Here is your current career readiness status, ongoing learning pathways, and mentorship connections.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <VoiceGuidanceButton
                textToRead={`${greeting} ${user.full_name.split(' ')[0]}. Welcome to your WEIS career readiness dashboard. Your current readiness score is ${score} percent for the role of ${targetRole}. You have ${userSkills.length} skills logged, ${recommendations.length} course recommendations, and ${requests.length} mentorship connections.`}
                label="Narrate Dashboard"
              />
              <Link to="/assessment">
                <Button variant="gradient" size="md">
                  <Zap size={16} />
                  <span>Run Skill Assessment</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bento Grid: Career Readiness + Stat Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Main Hero Bento Card: Readiness Index */}
          <Card
            padding="lg"
            variant="glass"
            style={{
              gridColumn: 'span 12',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="bento-span-5"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Readiness Evaluation
                </span>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginTop: '2px' }}>
                  Target Role Readiness
                </h3>
              </div>
              <Badge variant="primary" size="sm" hasDot>
                Active Cycle
              </Badge>
            </div>

            {latestAssessment ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2) 0' }}>
                <ProgressRing
                  score={score}
                  size={160}
                  strokeWidth={12}
                  sublabel={score >= 70 ? 'High Match' : 'Foundational'}
                />
                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-gray-800)' }}>
                    Target: {targetRole}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                    Evaluated on {new Date(latestAssessment.assessed_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-3)',
                  }}
                >
                  <Zap size={24} />
                </div>
                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-800)', marginBottom: '4px' }}>
                  No Assessment Run Yet
                </h4>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-xs)', marginBottom: 'var(--space-4)', maxWidth: '280px', margin: '0 auto var(--space-4)' }}>
                  Benchmark your current competencies against tech roles to receive curated recommendations.
                </p>
                <Link to="/assessment">
                  <Button size="sm" variant="primary">
                    Start Evaluation
                  </Button>
                </Link>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setIsCertModalOpen(true)}
                disabled={!latestAssessment}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '12px',
                  fontWeight: 700,
                  color: latestAssessment ? 'var(--color-primary-600)' : 'var(--color-gray-400)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: latestAssessment ? 'pointer' : 'default',
                }}
              >
                <Award size={14} /> Official Credential
              </button>
              <Link to="/assessment" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Full Breakdown <ChevronRight size={14} />
              </Link>
            </div>
          </Card>

          {/* Right Metrics Grid */}
          <div
            style={{
              gridColumn: 'span 12',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-4)',
            }}
            className="bento-span-7"
          >
            {/* Metric 1: Logged Skills */}
            <Card padding="md" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Target size={20} />
                </div>
                <Badge variant="mint" size="sm">
                  Active
                </Badge>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1 }}>
                  {userSkills.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-gray-700)', marginTop: '4px' }}>
                  Skills in Inventory
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                  Verified proficiencies & self-ratings
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-2)' }}>
                <Link to="/skills" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Manage Inventory <ArrowRight size={12} />
                </Link>
              </div>
            </Card>

            {/* Metric 2: Mentorship Connections */}
            <Card padding="md" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-accent-50)',
                    color: 'var(--color-accent-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Users size={20} />
                </div>
                <Badge variant="accent" size="sm">
                  {requests.filter((r) => r.status === 'accepted').length} Active
                </Badge>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1 }}>
                  {requests.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-gray-700)', marginTop: '4px' }}>
                  Mentorship Inquiries
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                  Direct industry connection requests
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-2)' }}>
                <Link to="/mentorship/requests" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-accent-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Review Inquiries <ArrowRight size={12} />
                </Link>
              </div>
            </Card>

            {/* Metric 3: Course Pathways */}
            <Card padding="md" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-coral-50)',
                    color: 'var(--color-coral-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BookOpen size={20} />
                </div>
                <Badge variant="coral" size="sm">
                  Curated
                </Badge>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1 }}>
                  {recommendations.length}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-gray-700)', marginTop: '4px' }}>
                  Targeted Courses
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                  Matched to your identified gaps
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-2)' }}>
                <Link to="/recommendations" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-coral-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Browse Catalog <ArrowRight size={12} />
                </Link>
              </div>
            </Card>

            {/* Metric 4: Safe Space Status */}
            <Card padding="md" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-safety-50)',
                    color: 'var(--color-safety-500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShieldAlert size={20} />
                </div>
                <Badge variant="safety" size="sm">
                  100% Private
                </Badge>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', lineHeight: 1.3 }}>
                  Safety & Sanctuary
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                  Report incidents confidentially with zero peer visibility
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-2)' }}>
                <Link to="/safety/report" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-safety-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Confidential Support <ArrowRight size={12} />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Top Recommended Learning Bento Section */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
                Recommended Learning Roadmaps
              </h2>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                Personalized courses prioritized by your skill-gap assessment
              </p>
            </div>
            <Link to="/recommendations" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View all courses <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-5)' }}>
            {recommendations.map((rec) => (
              <Card key={rec.recommendation_id} padding="md" variant="glass" hoverEffect>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <Badge variant={rec.status === 'enrolled' ? 'primary' : 'neutral'} size="sm" hasDot>
                    {rec.status}
                  </Badge>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-primary-600)',
                      backgroundColor: 'var(--color-primary-50)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {rec.match_score ? `${Math.round(rec.match_score)}% Match` : 'Recommended'}
                  </span>
                </div>

                <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)', lineHeight: 1.4 }}>
                  {rec.course?.title}
                </h4>

                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
                  {rec.course?.skill?.skill_name
                    ? `Curriculum focus: ${rec.course.skill.skill_name} competency`
                    : 'Structured learning roadmap aligned with role expectations'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '11px', color: 'var(--color-gray-500)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BookOpen size={12} /> {rec.course?.provider || 'WEIS Learning'}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> {rec.course?.duration_hours || 10} Hours
                  </span>
                </div>

                <Link to="/recommendations">
                  <Button size="sm" variant={rec.status === 'enrolled' ? 'outline' : 'primary'} style={{ width: '100%' }}>
                    {rec.status === 'enrolled' ? 'Continue Course' : 'View Pathway'}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Launchpad Card */}
        <Card padding="md" variant="glass" style={{ border: '1px solid rgba(8, 127, 140, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <Sparkles size={16} style={{ color: 'var(--color-accent-500)' }} />
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
              Quick Launchpad
            </h3>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/skills">
              <Button size="sm" variant="outline">
                <Target size={14} /> Log New Skill
              </Button>
            </Link>
            <Link to="/assessment">
              <Button size="sm" variant="outline">
                <Zap size={14} /> Re-evaluate Role Gap
              </Button>
            </Link>
            <Link to="/mentorship/directory">
              <Button size="sm" variant="outline">
                <Users size={14} /> Connect With Mentors
              </Button>
            </Link>
            <Link to="/recommendations">
              <Button size="sm" variant="primary">
                <TrendingUp size={14} /> View Opportunity Radar ({score}% Ready)
              </Button>
            </Link>
            <Link to="/safety/report">
              <Button size="sm" variant="safety">
                <Shield size={14} /> Confidential Reporting
              </Button>
            </Link>
          </div>
        </Card>

        {/* Verified Credential Modal */}
        <ReadinessCertificateModal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          user={user}
          assessment={latestAssessment}
        />
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

        {/* Mentor Overview Bento Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-8)' }}>
          <Card padding="md" variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Directory Status
              </span>
              <Badge variant="verified" size="sm" hasDot>
                Active
              </Badge>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'var(--space-3)' }}>
              <CheckCircle2 size={24} style={{ color: 'var(--color-primary-500)' }} />
              <div>
                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                  Verified Mentor
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                  Visible to underprivileged mentees
                </div>
              </div>
            </div>
          </Card>

          <Card padding="md" variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Pending Inquiries
              </span>
              <Badge variant="warning" size="sm" hasDot>
                Action Needed
              </Badge>
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-warning)' }}>
                {requests.filter((r) => r.status === 'pending').length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                Mentees awaiting your confirmation
              </div>
            </div>
          </Card>

          <Card padding="md" variant="glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Active Mentees
              </span>
              <Badge variant="primary" size="sm" hasDot>
                Partnerships
              </Badge>
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary-600)' }}>
                {requests.filter((r) => r.status === 'accepted').length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                Ongoing guidance partnerships
              </div>
            </div>
          </Card>
        </div>

        {/* Inquiries Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
            Recent Mentorship Inquiries
          </h2>
          <Link to="/mentorship/requests">
            <Button size="sm" variant="outline">
              Manage All Requests <ArrowRight size={14} />
            </Button>
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {requests.map((r) => (
            <Card key={r.request_id} padding="md" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                    {r.mentee?.full_name || 'Mentee Candidate'}
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '2px' }}>
                    Location: {r.mentee?.location || 'Remote'} • Requested on {new Date(r.requested_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <Badge variant={r.status === 'accepted' ? 'success' : r.status === 'pending' ? 'warning' : 'neutral'} hasDot>
                    {r.status}
                  </Badge>
                  <Link to="/mentorship/requests">
                    <Button size="sm" variant="outline">
                      Review Inquiry
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // --- ADMIN SUMMARY REDIRECT ---
  return (
    <div>
      <PageTitle
        title="Admin Governance Center"
        description="Oversee verified mentors, platform safety reports, and platform users."
      />
      <Card padding="lg" variant="glass">
        <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-gray-700)' }}>
          You are signed in as a Platform Administrator. Select an operational queue below:
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Link to="/admin">
            <Button variant="primary">
              <Users size={16} /> Open Admin Dashboard
            </Button>
          </Link>
          <Link to="/admin/safety">
            <Button variant="safety">
              <ShieldAlert size={16} /> Review Safety Reports Queue
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
