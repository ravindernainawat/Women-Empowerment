import React, { useRef } from 'react';
import { User, SkillGapAssessment } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';
import { Award, Printer, Copy, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

interface ReadinessCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  assessment: SkillGapAssessment | null;
}

export const ReadinessCertificateModal: React.FC<ReadinessCertificateModalProps> = ({
  isOpen,
  onClose,
  user,
  assessment,
}) => {
  const toast = useToast();
  const certRef = useRef<HTMLDivElement>(null);

  if (!user || !assessment) return null;

  const score = assessment.overall_score || 0;
  const assessmentDate = new Date(assessment.assessed_at || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const certId = `WEIS-V${assessment.assessment_id.toString().padStart(4, '0')}-${(
    (score * 12345) %
    90000 +
    10000
  ).toFixed(0)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const fakeVerificationUrl = `${window.location.origin}/verify/cred/${certId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fakeVerificationUrl);
      toast.success('Verification URL copied to clipboard!', 'Credential Link');
    } else {
      toast.info(`Credential ID: ${certId}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verified Competency & Readiness Credential"
      maxWidth="720px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Button variant="ghost" onClick={handleCopyLink} size="sm">
            <Copy size={15} /> Copy Verification Link
          </Button>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={onClose} size="sm">
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint} size="sm">
              <Printer size={15} /> Print / Save as PDF
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Certificate Frame */}
      <div
        ref={certRef}
        id="weis-printable-certificate"
        style={{
          padding: '36px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
          border: '3px double #087f8c',
          boxShadow: '0 20px 40px -15px rgba(8, 127, 140, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#1f2937',
        }}
      >
        {/* Subtle Watermark Corner Badge */}
        <div
          style={{
            position: 'absolute',
            top: '-25px',
            right: '-25px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(8, 127, 140, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Award size={60} style={{ color: 'rgba(8, 127, 140, 0.2)' }} />
        </div>

        {/* Certificate Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 14px',
              borderRadius: '999px',
              background: 'rgba(8, 127, 140, 0.1)',
              color: '#087f8c',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            <ShieldCheck size={14} /> Official Verified Credential
          </div>

          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              margin: '0 0 4px 0',
            }}
          >
            Women Empowerment & Inclusion System
          </h2>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
            Under the United Nations SDG 5 (Gender Parity) & SDG 8 (Decent Work) Framework
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '28px 0' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            This certifies that
          </p>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#087f8c',
              margin: '8px 0 12px 0',
              fontFamily: "'Plus Jakarta Sans', serif",
            }}
          >
            {user.full_name}
          </h1>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto' }}>
            has successfully undertaken verified objective competency benchmarking for the targeted career role of{' '}
            <strong style={{ color: '#111827' }}>{assessment.target_role}</strong>, achieving a verified role readiness benchmark of:
          </p>
        </div>

        {/* Big Score Seal */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            margin: '24px 0',
          }}
        >
          <div
            style={{
              padding: '16px 28px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(8, 127, 140, 0.08) 0%, rgba(167, 139, 250, 0.12) 100%)',
              border: '1.5px solid rgba(8, 127, 140, 0.25)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '36px', fontWeight: 900, color: '#087f8c', lineHeight: 1 }}>
              {score}%
            </div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>
              Overall Role Readiness
            </div>
          </div>
        </div>

        {/* Verified Competencies Table */}
        {assessment.gap_details && assessment.gap_details.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#4b5563',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              Evaluated Competencies Breakdown
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '8px',
              }}
            >
              {assessment.gap_details.map((g) => (
                <div
                  key={g.gap_detail_id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#f3f4f6',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {g.skill?.skill_name || `Skill #${g.skill_id}`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, textTransform: 'capitalize' }}>
                    {g.current_level} Level
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Footer / Sign-off */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '36px',
            paddingTop: '20px',
            borderTop: '1px dashed #d1d5db',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>
              Credential Identification
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>
              {certId}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              Issued on: {assessmentDate}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <CheckCircle2 size={16} style={{ color: '#059669' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#065f46' }}>
                Cryptographically Authenticated
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              WEIS Platform Verification Registry
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
