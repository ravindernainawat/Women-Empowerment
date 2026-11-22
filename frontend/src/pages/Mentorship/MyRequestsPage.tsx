import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mentorshipApi } from '../../api/mentorship';
import { MentorshipRequest, MentorshipStatusEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
} from 'lucide-react';

export const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      if (user.role === 'mentor') {
        const data = await mentorshipApi.getRequestsForMentor();
        setRequests(data);
      } else {
        const data = await mentorshipApi.getRequestsForMentee();
        setRequests(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load requests.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleUpdateStatus = async (requestId: number, newStatus: MentorshipStatusEnum) => {
    try {
      const updated = await mentorshipApi.updateRequestStatus(requestId, newStatus);
      setRequests((prev) =>
        prev.map((r) => (r.request_id === requestId ? updated : r))
      );
    } catch (err) {
      console.error('Failed to update request status:', err);
    }
  };

  const getStatusBadgeVariant = (st: MentorshipStatusEnum) => {
    switch (st) {
      case 'accepted':
        return 'success';
      case 'pending':
        return 'warning';
      case 'declined':
        return 'error';
      case 'completed':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title={user.role === 'mentor' ? 'Incoming Mentorship Inquiries' : 'My Mentorship Connections'}
        description={
          user.role === 'mentor'
            ? 'Review and manage partnership requests from mentees seeking your guidance and industry perspective.'
            : 'Track the status of your connection requests and collaborate with active mentors.'
        }
        action={
          user.role === 'mentee' && (
            <Link to="/mentorship/directory">
              <Button variant="primary">
                + Browse Mentors
              </Button>
            </Link>
          )
        }
      />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" color="var(--color-primary-500)" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load requests"
          message={error}
          onRetry={loadRequests}
        />
      ) : requests.length === 0 ? (
        <EmptyState
          title="No mentorship connections found"
          description={
            user.role === 'mentor'
              ? 'You do not have any pending inquiries from mentees at this moment.'
              : 'You have not submitted any mentorship inquiries yet. Browse our verified directory to connect.'
          }
          actionLabel={user.role === 'mentee' ? 'Explore Mentors Directory' : undefined}
          onAction={user.role === 'mentee' ? () => window.location.assign('/mentorship/directory') : undefined}
          icon={<Inbox size={28} />}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {requests.map((req) => {
            // Backend returns flat mentee_name / mentor_name strings.
            // Fall back to nested objects only when mock data is used.
            const displayName =
              user.role === 'mentor'
                ? req.mentee_name ?? req.mentee?.full_name ?? 'Mentee Candidate'
                : req.mentor_name ?? req.mentor?.user?.full_name ?? 'Verified Mentor';

            const initial = displayName[0]?.toUpperCase() ?? 'M';

            const locationText =
              user.role === 'mentor'
                ? req.mentee?.location ?? 'Remote'
                : req.mentor?.user?.location ?? 'Remote';

            return (
              <Card key={req.request_id} padding="lg" variant="glass" hoverEffect>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    {/* Initial Avatar Circle */}
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px',
                      }}
                    >
                      {initial}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                          {displayName}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(req.status)} size="sm" hasDot>
                          {req.status}
                        </Badge>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={12} />
                          {locationText}
                        </span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} />
                          Requested on {new Date(req.requested_at || '').toLocaleDateString()}
                        </span>
                        {req.mentor?.expertise_area && user.role === 'mentee' && (
                          <>
                            <span>•</span>
                            <span style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>
                              {req.mentor.expertise_area}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mentor Action Controls */}
                  {user.role === 'mentor' && req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleUpdateStatus(req.request_id, 'accepted')}
                      >
                        <CheckCircle2 size={14} /> Accept Inquiry
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(req.request_id, 'declined')}
                        style={{ color: 'var(--color-error)' }}
                      >
                        <XCircle size={14} /> Decline
                      </Button>
                    </div>
                  )}

                  {user.role === 'mentor' && req.status === 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(req.request_id, 'completed')}
                    >
                      Mark Cycle Completed
                    </Button>
                  )}

                  {user.role === 'mentee' && req.status === 'accepted' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      <span>Active Partnership</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
