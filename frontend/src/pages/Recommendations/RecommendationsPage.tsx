import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recommendationsApi } from '../../api/recommendations';
import { Recommendation, RecommendationStatusEnum } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  BookOpen,
  Clock,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Bookmark,
  Target,
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecs = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await recommendationsApi.getRecommendations(user.user_id);
      setRecommendations(data);
    } catch (err) {
      setRecommendations([]);
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load recommendations.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecs();
  }, [loadRecs]);

  const handleGenerate = async () => {
    if (!user) return;
    setIsGenerating(true);
    setErrorMessage(null);
    try {
      const result = await recommendationsApi.generateRecommendations();
      setRecommendations(result.recommendations.length ? result.recommendations : []);
      if (!result.recommendations.length) {
        setErrorMessage(result.message || 'No recommendations were generated.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not generate recommendations from the live backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (recId: number, newStatus: RecommendationStatusEnum) => {
    try {
      const updated = await recommendationsApi.updateStatus(recId, newStatus);
      setRecommendations((prev) =>
        prev.map((r) => (r.recommendation_id === recId ? { ...r, ...updated } : r))
      );
      setErrorMessage(null);
    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : 'This status update could not be confirmed by the backend.');
    }
  };

  const getMatchLabel = (score?: number | null) => {
    if (!score) return { text: 'Curated', variant: 'neutral' as const };
    if (score >= 90) return { text: `${score.toFixed(0)}% Strong Match`, variant: 'primary' as const };
    if (score >= 75) return { text: `${score.toFixed(0)}% Good Match`, variant: 'accent' as const };
    return { text: `${score.toFixed(0)}% Relevant`, variant: 'neutral' as const };
  };

  const filtered = recommendations.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div>
      <PageTitle
        title="Targeted Learning & Course Roadmaps"
        description="High-impact learning courses directly mapped to bridge your identified skill gaps and accelerate role readiness."
      />

      {errorMessage && (
        <div style={{ marginBottom: 'var(--space-6)', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-red-700)' }}>
          {errorMessage}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {(['all', 'pending', 'viewed', 'enrolled', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid',
                borderColor: filterStatus === st ? 'var(--color-primary-500)' : 'var(--color-gray-200)',
                backgroundColor: filterStatus === st ? 'var(--color-primary-50)' : 'var(--color-white)',
                color: filterStatus === st ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '13px',
                textTransform: 'capitalize',
                transition: 'all var(--transition-fast)',
                boxShadow: filterStatus === st ? 'var(--shadow-xs)' : 'none',
              }}
            >
              {st === 'all' ? 'All Roadmaps' : st}
            </button>
          ))}
        </div>

        <Button variant="primary" size="sm" onClick={handleGenerate} disabled={isGenerating || !user}>
          {isGenerating ? 'Generating...' : 'Generate from latest assessment'}
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" color="var(--color-primary-500)" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No recommendations yet"
          description="Complete a skill gap assessment to identify your competency deficits, then generate a personalized course roadmap."
          actionLabel="Take Skill Assessment"
          onAction={() => window.location.assign('/assessment')}
          icon={<BookOpen size={28} />}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {filtered.map((rec) => {
            const match = getMatchLabel(rec.match_score);
            const course = rec.course ?? {
              title: rec.course_title || 'Course recommendation',
              provider: rec.course_provider || 'WEIS Learning',
              url: rec.course_url || null,
              duration_hours: null as number | null,
              skill: rec.skill_name ? { skill_name: rec.skill_name } : undefined,
            };
            return (
              <Card key={rec.recommendation_id} padding="lg" variant="glass" hoverEffect style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <Badge variant={match.variant} size="sm" hasDot>
                      {match.text}
                    </Badge>
                    <span style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontWeight: 600 }}>
                      Skill gap: <strong style={{ color: 'var(--color-gray-800)' }}>{rec.skill_name || course.skill?.skill_name || 'Skill mapping unavailable'}</strong>
                    </span>
                  </div>

                  <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)', lineHeight: 1.4 }}>
                    {course.title}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-5)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BookOpen size={13} style={{ color: 'var(--color-primary-500)' }} />
                      <strong>{course.provider || 'WEIS Learning'}</strong>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} style={{ color: 'var(--color-accent-500)' }} />
                      <strong>{course.duration_hours || 12} hrs</strong>
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray-500)', textTransform: 'uppercase' }}>
                      Status:
                    </span>
                    <select
                      value={rec.status}
                      onChange={(e) => handleStatusChange(rec.recommendation_id, e.target.value as RecommendationStatusEnum)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-gray-300)',
                        backgroundColor: 'var(--color-gray-50)',
                        cursor: 'pointer',
                        color: 'var(--color-gray-800)',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="viewed">Viewed</option>
                      <option value="enrolled">Enrolled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {course.url && (
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant={rec.status === 'enrolled' ? 'primary' : 'outline'} size="sm" style={{ width: '100%' }}>
                        <span>Open Course Resource</span>
                        <ExternalLink size={14} />
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
