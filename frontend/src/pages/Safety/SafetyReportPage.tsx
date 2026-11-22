import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { safetyApi } from '../../api/safety';
import { PageTitle } from '../../components/common/PageTitle';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { VoiceGuidanceButton } from '../../components/common/VoiceGuidanceButton';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  Heart,
  Send,
  ArrowRight,
} from 'lucide-react';

const INCIDENT_TYPES = [
  'Workplace Discrimination / Exclusion',
  'Harassment / Inappropriate Communication',
  'Platform Safety / Privacy Concern',
  'Unfair Mentorship Experience',
  'Other Inclusion or Wellbeing Concern',
];

export const SafetyReportPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
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
      await safetyApi.submitReport({
        incident_type: incidentType,
        description,
      });
      setIsSubmitted(true);
      toast.success('Report filed securely. An administrator will review it promptly.');
    } catch {
      setError('Unable to submit your concern. Please try again or check your connectivity.');
      toast.error('Unable to submit your concern. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <PageTitle
        title="Confidential Safety & Inclusion Reporting Sanctuary"
        description="A trauma-informed, secure space to document workplace or platform concerns. Reports are strictly isolated to platform administrators."
        action={
          <VoiceGuidanceButton
            textToRead="Confidential Safety and Inclusion Reporting Sanctuary. This is a trauma-informed, secure space to document workplace or platform concerns. Your report is strictly private and visible only to verified platform administrators. No mentor, colleague, or other platform participant can access your safety reports."
            label="Listen to Safety Guide"
          />
        }
      />

      {isSubmitted ? (
        <Card padding="lg" variant="glass" style={{ textAlign: 'center', border: '1px solid var(--color-safety-100)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-safety-50)',
              color: 'var(--color-safety-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Shield size={32} />
          </div>

          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 800,
              color: 'var(--color-gray-900)',
              marginBottom: 'var(--space-2)',
              fontFamily: "'Plus Jakarta Sans', var(--font-family)",
              letterSpacing: '-0.02em',
            }}
          >
            Your Confidential Report Has Been Safely Received
          </h2>

          <p
            style={{
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.6,
              maxWidth: '560px',
              margin: '0 auto var(--space-8)',
            }}
          >
            Your report is recorded in the administrative queue with status <strong>&ldquo;Submitted&rdquo;</strong>. It will move to <strong>&ldquo;Under Review&rdquo;</strong> by verified moderators. You can track progress in complete privacy.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/safety/my-reports">
              <Button variant="safety" size="md">
                View My Confidential Reports <ArrowRight size={14} />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="md"
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
        <Card padding="lg" variant="glass">
          {/* Strict Privacy Notice */}
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-safety-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-safety-100)',
              marginBottom: 'var(--space-6)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
            }}
          >
            <Lock size={18} style={{ color: 'var(--color-safety-500)', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ fontSize: '13px', color: 'var(--color-gray-700)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-safety-700)' }}>Strict Privacy Guarantee:</strong> Per system design (TRD Section 7), safety reports are strictly restricted to you and platform administrators. Mentors, colleagues, or other platform participants cannot access your reports.
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                backgroundColor: 'var(--color-error-light)',
                color: 'var(--color-error)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid #fecaca',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Select
              label="Incident Category *"
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              options={INCIDENT_TYPES.map((t) => ({ value: t, label: t }))}
              helperText="Choose the category that best reflects the challenge or situation encountered."
            />

            <Textarea
              label="Detailed Incident Description *"
              placeholder="Describe what occurred, any individuals or platforms involved, dates/times, and any steps you've already taken..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              characterCount={{ current: description.length, max: 2000 }}
              required
            />

            <div
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-gray-50)',
                border: '1px solid var(--color-gray-200)',
                fontSize: '12px',
                color: 'var(--color-gray-600)',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                Important Safety & Legal Notice:
              </div>
              <div>
                This portal handles platform inclusion mediation, mentorship disputes, and administrative incident reviews. <strong>WEIS is not an emergency response or dispatch service.</strong>
              </div>
              <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--color-gray-500)' }}>
                If you are facing immediate physical harm, domestic violence, or urgent threat, please contact national emergency services immediately:
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li>National Emergency All-in-One: <strong>112</strong></li>
                  <li>Women Helpline / Domestic Distress: <strong>181</strong> or <strong>1091</strong></li>
                  <li>National Cyber Crime Reporting Helpline: <strong>1930</strong></li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
              <Button type="submit" variant="safety" size="lg" isLoading={isSubmitting}>
                <Send size={16} /> Submit Confidential Report
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
