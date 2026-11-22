import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Menu,
  X,
  LogOut,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--glass-bg-card)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        borderBottom: '1px solid var(--color-gray-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        zIndex: 'var(--z-navbar)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Brand logo & mobile toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            style={{
              background: 'none',
              border: 'none',
              padding: 'var(--space-1-5)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: 'var(--color-gray-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle mobile menu"
          >
            {isMobileSidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}

        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textDecoration: 'none',
          }}
        >
          {/* Logo Mark */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-hero)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 'var(--font-size-xl)',
              boxShadow: 'var(--shadow-glow)',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            W
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-gray-900)',
                  letterSpacing: '-0.03em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                WEIS
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: 'var(--color-primary-600)',
                  backgroundColor: 'var(--color-primary-50)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-primary-100)',
                }}
              >
                AI IMPACT
              </span>
            </div>
            <span
              style={{
                display: 'block',
                fontSize: '10px',
                color: 'var(--color-gray-500)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                lineHeight: 1,
              }}
            >
              Women Empowerment & Inclusion System
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation links & user controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {isAuthenticated && user ? (
          <>
            {/* Faculty / Evaluator Demo Role Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                backgroundColor: 'rgba(8, 127, 140, 0.05)',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--color-accent-500)' }} />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--color-gray-500)',
                  display: 'inline-block',
                }}
                className="hide-mobile"
              >
                Demo Role:
              </span>
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value as any)}
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--color-primary-700)',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                aria-label="Switch User Role Demonstration"
              >
                <option value="mentee">Mentee (Amina)</option>
                <option value="mentor">Mentor (Dr. Sunita)</option>
                <option value="admin">Admin Portal</option>
              </select>
            </div>

            {/* User Profile Pill & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '4px 8px 4px 4px',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)',
                }}
                aria-expanded={isProfileDropdownOpen}
                aria-haspopup="true"
              >
                {/* Avatar Initials Circle */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    background:
                      user.role === 'admin'
                        ? 'var(--gradient-coral)'
                        : user.role === 'mentor'
                        ? 'var(--gradient-accent)'
                        : 'var(--gradient-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {user.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }} className="hide-mobile">
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-gray-800)',
                      lineHeight: 1.2,
                    }}
                  >
                    {user.full_name}
                  </span>
                </div>
                <Badge
                  variant={user.role === 'admin' ? 'accent' : user.role === 'mentor' ? 'primary' : 'neutral'}
                  size="sm"
                >
                  {user.role}
                </Badge>
                <ChevronDown size={14} style={{ color: 'var(--color-gray-400)' }} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  <div
                    onClick={() => setIsProfileDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 'calc(var(--z-dropdown) - 1)',
                    }}
                    aria-hidden="true"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 8px)',
                      width: '220px',
                      backgroundColor: 'var(--color-white)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-gray-200)',
                      boxShadow: 'var(--shadow-lg)',
                      padding: 'var(--space-2)',
                      zIndex: 'var(--z-dropdown)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderBottom: '1px solid var(--color-gray-100)',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-800)' }}>
                        {user.full_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', wordBreak: 'break-all' }}>
                        {user.email}
                      </div>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-gray-700)',
                        fontSize: '13px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <User size={16} style={{ color: 'var(--color-primary-500)' }} />
                      <span>Account Profile</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-gray-700)',
                        fontSize: '13px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-gray-50)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <GraduationCap size={16} style={{ color: 'var(--color-accent-500)' }} />
                      <span>My Learning Hub</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--color-error)',
                        fontSize: '13px',
                        fontWeight: 500,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-error-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
