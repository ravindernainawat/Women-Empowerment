import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--color-gray-100)',
        padding: 'var(--space-6)',
      }}
    >
      <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-500)',
              color: 'var(--color-white)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              marginBottom: 'var(--space-2)',
            }}
          >
            W
          </div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-gray-900)' }}>
            WEIS Platform
          </h1>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
            Women Empowerment & Inclusion System
          </p>
        </Link>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--color-gray-200)',
        }}
      >
        <Outlet />
      </div>

      <div style={{ marginTop: 'var(--space-6)', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
        Aligning with UN SDG 5: Gender Equality & SDG 8: Decent Work
      </div>
    </div>
  );
};
