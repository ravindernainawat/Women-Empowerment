import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { mentorshipApi } from '../../api/mentorship';
import { Mentor } from '../../types';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';

export const MentorDirectoryPage: React.FC = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Request Mentorship Modal State
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadMentors = async () => {
      setIsLoading(true);
      try {
        const data = await mentorshipApi.getMentors();
        setMentors(data);
      } finally {
        setIsLoading(false);
      }
    };
    loadMentors();
  }, []);

  const handleSendRequest = async () => {
    if (!user || !selectedMentor) return;
    setIsSubmitting(true);
    try {
      await mentorshipApi.sendRequest(user.user_id, selectedMentor.mentor_id);
      setSuccessMessage(`Mentorship request successfully sent to ${selectedMentor.user?.full_name}. You can track status under "My Requests".`);
      setSelectedMentor(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageTitle
        title="Verified Mentor Directory"
        description="Connect 1-on-1 with vetted women leaders and experienced professionals across technology, leadership, and entrepreneurship."
      />

      {successMessage && (
        <div
          role="status"
          style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-success-light)',
            color: 'var(--color-success)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #bbf7d0',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {mentors
            .filter((m) => m.is_verified) // Only display verified mentors publicly (PRD requirement)
            .map((mentor) => (
              <Card key={mentor.mentor_id} padding="lg" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary-100)',
                          color: 'var(--color-primary-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: 'var(--font-size-lg)',
                        }}
                      >
                        {mentor.user?.full_name?.charAt(0) || 'M'}
                      </div>
                      <div>
                        <h3 style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-gray-900)' }}>
                          {mentor.user?.full_name}
                        </h3>
                        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
                          {mentor.user?.location || 'India'}
                        </span>
                      </div>
                    </div>

                    <Badge variant="success" size="sm">
                      ✓ Verified
                    </Badge>
                  </div>

                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'bold', color: 'var(--color-primary-700)', textTransform: 'uppercase' }}>
                      Expertise Area
                    </span>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-800)', fontWeight: '500' }}>
                      {mentor.expertise_area || 'General Career Guidance'}
                    </p>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-600)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                    {mentor.bio}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-gray-100)', paddingTop: 'var(--space-4)' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    style={{ width: '100%' }}
                    onClick={() => setSelectedMentor(mentor)}
                  >
                    Request Mentorship Connection
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        title="Confirm Mentorship Request"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelectedMentor(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendRequest} isLoading={isSubmitting}>
              Confirm & Send Request
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-gray-700)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>
          You are requesting 1-on-1 mentorship with <strong>{selectedMentor?.user?.full_name}</strong> in the
          domain of <em>{selectedMentor?.expertise_area}</em>.
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
          Once submitted, your profile will be shared with the mentor. The request enters "Pending" status and you will be notified upon confirmation.
        </p>
      </Modal>
    </div>
  );
};
