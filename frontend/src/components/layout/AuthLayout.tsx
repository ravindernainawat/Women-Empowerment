import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sparkles, Shield, HeartHandshake, Award } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        backgroundColor: 'var(--color-warm-bg)',
      }}
    >
      {/* Left Inspiring Visual Panel (Visible on Desktop / Tablets) */}
      <div
        className="auth-hero-panel"
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #07545b 0%, #087f8c 45%, #7c3d8c 100%)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--space-12) var(--space-10)',
          color: 'var(--color-white)',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(242, 139, 130, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '22px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              W
            </div>
            <div>
              <span style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                WEIS
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  letterSpacing: '0.04em',
                }}
              >
                Women Empowerment & Inclusion System
              </span>
            </div>
          </Link>
        </div>

        {/* Hero Narrative */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px', margin: 'auto 0' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffe1de',
              marginBottom: 'var(--space-6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Sparkles size={14} style={{ color: 'var(--color-coral-300)' }} />
            <span>Empowering Women Across Digital Careers</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: 'white',
              marginBottom: 'var(--space-4)',
              letterSpacing: '-0.03em',
            }}
          >
            Bridge Your Skill Gaps. Connect With Leaders.
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-base)',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              marginBottom: 'var(--space-8)',
            }}
          >
            Join a thriving ecosystem designed for underprivileged women and girls — with personalized skill-gap roadmaps, verified mentors, and confidential safety support.
          </p>

          {/* Social Proof / Pillars Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Award size={20} style={{ color: 'var(--color-coral-300)' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Skill Roadmaps</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>Objective gap scoring</div>
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <HeartHandshake size={20} style={{ color: '#a78bfa' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Verified Mentors</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>1-on-1 career guidance</div>
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                gridColumn: 'span 2',
              }}
            >
              <Shield size={20} style={{ color: '#93d7dc' }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>100% Confidential Safety Reporting</div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)' }}>Isolated encryption and trauma-informed support</div>
              </div>
            </div>
          </div>
        </div>

        {/* UN SDG Pill Footer */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ padding: '2px 6px', backgroundColor: '#e5243b', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
            SDG 5
          </span>
          <span style={{ padding: '2px 6px', backgroundColor: '#a21942', color: 'white', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}>
            SDG 8
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
            Aligned with UN Sustainable Development Goals
          </span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--space-8) var(--space-6)',
          minHeight: '100vh',
          backgroundColor: 'var(--color-warm-bg)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'var(--glass-bg-card)',
            backdropFilter: 'var(--backdrop-blur)',
            WebkitBackdropFilter: 'var(--backdrop-blur)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--glass-border)',
          }}
        >
          <Outlet />
        </div>

        <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
          <Link to="/" style={{ color: 'var(--color-gray-600)', textDecoration: 'none', marginRight: 'var(--space-4)' }}>
            ← Back to Home
          </Link>
          <span>•</span>
          <Link to="/safety/report" style={{ color: 'var(--color-safety-500)', textDecoration: 'none', marginLeft: 'var(--space-4)' }}>
            Confidential Safety Line
          </Link>
        </div>
      </div>
    </div>
  );
};
