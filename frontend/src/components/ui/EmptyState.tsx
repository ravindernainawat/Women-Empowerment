import React from 'react';
import { Button } from './Button';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
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
        backgroundColor: 'var(--glass-bg-card)',
        backdropFilter: 'var(--backdrop-blur)',
        WebkitBackdropFilter: 'var(--backdrop-blur)',
        borderRadius: 'var(--radius-xl)',
        border: '1.5px dashed var(--color-gray-300)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-accent-50) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary-500)',
          marginBottom: 'var(--space-4)',
          border: '1px solid var(--color-primary-100)',
        }}
      >
        {icon ? (
          typeof icon === 'string' ? (
            <span style={{ fontSize: '24px' }}>{icon}</span>
          ) : (
            icon
          )
        ) : (
          <FolderOpen size={28} />
        )}
      </div>

      <h3
        style={{
          fontSize: 'var(--font-size-lg)',
          fontWeight: 700,
          color: 'var(--color-gray-900)',
          marginBottom: 'var(--space-2)',
          fontFamily: "'Plus Jakarta Sans', var(--font-family)",
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: 'var(--color-gray-500)',
          fontSize: 'var(--font-size-sm)',
          maxWidth: '420px',
          lineHeight: 1.6,
          marginBottom: actionLabel ? 'var(--space-6)' : 0,
        }}
      >
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
