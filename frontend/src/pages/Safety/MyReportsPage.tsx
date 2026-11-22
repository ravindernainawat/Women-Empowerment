import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { safetyApi } from '../../api/safety';
import { SafetyReport, SafetyStatusEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ShieldAlert,
  Shield,
  Clock,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await safetyApi.getMyReports();
      setReports(data);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const getStatusBadge = (status: SafetyStatusEnum) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="neutral" hasDot>Submitted</Badge>;
      case 'under_review':
        return <Badge variant="safety" hasDot>Under Review</Badge>;
      case 'resolved':
        return <Badge variant="success" hasDot>Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <PageTitle
        title="My Confidential Incident Reports"
        description="Private tracking of your submitted concerns. Only you and verified platform administrators can view this history."
        action={
          <Link to="/safety/report">
            <Button variant="safety">
              <Plus size={16} /> File New Concern
            </Button>
          </Link>
        }
      />

      {/* Privacy Banner */}
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: 'var(--color-safety-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-safety-100)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: 'var(--space-6)',
          fontSize: '12px',
          color: 'var(--color-safety-700)',
        }}
      >
        <Lock size={16} style={{ flexShrink: 0 }} />
        <span>
          End-to-end confidential: No peers, mentors, or external organizations have visibility into your filed reports.
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" color="var(--color-safety-500)" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No incident reports filed"
          description="You have not submitted any inclusion or safety concerns. Our platform is dedicated to maintaining a supportive, respectful sanctuary."
          actionLabel="File a Concern"
          onAction={() => window.location.assign('/safety/report')}
          icon={<Shield size={28} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reports.map((report) => (
            <Card key={report.report_id} padding="lg" variant="glass" hoverEffect>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                    {report.incident_type}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
                    Case #{report.report_id} • Filed on {new Date(report.reported_at || '').toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(report.status)}
              </div>

              <p
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-gray-700)',
                  lineHeight: 1.6,
                  backgroundColor: 'var(--color-gray-50)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-gray-100)',
                }}
              >
                {report.description}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
