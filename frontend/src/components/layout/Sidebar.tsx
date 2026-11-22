import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  Zap,
  BookOpen,
  Users,
  Inbox,
  ShieldAlert,
  FileText,
  UserCheck,
  User,
  HeartHandshake,
  Sparkles,
  Phone,
  Lock,
  IndianRupee,
  Brain,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'mentee';

  const linkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-2-5) var(--space-3-5)',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--color-primary-700)' : 'var(--color-gray-600)',
    backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    textDecoration: 'none',
    fontSize: 'var(--font-size-sm)',
    transition: 'all var(--transition-fast)',
    borderLeft: isActive ? '3px solid var(--color-primary-500)' : '3px solid transparent',
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && onClose && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 'var(--z-sidebar)',
            display: 'none',
          }}
          className="sidebar-backdrop"
          aria-hidden="true"
        />
      )}

      <aside
        className={`weis-sidebar ${isOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          top: 'var(--navbar-height)',
          left: 0,
          bottom: 0,
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--glass-bg-card)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
          borderRight: '1px solid var(--color-gray-200)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'var(--space-4) var(--space-3)',
          zIndex: 'calc(var(--z-sidebar) + 1)',
          overflowY: 'auto',
          transition: 'transform var(--transition-normal)',
        }}
        aria-label="Primary Navigation"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {/* Main Dashboard */}
          <NavLink to="/dashboard" style={linkStyle} onClick={onClose}>
            <LayoutDashboard size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
            <span>Dashboard</span>
          </NavLink>

          {/* Mentee or Mentor Flows */}
          {role !== 'admin' && (
            <>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-gray-400)',
                  textTransform: 'uppercase',
                  padding: 'var(--space-4) var(--space-3) var(--space-1-5)',
                  letterSpacing: '0.075em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} style={{ color: 'var(--color-accent-400)' }} />
                <span>Career & Growth</span>
              </div>

              <NavLink to="/skills" style={linkStyle} onClick={onClose}>
                <Target size={18} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                <span>Skill Inventory</span>
              </NavLink>

              <NavLink to="/skills/extract" style={linkStyle} onClick={onClose}>
                <Brain size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                <span>AI Skill Extractor</span>
              </NavLink>

              <NavLink to="/assessment" style={linkStyle} onClick={onClose}>
                <Zap size={18} style={{ color: 'var(--color-coral-500)', flexShrink: 0 }} />
                <span>Gap Assessment</span>
              </NavLink>

              <NavLink to="/recommendations" style={linkStyle} onClick={onClose}>
                <BookOpen size={18} style={{ color: 'var(--color-accent-600)', flexShrink: 0 }} />
                <span>Course Hub</span>
              </NavLink>

              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-gray-400)',
                  textTransform: 'uppercase',
                  padding: 'var(--space-4) var(--space-3) var(--space-1-5)',
                  letterSpacing: '0.075em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <HeartHandshake size={12} style={{ color: 'var(--color-primary-500)' }} />
                <span>Sisterhood Network</span>
              </div>

              <NavLink to="/mentorship/directory" style={linkStyle} onClick={onClose}>
                <Users size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                <span>Find a Mentor</span>
              </NavLink>

              <NavLink to="/mentorship/requests" style={linkStyle} onClick={onClose}>
                <Inbox size={18} style={{ color: 'var(--color-accent-500)', flexShrink: 0 }} />
                <span>My Requests</span>
              </NavLink>
            </>
          )}

          {/* Admin-only navigation items */}
          {role === 'admin' && (
            <>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-gray-400)',
                  textTransform: 'uppercase',
                  padding: 'var(--space-4) var(--space-3) var(--space-1-5)',
                  letterSpacing: '0.075em',
                }}
              >
                Administration
              </div>

              <NavLink to="/admin" style={linkStyle} onClick={onClose}>
                <UserCheck size={18} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />
                <span>Admin Overview</span>
              </NavLink>

              <NavLink to="/admin/safety" style={linkStyle} onClick={onClose}>
                <ShieldAlert size={18} style={{ color: 'var(--color-coral-600)', flexShrink: 0 }} />
                <span>Safety Incident Queue</span>
              </NavLink>
            </>
          )}

          {/* Safety & Sanctuary (Available for all authenticated users) */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-gray-400)',
              textTransform: 'uppercase',
              padding: 'var(--space-4) var(--space-3) var(--space-1-5)',
              letterSpacing: '0.075em',
            }}
          >
            Safe Space
          </div>

          <NavLink to="/safety/report" style={linkStyle} onClick={onClose}>
            <ShieldAlert size={18} style={{ color: 'var(--color-safety-500)', flexShrink: 0 }} />
            <span>Confidential Report</span>
          </NavLink>

          <NavLink to="/safety/anonymous" style={linkStyle} onClick={onClose}>
            <Lock size={18} style={{ color: 'var(--color-safety-600)', flexShrink: 0 }} />
            <span>Anonymous Report</span>
          </NavLink>

          <NavLink to="/safety/my-reports" style={linkStyle} onClick={onClose}>
            <FileText size={18} style={{ color: 'var(--color-safety-600)', flexShrink: 0 }} />
            <span>My Safety Reports</span>
          </NavLink>

          <NavLink to="/safety/helplines" style={linkStyle} onClick={onClose}>
            <Phone size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
            <span>Emergency Helplines</span>
          </NavLink>

          {/* Government Schemes */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--color-gray-400)',
              textTransform: 'uppercase',
              padding: 'var(--space-4) var(--space-3) var(--space-1-5)',
              letterSpacing: '0.075em',
            }}
          >
            Opportunities
          </div>

          <NavLink to="/schemes" style={linkStyle} onClick={onClose}>
            <IndianRupee size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span>Govt. Scheme Finder</span>
          </NavLink>
        </div>

        {/* Bottom Profile & Impact Card */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          <NavLink
            to="/profile"
            style={linkStyle}
            onClick={onClose}
          >
            <User size={18} style={{ color: 'var(--color-gray-600)', flexShrink: 0 }} />
            <span>My Profile</span>
          </NavLink>

          {/* UN SDG Impact Pill */}
          <div
            style={{
              marginTop: 'var(--space-3)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, rgba(8,127,140,0.06) 0%, rgba(167,139,250,0.08) 100%)',
              border: '1px solid var(--glass-border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  backgroundColor: '#e5243b',
                  color: 'white',
                  padding: '2px 5px',
                  borderRadius: '3px',
                }}
              >
                SDG 5
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  backgroundColor: '#a21942',
                  color: 'white',
                  padding: '2px 5px',
                  borderRadius: '3px',
                }}
              >
                SDG 8
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-gray-600)', fontWeight: 500, lineHeight: 1.3 }}>
              Women Empowerment & Inclusive Digital Growth
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
