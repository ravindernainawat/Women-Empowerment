import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Briefcase, Building, CheckCircle2, ShieldCheck, ExternalLink, TrendingUp, Sparkles } from 'lucide-react';

interface JobOpportunity {
  roleTitle: string;
  company: string;
  location: string;
  readinessThreshold: number;
  salaryRange: string;
  inclusionBadges: string[];
  keyMatchingSkills: string[];
}

const OPPORTUNITIES: JobOpportunity[] = [
  {
    roleTitle: 'Junior Data Analyst Associate',
    company: 'TechInclusion Global',
    location: 'Remote / Bengaluru',
    readinessThreshold: 65,
    salaryRange: '₹4.8L – ₹7.2L / yr',
    inclusionBadges: ['Equal Pay Certified', 'Maternity Care', 'Flexible Hours'],
    keyMatchingSkills: ['Python Programming', 'Data Analysis (Pandas/SQL)', 'Communication'],
  },
  {
    roleTitle: 'Frontend Web Developer (Associate)',
    company: 'FinSisterhood Labs',
    location: 'Hyderabad / Hybrid',
    readinessThreshold: 70,
    salaryRange: '₹5.5L – ₹8.5L / yr',
    inclusionBadges: ['Women Leadership >40%', 'Childcare Stipend', 'Remote-First'],
    keyMatchingSkills: ['Web Development (HTML/CSS/JS)', 'UI/UX Design Thinking'],
  },
  {
    roleTitle: 'Associate Project Coordinator (Agile)',
    company: 'NexWave Solutions',
    location: 'Pune / Remote',
    readinessThreshold: 60,
    salaryRange: '₹4.2L – ₹6.5L / yr',
    inclusionBadges: ['Career Returnee Friendly', 'Mental Health Days'],
    keyMatchingSkills: ['Project Management (Agile)', 'Communication & Presentation'],
  },
  {
    roleTitle: 'Junior AI/ML Operations Specialist',
    company: 'Vanguard Cognitive Systems',
    location: 'Gurugram / Hybrid',
    readinessThreshold: 80,
    salaryRange: '₹7.0L – ₹11.0L / yr',
    inclusionBadges: ['Equal Pay Certified', 'Continuous Upskilling Budget'],
    keyMatchingSkills: ['Machine Learning Basics', 'Python Programming', 'Cloud Computing'],
  },
];

interface OpportunityRadarProps {
  currentScore?: number;
}

export const OpportunityRadar: React.FC<OpportunityRadarProps> = ({ currentScore = 68 }) => {
  return (
    <Card padding="lg" variant="glass" style={{ border: '1px solid rgba(167, 139, 250, 0.25)', marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: 'var(--space-6)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: 'var(--color-accent-600)' }} />
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-gray-900)' }}>
              Live Opportunity Radar & Inclusive Hiring Matches
            </h2>
            <Badge variant="accent" size="sm">Real-Time Radar</Badge>
          </div>
          <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
            See exactly how bridging your competency gaps directly unlocks vetted employment opportunities with equal-pay and returnee-friendly employers.
          </p>
        </div>

        {/* User Current Readiness Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)' }}>
          <Sparkles size={14} style={{ color: 'var(--color-primary-600)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-800)' }}>
            Your Readiness: {currentScore}%
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        {OPPORTUNITIES.map((opp, idx) => {
          const isUnlocked = currentScore >= opp.readinessThreshold;
          return (
            <div
              key={idx}
              style={{
                padding: 'var(--space-5)',
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-xl)',
                border: `1.5px solid ${isUnlocked ? 'rgba(8, 127, 140, 0.3)' : 'var(--color-gray-200)'}`,
                boxShadow: isUnlocked ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: isUnlocked ? 1 : 0.85,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Badge variant={isUnlocked ? 'success' : 'neutral'} size="sm" hasDot={isUnlocked}>
                    {isUnlocked ? 'Unlocked & Ready to Apply' : `Requires ${opp.readinessThreshold}% Score`}
                  </Badge>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-700)' }}>
                    {opp.salaryRange}
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, color: 'var(--color-gray-900)', marginBottom: '2px' }}>
                  {opp.roleTitle}
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
                  <Building size={13} />
                  <span>{opp.company} • {opp.location}</span>
                </div>

                {/* Inclusion Policy Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {opp.inclusionBadges.map((badge, bIdx) => (
                    <span
                      key={bIdx}
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(8, 127, 140, 0.08)',
                        color: 'var(--color-primary-800)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(8, 127, 140, 0.15)',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Key Skills */}
                <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginBottom: '14px' }}>
                  Required Competencies: <strong>{opp.keyMatchingSkills.join(', ')}</strong>
                </div>
              </div>

              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--color-gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>
                  Threshold: {opp.readinessThreshold}%
                </span>
                <Button
                  size="sm"
                  variant={isUnlocked ? 'primary' : 'outline'}
                  onClick={() => alert(`Opportunity saved! When you reach ${opp.readinessThreshold}%, we direct-connect you with ${opp.company}'s recruitment desk.`)}
                >
                  <span>{isUnlocked ? 'Direct Refer' : 'Unlock Goal'}</span>
                  <ExternalLink size={13} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
