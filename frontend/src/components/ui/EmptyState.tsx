import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = '📋',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-6)',
        textAlign: 'center',
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--color-gray-300)',
      }}
    >
      <span style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }} role="img" aria-hidden="true">
        {icon}
      </span>
      <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)', marginBottom: 'var(--space-2)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--color-gray-500)', maxWidth: '420px', marginBottom: actionLabel ? 'var(--space-6)' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
