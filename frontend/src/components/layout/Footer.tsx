import React from 'react';
import { Link } from 'react-router-dom';
import { Target, GraduationCap, HeartHandshake, ShieldAlert, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-gray-900)',
        color: 'var(--color-gray-300)',
        padding: 'var(--space-16) var(--space-6) var(--space-8)',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative ambient background glow */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: 'var(--radius-full)',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: 'var(--radius-full)',
          background: 'radial-gradient(circle, rgba(8, 127, 140, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 'var(--space-10)',
          marginBottom: 'var(--space-12)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Brand statement */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--gradient-hero)',
                color: 'var(--color-white)',
                fontWeight: 800,
                fontSize: 'var(--font-size-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              W
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-white)' }}>
                WEIS
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: 'var(--color-accent-400)',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                Women Empowerment & Inclusion System
              </span>
            </div>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)', lineHeight: '1.7', marginBottom: 'var(--space-4)' }}>
            An AI-driven digital platform dedicated to bridging skill divides, connecting underprivileged women and girls with verified mentors, and ensuring a secure, confidential environment for growth.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-coral-300)' }}>
            <Heart size={14} fill="currentColor" />
            <span>Built with care for women in technology & leadership</span>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div>
          <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-white)', fontWeight: 700, marginBottom: 'var(--space-4)', letterSpacing: '-0.01em' }}>
            Core Pillars
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={16} style={{ color: 'var(--color-primary-400)' }} />
              <Link to="/skills" style={{ color: 'var(--color-gray-300)', textDecoration: 'none' }}>
                Skill-Gap Analysis & Inventory
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={16} style={{ color: 'var(--color-accent-400)' }} />
              <Link to="/recommendations" style={{ color: 'var(--color-gray-300)', textDecoration: 'none' }}>
                Targeted Course Recommendations
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <HeartHandshake size={16} style={{ color: 'var(--color-coral-400)' }} />
              <Link to="/mentorship/directory" style={{ color: 'var(--color-gray-300)', textDecoration: 'none' }}>
                Verified Mentorship Directory
              </Link>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--color-safety-500)' }} />
              <Link to="/safety/report" style={{ color: 'var(--color-gray-300)', textDecoration: 'none' }}>
                Confidential Safety Reporting
              </Link>
            </li>
          </ul>
        </div>

        {/* UN SDG Alignment */}
        <div>
          <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-white)', fontWeight: 700, marginBottom: 'var(--space-4)', letterSpacing: '-0.01em' }}>
            UN Sustainable Goals
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2-5) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ padding: '3px 8px', backgroundColor: '#e5243b', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                SDG 5
              </span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Gender Equality</div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>Empowering all women and girls</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-2-5) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ padding: '3px 8px', backgroundColor: '#a21942', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                SDG 8
              </span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Decent Work & Growth</div>
                <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>Full, productive employment for all</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="container"
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-gray-500)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          © 2026 Women Empowerment & Inclusion System (WEIS). Academic & Social Impact Initiative.
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link to="/" style={{ color: 'var(--color-gray-400)', textDecoration: 'none' }}>
            Home
          </Link>
          <Link to="/login" style={{ color: 'var(--color-gray-400)', textDecoration: 'none' }}>
            Portal Sign In
          </Link>
          <Link to="/safety/report" style={{ color: 'var(--color-gray-400)', textDecoration: 'none' }}>
            Safe Reporting
          </Link>
        </div>
      </div>
    </footer>
  );
};
