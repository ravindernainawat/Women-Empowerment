import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recommendationsApi } from '../../api/recommendations';
import { Recommendation, RecommendationStatusEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadRecs = async () => {
      setIsLoading(true);
      try {
        const data = await recommendationsApi.getRecommendations(user.user_id);
        setRecommendations(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadRecs();
  }, [user]);

  const handleStatusChange = async (recId: number, newStatus: RecommendationStatusEnum) => {
    try {
      const updated = await recommendationsApi.updateStatus(recId, newStatus);
      setRecommendations(recommendations.map((r) => (r.recommendation_id === recId ? updated : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const getMatchLabel = (score?: number | null) => {
    if (!score) return { text: 'Curated', variant: 'neutral' as const };
    if (score >= 90) return { text: '⭐ Strong Match', variant: 'primary' as const };
    if (score >= 75) return { text: '✓ Good Match', variant: 'accent' as const };
    return { text: 'Relevant', variant: 'neutral' as const };
  };

  const filtered = recommendations.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div>
      <PageTitle
        title="Learning & Course Recommendations"
        description="Curated high-impact learning pathways specifically addressing your identified skill gaps."
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {['all', 'pending', 'viewed', 'enrolled', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${filterStatus === st ? 'var(--color-primary-500)' : 'var(--color-gray-300)'}`,
              backgroundColor: filterStatus === st ? 'var(--color-primary-50)' : 'var(--color-white)',
              color: filterStatus === st ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
              fontWeight: filterStatus === st ? '600' : 'normal',
              cursor: 'pointer',
              fontSize: 'var(--font-size-sm)',
              textTransform: 'capitalize',
            }}
          >
            {st === 'all' ? 'All Recommendations' : st}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No courses in this filter"
          description="Try switching your status filter or run a new assessment to refresh your recommendations."
          icon="🎓"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {filtered.map((rec) => {
            const match = getMatchLabel(rec.match_score);
            return (
              <Card key={rec.recommendation_id} padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <Badge variant={match.variant} size="sm">
                      {match.text}
                    </Badge>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                      Addresses: <strong>{rec.course?.skill?.skill_name}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)', lineHeight: 1.3 }}>
                    {rec.course?.title}
                  </h3>

                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', marginBottom: 'var(--space-4)' }}>
                    <div>Provider: <strong>{rec.course?.provider || 'Platform Partner'}</strong></div>
                    <div>Estimated Duration: <strong>{rec.course?.duration_hours || 15} hours</strong></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>Current Status:</span>
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(rec.recommendation_id, e.target.value as RecommendationStatusEnum)}
                      style={{
                        padding: '4px 8px',
                        fontSize: 'var(--font-size-xs)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-gray-300)',
                        backgroundColor: 'var(--color-gray-50)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="viewed">Viewed</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {rec.course?.url && (
                    <a
                      href={rec.course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="primary" size="sm" style={{ width: '100%' }}>
                        Open Course Content ↗
                      </Button>
                    </a>
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
