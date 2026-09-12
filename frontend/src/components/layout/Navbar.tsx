import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-gray-200)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-6)',
        zIndex: 'var(--z-navbar)',
      }}
    >
      {/* Brand logo & tagline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-500)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-xl)',
            }}
          >
            W
          </div>
          <div>
            <span
              style={{
                fontWeight: 'var(--font-weight-bold)',
                fontSize: 'var(--font-size-xl)',
                color: 'var(--color-gray-900)',
                letterSpacing: '-0.5px',
              }}
            >
              WEIS
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '10px',
                color: 'var(--color-gray-500)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                lineHeight: 1,
              }}
            >
              Women Empowerment
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation links & user controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        {isAuthenticated && user ? (
          <>
            {/* Quick Role Switcher for seamless faculty/evaluator demo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>Demo Role:</span>
              <select
                value={user.role}
                onChange={(e) => switchRole(e.target.value as any)}
                style={{
                  fontSize: 'var(--font-size-xs)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-gray-300)',
                  backgroundColor: 'var(--color-gray-100)',
                  cursor: 'pointer',
                }}
                aria-label="Switch User Role Demonstration"
              >
                <option value="mentee">Mentee (Amina)</option>
                <option value="mentor">Mentor (Dr. Sunita)</option>
                <option value="admin">Admin Portal</option>
              </select>
            </div>

            {/* User status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-gray-800)' }}>
                {user.full_name}
              </span>
              <Badge variant={user.role === 'admin' ? 'accent' : user.role === 'mentor' ? 'primary' : 'neutral'} size="sm">
                {user.role}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Log Out
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </header>
  );
};
