import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Sparkles, ArrowRight, RefreshCw, CheckCircle2, Award, Compass } from 'lucide-react';

interface TransferableMapping {
  background: string;
  mappedSkills: {
    corporateSkill: string;
    category: string;
    transferRating: number;
    description: string;
  }[];
  runwayRecommendation: string;
}

const RETURNEE_PROFILES: Record<string, TransferableMapping> = {
  'Education & Tutoring': {
    background: 'Teaching, Academic Tutoring, or Curriculum Delivery',
    mappedSkills: [
      {
        corporateSkill: 'Technical Documentation & Knowledge Transfer',
        category: 'Communication',
        transferRating: 92,
        description: 'Translating complex subject matter into structured, easily digestible training modules.',
      },
      {
        corporateSkill: 'Agile Mentorship & Team Guidance',
        category: 'Leadership',
        transferRating: 88,
        description: 'Guiding learners through feedback loops, sprint milestones, and progress evaluations.',
      },
      {
        corporateSkill: 'Data Organization & Curriculum Structuring',
        category: 'Data & Planning',
        transferRating: 80,
        description: 'Managing class performance metrics and systematic record keeping.',
      },
    ],
    runwayRecommendation: 'High alignment with Scrum Master, Technical Writer, or Junior Product Specialist roles.',
  },
  'Family Caretaking & Household Management': {
    background: 'Full-time Caregiving, Family Health Logistics, or Household Operations',
    mappedSkills: [
      {
        corporateSkill: 'Cross-functional Project Scheduling',
        category: 'Project Management',
        transferRating: 95,
        description: 'Managing multi-stakeholder timetables, emergency contingencies, and critical deadlines.',
      },
      {
        corporateSkill: 'Operational Crisis Resolution & Empathy',
        category: 'Problem Solving',
        transferRating: 90,
        description: 'High-stress conflict de-escalation, patient prioritization, and resource allocation.',
      },
      {
        corporateSkill: 'Budget Optimization & Financial Auditing',
        category: 'Operations',
        transferRating: 84,
        description: 'Managing strict monthly cash flows, supplier expenses, and healthcare budgeting.',
      },
    ],
    runwayRecommendation: 'Exceptional foundation for Operations Coordinator, Agile Scrum Master, or Customer Success Lead.',
  },
  'Micro-Enterprise & Local Commerce': {
    background: 'Boutique Business, Artisan Crafts, or Local Retail & Services',
    mappedSkills: [
      {
        corporateSkill: 'Customer Journey & Client Relationship Management',
        category: 'Marketing & Sales',
        transferRating: 94,
        description: 'Direct customer retention, repeat inquiries, and grievance resolution.',
      },
      {
        corporateSkill: 'Inventory & Supply Chain Optimization',
        category: 'Operations',
        transferRating: 86,
        description: 'Balancing stock lead times, vendor pricing negotiation, and delivery schedules.',
      },
      {
        corporateSkill: 'Digital Social Commerce & Outreach',
        category: 'Digital Strategy',
        transferRating: 82,
        description: 'Organic promotion, visual brand storytelling, and WhatsApp/Instagram client management.',
      },
    ],
    runwayRecommendation: 'Strong alignment with Product Marketing Associate, Business Analyst, or E-Commerce Specialist.',
  },
  'Community Advocacy & NGO Coordination': {
    background: 'Volunteer Organizing, Civic Outreach, or NGO Programs',
    mappedSkills: [
      {
        corporateSkill: 'Stakeholder Alignment & Public Communication',
        category: 'Leadership',
        transferRating: 96,
        description: 'Uniting diverse groups behind shared objectives and institutional guidelines.',
      },
      {
        corporateSkill: 'Event Operations & Logistics Coordination',
        category: 'Operations',
        transferRating: 88,
        description: 'Resource deployment, venue logistics, and volunteer workflow supervision.',
      },
      {
        corporateSkill: 'Impact Reporting & Metric Tracking',
        category: 'Analytics',
        transferRating: 85,
        description: 'Measuring beneficiary progress and assembling donor update dossiers.',
      },
    ],
    runwayRecommendation: 'Direct transition pathway into ESG Compliance, Program Management, or People Operations.',
  },
};

export const CareerReturneeAnalyzer: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState<string>('Education & Tutoring');
  const activeProfile = RETURNEE_PROFILES[selectedKey];

  return (
    <Card padding="lg" variant="glass" style={{ border: '1px solid rgba(8, 127, 140, 0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--color-primary-600)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
              Break-to-Career Transferable Skills Transformer
            </h2>
            <Badge variant="primary" size="sm">Returnee Runway</Badge>
          </div>
          <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            Validate your career pause. Select your non-traditional experience to discover how non-linear work directly converts into high-demand tech and corporate competencies.
          </p>
        </div>
      </div>

      {/* Experience Selection Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        {Object.keys(RETURNEE_PROFILES).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelectedKey(key)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              border: `1.5px solid ${selectedKey === key ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
              backgroundColor: selectedKey === key ? 'var(--color-primary-50)' : 'var(--color-white)',
              color: selectedKey === key ? 'var(--color-primary-700)' : 'var(--color-gray-700)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: selectedKey === key ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* Mapped Transferable Competencies */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        {activeProfile.mappedSkills.map((ms, idx) => (
          <div
            key={idx}
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-gray-200)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-gray-400)', fontWeight: 700 }}>
                  {ms.category}
                </span>
                <Badge variant="accent" size="sm">
                  {ms.transferRating}% Match
                </Badge>
              </div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '6px' }}>
                {ms.corporateSkill}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
                {ms.description}
              </p>
            </div>

            <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-gray-100)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--color-primary-700)', fontWeight: 600 }}>
              <CheckCircle2 size={13} />
              <span>Directly verifiable in portfolio interview</span>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic 30-Day Runway Recommendation Box */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'rgba(8, 127, 140, 0.05)',
          border: '1px solid rgba(8, 127, 140, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={22} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-800)', textTransform: 'uppercase' }}>
              Strategic Career Runway:
            </span>
            <div style={{ fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: 600, marginTop: '2px' }}>
              {activeProfile.runwayRecommendation}
            </div>
          </div>
        </div>

        <a href="/recommendations" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="sm">
            <span>Explore Bridging Courses</span>
            <ArrowRight size={14} />
          </Button>
        </a>
      </div>
    </Card>
  );
};
