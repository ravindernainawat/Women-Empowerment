import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const LandingPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section
        style={{
          marginTop: 'var(--navbar-height)',
          background: 'linear-gradient(135deg, #0d7377 0%, #042f30 100%)',
          color: 'var(--color-white)',
          padding: 'var(--space-20) var(--space-6) var(--space-16)',
          textAlign: 'center',
        }}
      >
        <div className="container" style={{ maxWidth: '840px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-4)',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              marginBottom: 'var(--space-6)',
              backdropFilter: 'blur(4px)',
            }}
          >
            Empowering Women Across Career Transitions & Up-skilling
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 'var(--font-weight-bold)',
              lineHeight: 1.15,
              marginBottom: 'var(--space-6)',
              letterSpacing: '-1px',
            }}
          >
            Bridge Your Skill Gaps. Connect With Mentors. Advance with Confidence.
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-primary-100)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-8)',
              maxWidth: '720px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            WEIS provides personalized skill assessments, curated course recommendations,
            verified mentorship networks, and a safe, confidential space for women in tech and leadership.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link to="/register">
              <Button size="lg" style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-primary-700)', fontWeight: 'bold' }}>
                Start Your Journey →
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" style={{ borderColor: 'var(--color-white)', color: 'var(--color-white)' }}>
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section style={{ padding: 'var(--space-16) var(--space-6)', backgroundColor: 'var(--color-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
              Built Around Four Core Pillars
            </h2>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
              Every feature in WEIS directly solves real career transition and inclusion challenges.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            <Card hoverEffect padding="lg">
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🎯</div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Skill-Gap Assessment
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}>
                Benchmark your skills against target roles. Receive objective readiness percentages
                and a clear breakdown of where to focus next.
              </p>
            </Card>

            <Card hoverEffect padding="lg">
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🎓</div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Tailored Learning
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}>
                Directly maps your identified gaps to high-impact courses from trusted providers,
                saving time and eliminating guesswork.
              </p>
            </Card>

            <Card hoverEffect padding="lg">
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🤝</div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Verified Mentorship
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}>
                Connect 1-on-1 with vetted industry leaders and experienced professionals dedicated to
                supporting your career re-entry and growth.
              </p>
            </Card>

            <Card hoverEffect padding="lg">
              <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)' }}>🛡️</div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
                Confidential Safety
              </h3>
              <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--font-size-base)', lineHeight: 1.6 }}>
                A dedicated, non-intrusive channel to report workplace or platform inclusion issues,
                monitored strictly by verified administrators.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 4-Step Mentee Journey Section */}
      <section style={{ padding: 'var(--space-16) var(--space-6)', backgroundColor: 'var(--color-gray-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-2)' }}>
              How WEIS Works
            </h2>
            <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-lg)' }}>
              A structured roadmap from onboarding to career confidence.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--space-6)',
            }}
          >
            {[
              { step: '1', title: 'Inventory Skills', text: 'Catalog your technical and soft skills with current proficiency levels.' },
              { step: '2', title: 'Assess Gaps', text: 'Select a target job profile and calculate readiness benchmarks.' },
              { step: '3', title: 'Learn & Upskill', text: 'Enroll in prioritized courses addressing your highest-impact gaps.' },
              { step: '4', title: 'Engage Mentors', text: 'Request mentorship from vetted women leaders in your domain.' },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  backgroundColor: 'var(--color-white)',
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-gray-200)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-700)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  {s.step}
                </div>
                <h4 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}>{s.title}</h4>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)', lineHeight: 1.5 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainable Development Goals Alignment */}
      <section style={{ padding: 'var(--space-12) var(--space-6)', backgroundColor: 'var(--color-white)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <h2 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-4)' }}>
            Aligned with United Nations Global Goals
          </h2>
          <p style={{ color: 'var(--color-gray-600)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
            WEIS is committed to advancing <strong>SDG 5 (Gender Equality)</strong> by breaking glass ceilings
            and promoting workforce inclusion, and <strong>SDG 8 (Decent Work & Economic Growth)</strong> by
            equipping women with market-relevant skills.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <span style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: '#e5243b', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
              Goal 5: Gender Equality
            </span>
            <span style={{ padding: 'var(--space-2) var(--space-4)', backgroundColor: '#a21942', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
              Goal 8: Decent Work & Economic Growth
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
