import React from 'react';

export interface PageTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, description, action }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-8)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.25rem)',
            fontWeight: 800,
            color: 'var(--color-gray-900)',
            fontFamily: "'Plus Jakarta Sans', var(--font-family)",
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
            marginBottom: description ? 'var(--space-1-5)' : 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              color: 'var(--color-gray-600)',
              fontSize: 'var(--font-size-sm)',
              maxWidth: '680px',
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
