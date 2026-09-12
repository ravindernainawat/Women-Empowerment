import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-gray-900)',
        color: 'var(--color-gray-300)',
        padding: 'var(--space-12) var(--space-6) var(--space-6)',
        marginTop: 'auto',
      }}
    >
      <div
        className="container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                backgroundColor: 'var(--color-primary-400)',
                color: 'var(--color-white)',
                fontWeight: 'bold',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              W
            </span>
            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold', color: 'var(--color-white)' }}>
              WEIS
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)', lineHeight: '1.6' }}>
            Women Empowerment & Inclusion System. An academic initiative empowering women through
            guided skill assessment, targeted learning recommendations, verified mentorship, and safe reporting.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-white)', marginBottom: 'var(--space-3)' }}>
            Core Pillars
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
            <li>🎯 Skill-Gap Analysis & Inventory</li>
            <li>🎓 Targeted Course Recommendations</li>
            <li>🤝 Verified Mentorship Directory</li>
            <li>🛡️ Confidential Safety Reporting</li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-white)', marginBottom: 'var(--space-3)' }}>
            UN Sustainable Goals
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ padding: '2px 6px', backgroundColor: '#e5243b', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                SDG 5
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Gender Equality</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ padding: '2px 6px', backgroundColor: '#a21942', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                SDG 8
              </span>
              <span style={{ fontSize: 'var(--font-size-sm)' }}>Decent Work & Economic Growth</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--color-gray-800)',
          paddingTop: 'var(--space-6)',
          textAlign: 'center',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-gray-500)',
        }}
      >
        © 2026 Women Empowerment & Inclusion System (WEIS). Academic Prototype Phase 1.
      </div>
    </footer>
  );
};
