import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorshipApi } from '../../api/mentorship';
import { Mentor } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/Input';
import {
  Users,
  CheckCircle2,
  MapPin,
  Briefcase,
  Search,
  Send,
  X,
  HeartHandshake,
} from 'lucide-react';

export const MentorDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Request Mentorship Modal State
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const loadMentors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await mentorshipApi.getMentors();
      setMentors(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load mentors.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  const handleSendRequest = async () => {
    if (!user || !selectedMentor) return;
    setIsSubmitting(true);
    setRequestError(null);
    try {
      await mentorshipApi.sendRequest(selectedMentor.mentor_id);
      // Backend returns flat full_name; fall back to nested user for mock data.
      const mentorName =
        selectedMentor.full_name ?? selectedMentor.user?.full_name ?? 'this mentor';
      setSuccessMessage(
        `Mentorship inquiry successfully sent to ${mentorName}. You can track the response under "My Requests".`
      );
      setSelectedMentor(null);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? (err instanceof Error ? err.message : 'Failed to send request. Please try again.');
      setRequestError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Backend already filters is_verified=True; client-side filter is for search only.
  const filteredMentors = mentors.filter((m) => {
    // Mentor name may come from flat full_name (API) or nested user (mock).
    const name = (m.full_name ?? m.user?.full_name ?? '').toLowerCase();
    const exp = (m.expertise_area || '').toLowerCase();
    const loc = (m.user?.location ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || exp.includes(q) || loc.includes(q);
  });

  return (
    <div>
      <PageTitle
        title="Verified Mentorship Network"
        description="Connect 1-on-1 with vetted industry leaders, senior engineers, and executives dedicated to supporting women across tech."
      />

      {successMessage && (
        <div
          role="status"
          style={{
            padding: '14px 18px',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid #bbf7d0',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={18} />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: '4px' }}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Search Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <Input
            placeholder="Search by name, expertise, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        <Badge variant="verified" size="sm" hasDot>
          {filteredMentors.length} Verified Mentors Available
        </Badge>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-16)' }}>
          <Spinner size="lg" color="var(--color-primary-500)" />
        </div>
      ) : error ? (
        <ErrorState
          title="Could not load mentors"
          message={error}
          onRetry={loadMentors}
        />
      ) : filteredMentors.length === 0 ? (
        <EmptyState
          title="No verified mentors match your search"
          description="Try broadening your search query or check back soon as new mentors are vetted weekly."
          icon={<Users size={28} />}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {filteredMentors.map((mentor) => {
            // Backend returns flat full_name; fall back to nested user for mock data.
            const displayName = mentor.full_name ?? mentor.user?.full_name ?? 'Mentor';
            const initials = displayName
              .split(' ')
              .map((n: string) => n[0])
              .slice(0, 2)
              .join('');

            return (
              <Card key={mentor.mentor_id} padding="lg" variant="glass" hoverEffect style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {/* Mentor Avatar */}
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--gradient-accent)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '16px',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        {initials || 'M'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)' }}>
                          {displayName}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-gray-500)' }}>
                          <MapPin size={12} /> {mentor.user?.location || 'Remote / Hybrid'}
                        </div>
                      </div>
                    </div>

                    <Badge variant="verified" size="sm" hasDot>
                      Verified
                    </Badge>
                  </div>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)', fontSize: '12px', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                    <Briefcase size={12} />
                    <span>{mentor.expertise_area}</span>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
                    {mentor.bio || 'Experienced technologist committed to empowering the next generation of women developers.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
                  {user?.role === 'mentee' ? (
                    <Button
                      variant="gradient"
                      size="sm"
                      style={{ width: '100%' }}
                      onClick={() => setSelectedMentor(mentor)}
                    >
                      <HeartHandshake size={14} /> Request Mentorship Connection
                    </Button>
                  ) : (
                    <Badge variant="neutral" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
                      Mentor Profile Active
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Request Mentorship Modal */}
      <Modal
        isOpen={!!selectedMentor}
        onClose={() => { setSelectedMentor(null); setRequestError(null); }}
        title={`Request Mentorship with ${selectedMentor?.full_name ?? selectedMentor?.user?.full_name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => { setSelectedMentor(null); setRequestError(null); }}>
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleSendRequest} isLoading={isSubmitting}>
              <Send size={14} /> Confirm & Send Inquiry
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
            You are requesting a 1-on-1 mentorship partnership with{' '}
            <strong style={{ color: 'var(--color-gray-900)' }}>
              {selectedMentor?.full_name ?? selectedMentor?.user?.full_name}
            </strong>{' '}
            ({selectedMentor?.expertise_area}).
          </p>

          {requestError && (
            <div
              role="alert"
              style={{
                padding: '10px 14px',
                backgroundColor: 'var(--color-error-light, #fee2e2)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid #fca5a5',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {requestError}
            </div>
          )}

          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-warm-bg)',
              border: '1px solid var(--color-gray-200)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-gray-700)',
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px', color: 'var(--color-primary-700)' }}>
              🤝 Sisterhood Mentorship Charter:
            </div>
            • Mentors provide free, dedicated guidance aligned with UN SDG 5.<br />
            • Inquiries are reviewed within 48-72 hours.<br />
            • All communication follows platform professional conduct standards.
          </div>
        </div>
      </Modal>
    </div>
  );
};
