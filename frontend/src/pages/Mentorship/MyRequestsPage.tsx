import React, { useState, useEffect } from 'react';
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

export const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (user.role === 'mentor') {
        const data = await mentorshipApi.getRequestsForMentor(user.user_id);
        setRequests(data);
      } else {
        const data = await mentorshipApi.getRequestsForMentee(user.user_id);
        setRequests(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [user]);

  const handleUpdateStatus = async (requestId: number, newStatus: MentorshipStatusEnum) => {
    try {
      const updated = await mentorshipApi.updateRequestStatus(requestId, newStatus);
      setRequests(requests.map((r) => (r.request_id === requestId ? updated : r)));
    } catch (err) {
      console.error(err);
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
        title={user.role === 'mentor' ? 'Incoming Mentorship Inquiries' : 'My Mentorship Requests'}
        description={
          user.role === 'mentor'
            ? 'Review and respond to connection requests from mentees seeking your guidance.'
            : 'Track the status of your mentorship requests and active connections.'
        }
        action={
          user.role === 'mentee' && (
            <Link to="/mentorship/directory">
              <Button variant="primary">+ Find New Mentor</Button>
            </Link>
          )
        }
      />

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No mentorship requests found"
          description={
            user.role === 'mentor'
              ? 'You do not have any pending inquiries at this moment.'
              : 'You have not submitted any mentorship inquiries yet. Browse our verified directory to connect.'
          }
          actionLabel={user.role === 'mentee' ? 'Browse Mentors' : undefined}
          onAction={user.role === 'mentee' ? () => window.location.assign('/mentorship/directory') : undefined}
          icon="🤝"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {requests.map((req) => (
            <Card key={req.request_id} padding="lg" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-900)' }}>
                    {user.role === 'mentor'
                      ? req.mentee?.full_name || 'Mentee Candidate'
                      : req.mentor?.user?.full_name || 'Verified Mentor'}
                  </h3>
                  <Badge variant={getStatusBadgeVariant(req.status)} size="sm">
                    {req.status}
                  </Badge>
                </div>

                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
                  {user.role === 'mentor' ? (
                    <div>
                      Mentee Email: <strong>{req.mentee?.email}</strong> • Location:{' '}
                      {req.mentee?.location || 'Remote'}
                    </div>
                  ) : (
                    <div>
                      Domain: <strong>{req.mentor?.expertise_area || 'Tech Guidance'}</strong>
                    </div>
                  )}
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)', marginTop: 'var(--space-1)' }}>
                    Requested on: {new Date(req.requested_at || '').toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Controls for Mentor */}
              {user.role === 'mentor' && req.status === 'pending' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleUpdateStatus(req.request_id, 'accepted')}
                  >
                    ✓ Accept Mentee
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(req.request_id, 'declined')}
                  >
                    Decline
                  </Button>
                </div>
              )}

              {/* Status information for Mentee */}
              {user.role === 'mentee' && req.status === 'accepted' && (
                <div style={{ textAlign: 'right' }}>
                  <Badge variant="success" size="sm">
                    Active Connection
                  </Badge>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginTop: '4px' }}>
                    Contact: {req.mentor?.user?.email}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
