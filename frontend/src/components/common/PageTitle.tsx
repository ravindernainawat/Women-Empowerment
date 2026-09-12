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
        marginBottom: 'var(--space-6)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-gray-900)',
            marginBottom: description ? 'var(--space-1)' : 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--font-size-base)', maxWidth: '640px' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
