import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-gray-50)' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            marginLeft: 'var(--sidebar-width)',
            marginTop: 'var(--navbar-height)',
            padding: 'var(--space-8)',
            minHeight: 'calc(100vh - var(--navbar-height))',
            maxWidth: '1400px',
            width: '100%',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};
