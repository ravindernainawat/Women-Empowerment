import React, { useState, useEffect, useCallback } from 'react';
import { safetyApi } from '../../api/safety';
import { mentorshipApi } from '../../api/mentorship';
import { SafetyReport, SafetyStatusEnum, Mentor } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  AlertCircle,
  Eye,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rList, mList] = await Promise.all([
        safetyApi.getAllReports(),
        mentorshipApi.getMentorsPending(),
      ]);      setReports(rList);
      setMentors(mList);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyMentor = async (mentorId: number) => {
    try {
      await mentorshipApi.verifyMentor(mentorId);
      // Update local state to reflect verification without full reload
      setMentors((prev) =>
        prev.map((m) => (m.mentor_id === mentorId ? { ...m, is_verified: true } : m))
      );
    } catch (err) {
      console.error('Failed to verify mentor:', err);
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
        title="Administrative Governance & Safety Oversight"
        description="Confidential incident monitoring, mentor verification queues, and platform integrity management."
      />

      {/* Governance Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-5)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <Card padding="md" variant="glass" hoverEffect>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
              Open Incident Reports
            </span>
            <Badge variant="safety" size="sm" hasDot>
              Confidential
            </Badge>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-safety-600)', lineHeight: 1 }}>
              {openReports.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '4px' }}>
              Require administrative intervention
            </div>
          </div>
        </Card>

        <Card padding="md" variant="glass" hoverEffect>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
              Pending Mentor Vetting
            </span>
            <Badge variant="warning" size="sm" hasDot>
              Vetting Queue
            </Badge>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-warning)', lineHeight: 1 }}>
              {pendingVerificationMentors.length}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '4px' }}>
              Awaiting background verification
            </div>
          </div>
        </Card>

        <Card padding="md" variant="glass" hoverEffect>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase' }}>
              Verified Mentors
            </span>
            <Badge variant="primary" size="sm" hasDot>
              Active
            </Badge>
          </div>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--color-primary-600)', lineHeight: 1 }}>
              {mentors.filter((m) => m.is_verified).length}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '4px' }}>
              Active in public mentorship directory
            </div>
          </div>
        </Card>
      </div>

      {/* Section 1: Mentor Vetting Queue */}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <UserCheck size={20} style={{ color: 'var(--color-primary-600)' }} />
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
            Mentor Credential Verification Queue
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
