import React, { useState, useEffect } from 'react';
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

export const MyReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const data = await safetyApi.getMyReports(user.user_id);
        setReports(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadReports();
  }, [user]);

  const getStatusBadge = (status: SafetyStatusEnum) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="neutral">Submitted</Badge>;
      case 'under_review':
        return <Badge variant="safety">Under Review</Badge>;
      case 'resolved':
        return <Badge variant="success">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline">Dismissed</Badge>;
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <PageTitle
        title="My Safety & Concern Reports"
        description="Private tracking of your submitted incidents. Only you and platform administrators can view this history."
        action={
          <Link to="/safety/report">
            <Button variant="safety">+ File a Concern</Button>
          </Link>
        }
      />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No reports filed"
          description="You have not submitted any inclusion or safety concerns. Our platform is dedicated to maintaining a supportive, respectful environment."
          icon="🛡️"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {reports.map((report) => (
            <Card key={report.report_id} padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'bold', color: 'var(--color-gray-900)' }}>
                    {report.incident_type}
                  </h3>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
                    Report #{report.report_id} • Filed on {new Date(report.reported_at || '').toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(report.status)}
              </div>

              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-700)', lineHeight: 1.6, backgroundColor: 'var(--color-gray-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
                {report.description}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
