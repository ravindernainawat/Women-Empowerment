import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'mentee';

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
    backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
    fontWeight: isActive ? ('var(--font-weight-semibold)' as any) : ('var(--font-weight-normal)' as any),
    textDecoration: 'none',
    fontSize: 'var(--font-size-sm)',
    transition: 'all var(--transition-fast)',
  });

  return (
    <aside
      style={{
        position: 'fixed',
        top: 'var(--navbar-height)',
        left: 0,
        bottom: 0,
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--color-white)',
        borderRight: '1px solid var(--color-gray-200)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'var(--space-4) var(--space-3)',
        zIndex: 'var(--z-sidebar)',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {/* Main Dashboard */}
        <NavLink to="/dashboard" style={linkStyle}>
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>

        {/* Mentee or Mentor Flows */}
        {role !== 'admin' && (
          <>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-400)',
                textTransform: 'uppercase',
                padding: 'var(--space-3) var(--space-3) var(--space-1)',
                letterSpacing: '0.5px',
              }}
            >
              Career & Skills
            </div>

            <NavLink to="/skills" style={linkStyle}>
              <span>🎯</span>
              <span>Skill Inventory</span>
            </NavLink>

            <NavLink to="/assessment" style={linkStyle}>
              <span>⚡</span>
              <span>Gap Assessment</span>
            </NavLink>

            <NavLink to="/recommendations" style={linkStyle}>
              <span>🎓</span>
              <span>Recommendations</span>
            </NavLink>

            <div
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-400)',
                textTransform: 'uppercase',
                padding: 'var(--space-3) var(--space-3) var(--space-1)',
                letterSpacing: '0.5px',
              }}
            >
              Network
            </div>

            <NavLink to="/mentorship/directory" style={linkStyle}>
              <span>🤝</span>
              <span>Find a Mentor</span>
            </NavLink>

            <NavLink to="/mentorship/requests" style={linkStyle}>
              <span>📬</span>
              <span>Mentorship Requests</span>
            </NavLink>
          </>
        )}

        {/* Admin specific flows */}
        {role === 'admin' && (
          <>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-gray-400)',
                textTransform: 'uppercase',
                padding: 'var(--space-3) var(--space-3) var(--space-1)',
                letterSpacing: '0.5px',
              }}
            >
              Administration
            </div>

            <NavLink to="/admin" style={linkStyle}>
              <span>⚙️</span>
              <span>Admin Overview</span>
            </NavLink>

            <NavLink to="/admin/safety" style={linkStyle}>
              <span>🛡️</span>
              <span>Safety Incident Queue</span>
            </NavLink>
          </>
        )}

        {/* Profile */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-gray-400)',
            textTransform: 'uppercase',
            padding: 'var(--space-3) var(--space-3) var(--space-1)',
            letterSpacing: '0.5px',
          }}
        >
          Account
        </div>
        <NavLink to="/profile" style={linkStyle}>
          <span>👤</span>
          <span>My Profile</span>
        </NavLink>
      </div>

      {/* Persistently Accessible Safety Pillar Banner (UI/UX Requirement: calm blue/gray, never buried) */}
      <div
        style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--color-safety-100)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid #bfd5ea',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
          <span>🛡️</span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-safety-600)' }}>
            Safety & Inclusion
          </span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-gray-600)', marginBottom: 'var(--space-2)' }}>
          Confidentially report concerns or harassment.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink
            to="/safety/report"
            style={{
              display: 'block',
              textAlign: 'center',
              backgroundColor: 'var(--color-safety-500)',
              color: 'var(--color-white)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              textDecoration: 'none',
            }}
          >
            File a Concern
          </NavLink>
          <NavLink
            to="/safety/my-reports"
            style={{
              display: 'block',
              textAlign: 'center',
              fontSize: '11px',
              color: 'var(--color-safety-600)',
              textDecoration: 'underline',
              padding: '2px',
            }}
          >
            Track My Reports
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
