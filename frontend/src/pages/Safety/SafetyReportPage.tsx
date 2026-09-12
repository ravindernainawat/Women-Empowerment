import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { safetyApi } from '../../api/safety';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';

const INCIDENT_TYPES = [
  'Workplace Discrimination / Exclusion',
  'Harassment / Inappropriate Communication',
  'Platform Safety / Privacy Concern',
  'Unfair Mentorship Experience',
  'Other Inclusion or Wellbeing Concern',
];

export const SafetyReportPage: React.FC = () => {
  const { user } = useAuth();
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !description.trim()) {
      setError('Please provide a brief description of your concern.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await safetyApi.submitReport(user.user_id, {
        incident_type: incidentType,
        description,
      });
      setIsSubmitted(true);
    } catch {
      setError('Unable to submit your concern. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <PageTitle
        title="Safety & Inclusion Concern Form"
        description="A confidential, respectful space to share any incident or challenge. All reports are handled with high privacy by platform administrators."
      />

      {isSubmitted ? (
        <Card padding="lg" style={{ textAlign: 'center', backgroundColor: 'var(--color-safety-100)', border: '1px solid #bfd5ea' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🛡️</div>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-safety-600)', marginBottom: 'var(--space-2)' }}>
            Thank You. Your Report Has Been Safely Received.
          </h2>
          <p style={{ color: 'var(--color-gray-700)', fontSize: 'var(--font-size-base)', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto var(--space-6)' }}>
            Your concern has entered our administrative queue with the status <strong>"Submitted"</strong> and will move to
            <strong> "Under Review"</strong> shortly. You can track updates under your private report history.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
            <Link to="/safety/my-reports">
              <Button variant="safety">View My Reports History</Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setIsSubmitted(false);
                setDescription('');
              }}
            >
              Submit Another Concern
            </Button>
          </div>
        </Card>
      ) : (
        <Card padding="lg">
          {/* Calm reassuring note */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'var(--color-safety-100)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #bfd5ea',
              marginBottom: 'var(--space-6)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-gray-700)',
              lineHeight: 1.5,
            }}
          >
            🔒 <strong>Strict Privacy Notice:</strong> Per system design (TRD Section 7), safety reports are strictly restricted to you and platform administrators. Mentors or other platform participants cannot access your reports.
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--color-error-light)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Select
              label="Nature of Incident or Concern *"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              options={INCIDENT_TYPES.map((t) => ({ value: t, label: t }))}
            />

            <Textarea
              label="Description of Concern *"
              placeholder="Please describe what occurred in your own words. Include relevant context or dates if helpful..."
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <Link to="/safety/my-reports" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                ← View Past Filed Reports
              </Link>
              <Button type="submit" variant="safety" isLoading={isSubmitting}>
                Submit Confidential Concern
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
