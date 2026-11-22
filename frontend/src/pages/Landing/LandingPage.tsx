import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  Target,
  GraduationCap,
  HeartHandshake,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
  Shield,
  Heart,
  TrendingUp,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-warm-bg)' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          marginTop: 'var(--navbar-height)',
          background: 'linear-gradient(135deg, #07545b 0%, #087f8c 40%, #7c3d8c 100%)',
          color: 'var(--color-white)',
          padding: 'var(--space-20) var(--space-6) var(--space-16)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Soft atmospheric gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            borderRadius: 'var(--radius-full)',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '-10%',
            width: '500px',
            height: '500px',
            borderRadius: 'var(--radius-full)',
            background: 'radial-gradient(circle, rgba(242, 139, 130, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div className="container" style={{ maxWidth: '960px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(8px)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#ffe1de',
              marginBottom: 'var(--space-6)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Sparkles size={16} style={{ color: 'var(--color-coral-300)' }} />
            <span>AI-Driven Women Empowerment, Digital Inclusion & Safety Support</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 'var(--space-6)',
              letterSpacing: '-0.03em',
              fontFamily: "'Plus Jakarta Sans', var(--font-family)",
              color: 'var(--color-white)',
            }}
          >
            Bridge Your Skill Gaps. Connect With Mentors. <br />
            <span style={{ background: 'linear-gradient(135deg, #ffe1de 0%, #c4b5fd 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Advance with Unshakable Confidence.
            </span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: 'rgba(255, 255, 255, 0.88)',
              lineHeight: 1.7,
              marginBottom: 'var(--space-10)',
              maxWidth: '760px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            WEIS provides underprivileged women and girls with personalized skill assessments, curated technical courses, a verified network of industry mentors, and an encrypted, confidential safety reporting sanctuary.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
            <Link to="/register">
              <Button size="lg" variant="coral" style={{ fontWeight: 700, padding: '14px 32px', fontSize: '16px', boxShadow: '0 8px 24px rgba(242, 139, 130, 0.35)' }}>
                Start Your Journey Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" style={{ borderColor: 'rgba(255, 255, 255, 0.6)', color: 'white', padding: '14px 28px', fontSize: '16px' }}>
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          {/* Platform Objectives & Architectural Standards Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 'var(--space-4)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-5) var(--space-6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#ffe1de', fontWeight: 700, marginBottom: '2px' }}>
                Program Target
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#ffe1de' }}>1,000+ Learners</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Digital Inclusion Cohort</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#c4b5fd', fontWeight: 700, marginBottom: '2px' }}>
                Mentor Network
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#c4b5fd' }}>Verified Leaders</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Tech & Leadership Guides</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#93d7dc', fontWeight: 700, marginBottom: '2px' }}>
                Assessment Model
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#93d7dc' }}>3-Tier Scoring</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Objective Role Gap Analysis</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#bbf7d0', fontWeight: 700, marginBottom: '2px' }}>
                Privacy Standard
              </div>
              <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: '#bbf7d0' }}>Admin-Isolated</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>Confidential Sanctuary</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars Bento Section */}
      <section style={{ padding: 'var(--space-20) var(--space-6)', backgroundColor: 'var(--color-warm-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              <Compass size={14} />
              <span>Comprehensive Architecture</span>
            </div>
            <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.025em', marginBottom: 'var(--space-3)' }}>
              Built Around Four Core Pillars
            </h2>
            <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-lg)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
              Every feature in WEIS directly addresses systemic barriers across digital training, leadership mentorship, and workplace inclusion.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {/* Pillar 1 */}
            <Card hoverEffect padding="lg" variant="glass">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <Target size={28} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Skill-Gap Assessment
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                Benchmark your competencies against target tech roles. Receive objective readiness percentages and actionable gap roadmaps.
              </p>
              <Link to="/skills" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Explore Skill Inventory <ArrowRight size={14} />
              </Link>
            </Card>

            {/* Pillar 2 */}
            <Card hoverEffect padding="lg" variant="glass">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-accent-50)',
                  color: 'var(--color-accent-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <GraduationCap size={28} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Tailored Course Roadmaps
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                Algorithmically maps your specific skill deficits to verified courses from trusted providers, cutting down search fatigue.
              </p>
              <Link to="/recommendations" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-accent-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View Course Hub <ArrowRight size={14} />
              </Link>
            </Card>

            {/* Pillar 3 */}
            <Card hoverEffect padding="lg" variant="glass">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-coral-50)',
                  color: 'var(--color-coral-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <HeartHandshake size={28} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Verified Mentorship
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                Connect 1-on-1 with vetted women leaders and senior technologists committed to lifting others across their journeys.
              </p>
              <Link to="/mentorship/directory" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-coral-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Meet Mentors <ArrowRight size={14} />
              </Link>
            </Card>

            {/* Pillar 4 */}
            <Card hoverEffect padding="lg" variant="glass">
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-safety-50)',
                  color: 'var(--color-safety-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <ShieldAlert size={28} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Confidential Sanctuary
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-sm)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                A secure, trauma-informed reporting channel for inclusion or safety concerns, strictly restricted to verified administrators.
              </p>
              <Link to="/safety/report" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-safety-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Safe Reporting <ArrowRight size={14} />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* UN Sustainable Development Goals Spotlight */}
      <section style={{ padding: 'var(--space-16) var(--space-6)', backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-gray-200)', borderBottom: '1px solid var(--color-gray-200)' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)', alignItems: 'center' }}>
            <div>
              <Badge variant="coral" size="md" hasDot style={{ marginBottom: 'var(--space-3)' }}>
                Global Impact Framework
              </Badge>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.025em', marginBottom: 'var(--space-3)' }}>
                Grounded in the United Nations Sustainable Development Goals
              </h2>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>
                WEIS translates abstract global objectives into concrete digital tools for women. By measuring real skill proficiencies and matching them to economic opportunities, we drive tangible gender parity.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Link to="/register">
                  <Button variant="primary">Join the Initiative →</Button>
                </Link>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-coral-50)',
                  border: '1px solid var(--color-coral-200)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ padding: '6px 12px', backgroundColor: '#e5243b', color: 'white', borderRadius: '6px', fontWeight: 800, fontSize: '14px' }}>
                  SDG 5
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                    Gender Equality & Inclusion
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
                    Empowering all women and girls by eliminating digital divides and offering barrier-free access to technology mentorship.
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-5)',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-200)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ padding: '6px 12px', backgroundColor: '#a21942', color: 'white', borderRadius: '6px', fontWeight: 800, fontSize: '14px' }}>
                  SDG 8
                </div>
                <div>
                  <h4 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-gray-900)', marginBottom: '4px' }}>
                    Decent Work & Economic Growth
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-600)', lineHeight: 1.5 }}>
                    Equipping learners with high-demand competencies that lead to sustainable, productive digital careers and leadership roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Callout */}
      <section style={{ padding: 'var(--space-20) var(--space-6)', textAlign: 'center' }}>
        <div
          className="container"
          style={{
            maxWidth: '820px',
            backgroundColor: 'var(--glass-bg-card)',
            backdropFilter: 'var(--backdrop-blur)',
            padding: 'var(--space-12) var(--space-8)',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid rgba(8, 127, 140, 0.2)',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--gradient-coral)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4)',
            }}
          >
            <Heart size={26} fill="currentColor" />
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 800, color: 'var(--color-gray-900)', letterSpacing: '-0.025em', marginBottom: 'var(--space-3)' }}>
            Ready to Take Control of Your Career Path?
          </h2>
          <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', maxWidth: '580px', margin: '0 auto var(--space-8)', lineHeight: 1.6 }}>
            Join hundreds of women discovering their strengths, connecting with world-class mentors, and advancing into tech.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button size="lg" variant="gradient">
                Create Your Profile Today →
              </Button>
            </Link>
            <Link to="/mentorship/directory">
              <Button size="lg" variant="outline">
                Browse Mentor Directory
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
