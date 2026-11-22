import React, { useState, useEffect, useCallback } from 'react';
import { safetyApi } from '../../api/safety';
import { mentorshipApi } from '../../api/mentorship';
import { adminApi } from '../../api/admin';
import { SafetyReport, SafetyStatusEnum, Mentor, AdminStats } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../context/ToastContext';
import { VoiceGuidanceButton } from '../../components/common/VoiceGuidanceButton';
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  Users,
  Target,
  Award,
  TrendingUp,
  BarChart3,
  HeartHandshake,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const toast = useToast();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rList, mList, sData] = await Promise.all([
        safetyApi.getAllReports(),
        mentorshipApi.getMentorsPending(),
        adminApi.getStats(),
      ]);
      setReports(rList);
      setMentors(mList);
      setStats(sData);
    } catch {
      toast.error('Failed to load administrative telemetry data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateReportStatus = async (reportId: number, status: SafetyStatusEnum) => {
    try {
      const updated = await safetyApi.updateReportStatus(reportId, status);
      setReports((prev) => prev.map((r) => (r.report_id === reportId ? updated : r)));
      if (stats) {
        setStats({
          ...stats,
          open_safety_reports:
            status === 'resolved' || status === 'dismissed'
              ? Math.max(0, stats.open_safety_reports - 1)
              : stats.open_safety_reports,
          resolved_safety_reports:
            status === 'resolved'
              ? stats.resolved_safety_reports + 1
              : stats.resolved_safety_reports,
        });
      }
      toast.success(`Incident report #${reportId} status updated to ${status.replace('_', ' ')}.`);
    } catch {
      toast.error('Failed to update incident report status.');
    }
  };

  const handleVerifyMentor = async (mentorId: number) => {
    try {
      await mentorshipApi.verifyMentor(mentorId);
      setMentors((prev) =>
        prev.map((m) => (m.mentor_id === mentorId ? { ...m, is_verified: true } : m))
      );
      if (stats) {
        setStats({
          ...stats,
          verified_mentors: stats.verified_mentors + 1,
          pending_mentors: Math.max(0, stats.pending_mentors - 1),
        });
      }
      toast.success('Mentor credentials verified! Mentor is now active in the directory.');
    } catch {
      toast.error('Failed to verify mentor credentials.');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingVerificationMentors = mentors.filter((m) => !m.is_verified);
  const openReports = reports.filter((r) => r.status === 'submitted' || r.status === 'under_review');

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spinner size="lg" color="var(--color-primary-500)" />
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title="Administrative Governance & Platform Telemetry"
        description="Confidential incident monitoring, mentor verification queues, and system-wide KPI telemetry."
        action={
          <VoiceGuidanceButton
            textToRead="Administrative Governance and Ecosystem Telemetry. View platform metrics, mentor vetting queues, and confidential safety incident reports."
            label="Audio Summary"
          />
        }
      />

      {/* Platform Telemetry KPI Cards */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <BarChart3 size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
            Ecosystem Health & Operational Telemetry
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {/* Card 1: Community Membership */}
          <Card padding="md" variant="glass" hoverEffect>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Platform Users
              </span>
              <Users size={16} style={{ color: 'var(--color-primary-600)' }} />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1 }}>
                {stats?.total_users ?? 0}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                  {stats?.total_mentees ?? 0} Mentees
                </span>
                <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'var(--color-accent-50)', color: 'var(--color-accent-700)', fontWeight: 600 }}>
                  {stats?.total_mentors ?? 0} Mentors
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Readiness Telemetry */}
          <Card padding="md" variant="glass" hoverEffect>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Avg Readiness Score
              </span>
              <TrendingUp size={16} style={{ color: 'var(--color-success)' }} />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-success)', lineHeight: 1 }}>
                {stats?.avg_readiness_score ?? 0}%
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '8px' }}>
                Across {stats?.total_assessments ?? 0} completed gap evaluations
              </div>
            </div>
          </Card>

          {/* Card 3: Skills Logged */}
          <Card padding="md" variant="glass" hoverEffect>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Logged Skills
              </span>
              <Target size={16} style={{ color: 'var(--color-primary-600)' }} />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-gray-900)', lineHeight: 1 }}>
                {stats?.total_skills_logged ?? 0}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '8px' }}>
                Catalog size: {stats?.catalog_skills_count ?? 0} benchmark skills
              </div>
            </div>
          </Card>

          {/* Card 4: Mentorship Vetting */}
          <Card padding="md" variant="glass" hoverEffect>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Verified Mentors
              </span>
              <Award size={16} style={{ color: 'var(--color-primary-600)' }} />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary-600)', lineHeight: 1 }}>
                {stats?.verified_mentors ?? mentors.filter((m) => m.is_verified).length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-warning)', marginTop: '8px', fontWeight: 600 }}>
                {stats?.pending_mentors ?? pendingVerificationMentors.length} in vetting queue
              </div>
            </div>
          </Card>

          {/* Card 5: Safety Oversight */}
          <Card padding="md" variant="glass" hoverEffect>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
                Safety Incidents
              </span>
              <ShieldAlert size={16} style={{ color: 'var(--color-safety-600)' }} />
            </div>
            <div style={{ marginTop: 'var(--space-2)' }}>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-safety-600)', lineHeight: 1 }}>
                {openReports.length}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '8px' }}>
                {stats?.resolved_safety_reports ?? 0} of {stats?.total_safety_reports ?? reports.length} resolved
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 1: Mentor Vetting Queue */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <UserCheck size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
            Mentor Credential Verification Queue ({pendingVerificationMentors.length})
          </h2>
        </div>

        {pendingVerificationMentors.length === 0 ? (
          <Card padding="md" variant="subtle">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
              <CheckCircle2 size={18} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                All registered mentors are currently vetted and verified.
              </span>
            </div>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {pendingVerificationMentors.map((m) => (
              <Card key={m.mentor_id} padding="md" variant="glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                      {m.user?.full_name || 'Mentor Candidate'}
                    </h4>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-700)', fontWeight: 600 }}>
                      {m.expertise_area}
                    </span>
                  </div>
                  <Badge variant="warning" size="sm">
                    Pending
                  </Badge>
                </div>

                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
                  {m.bio || 'No biographical statement provided.'}
                </p>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleVerifyMentor(m.mentor_id)}
                    style={{ flex: 1 }}
                  >
                    <Check size={14} /> Verify & Approve
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Confidential Safety Incident Reports Queue */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} style={{ color: 'var(--color-safety-500)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
              Confidential Incident Reports Queue
            </h2>
          </div>

          {/* Status Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Filter size={14} style={{ color: 'var(--color-gray-400)' }} />
            {(['all', 'submitted', 'under_review', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: statusFilter === st ? 'var(--color-primary-500)' : 'var(--color-gray-200)',
                  backgroundColor: statusFilter === st ? 'var(--color-primary-50)' : 'var(--color-white)',
                  color: statusFilter === st ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filteredReports.map((r) => (
            <Card key={r.report_id} padding="md" variant="glass">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Badge variant="safety" size="sm">
                      Case #{r.report_id} • {r.incident_type?.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant={
                        r.status === 'resolved'
                          ? 'success'
                          : r.status === 'under_review'
                          ? 'warning'
                          : 'error'
                      }
                      size="sm"
                      hasDot
                    >
                      {r.status?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
                    Filed on {new Date(r.reported_at || '').toLocaleString()}
                  </div>
                </div>

                {/* Status action buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {r.status === 'submitted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateReportStatus(r.report_id, 'under_review')}
                    >
                      <Clock size={14} /> Mark Under Review
                    </Button>
                  )}
                  {r.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateReportStatus(r.report_id, 'resolved')}
                    >
                      <CheckCircle2 size={14} /> Resolve Incident
                    </Button>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-gray-50)',
                  border: '1px solid var(--color-gray-100)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-gray-800)',
                  lineHeight: 1.6,
                }}
              >
                {r.description}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
