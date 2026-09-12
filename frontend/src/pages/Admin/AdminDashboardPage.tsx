import React, { useState, useEffect } from 'react';
import { safetyApi } from '../../api/safety';
import { mentorshipApi } from '../../api/mentorship';
import { SafetyReport, SafetyStatusEnum, Mentor } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

export const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rList, mList] = await Promise.all([
        safetyApi.getAllReports(),
        mentorshipApi.getMentors(),
      ]);
      setReports(rList);
      setMentors(mList);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateReportStatus = async (reportId: number, status: SafetyStatusEnum) => {
    try {
      const updated = await safetyApi.updateReportStatus(reportId, status);
      setReports(reports.map((r) => (r.report_id === reportId ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyMentor = (mentorId: number) => {
    setMentors(
      mentors.map((m) => (m.mentor_id === mentorId ? { ...m, is_verified: true } : m))
    );
  };

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingVerificationMentors = mentors.filter((m) => !m.is_verified);
  const openReports = reports.filter((r) => r.status === 'submitted' || r.status === 'under_review');

  return (
    <div>
      <PageTitle
        title="Administrative Governance Portal"
        description="Platform moderation, verified mentor vetting, and oversight of sensitive safety incident filings."
      />

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <Card padding="md">
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
            Open Safety Reports
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-safety-600)', marginTop: 'var(--space-1)' }}>
            {openReports.length}
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
            Require administrative review
          </p>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
            Pending Mentor Vetting
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-warning)', marginTop: 'var(--space-1)' }}>
            {pendingVerificationMentors.length}
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
            Awaiting background verification
          </p>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
            Total Verified Mentors
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-primary-600)', marginTop: 'var(--space-1)' }}>
            {mentors.filter((m) => m.is_verified).length}
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
            Active in public directory
          </p>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
            Platform Health
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: 'var(--color-success)', marginTop: 'var(--space-1)' }}>
            Normal
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
            API & Database operational
          </p>
        </Card>
      </div>

      {/* Section 1: Pending Mentor Verification */}
      {pendingVerificationMentors.length > 0 && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-4)' }}>
            Pending Mentor Applications
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {pendingVerificationMentors.map((m) => (
              <Card key={m.mentor_id} padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>
                    {m.user?.full_name}
                  </h3>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                    {m.user?.email} • Domain: {m.expertise_area}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', marginTop: 'var(--space-1)' }}>
                    {m.bio}
                  </p>
                </div>
                <Button size="sm" variant="primary" onClick={() => handleVerifyMentor(m.mentor_id)}>
                  ✓ Approve & Verify Mentor
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Safety Incident Oversight Queue */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)' }}>
            Confidential Safety Reports Queue
          </h2>

          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['all', 'submitted', 'under_review', 'resolved', 'dismissed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: `1px solid ${statusFilter === st ? 'var(--color-safety-500)' : 'var(--color-gray-300)'}`,
                  backgroundColor: statusFilter === st ? 'var(--color-safety-100)' : 'var(--color-white)',
                  color: statusFilter === st ? 'var(--color-safety-600)' : 'var(--color-gray-600)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: statusFilter === st ? 'bold' : 'normal',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
            <Spinner size="lg" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredReports.map((r) => (
              <Card key={r.report_id} padding="lg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>
                      {r.incident_type}
                    </h3>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
                      Incident #{r.report_id} • Filed by User #{r.user_id} on {new Date(r.reported_at || '').toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>Update Status:</span>
                    <select
                      value={r.status}
                      onChange={(e) => handleUpdateReportStatus(r.report_id, e.target.value as SafetyStatusEnum)}
                      style={{
                        padding: '4px 8px',
                        fontSize: 'var(--font-size-xs)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-gray-300)',
                        backgroundColor: 'var(--color-gray-50)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-800)', lineHeight: 1.5 }}>
                  {r.description}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
