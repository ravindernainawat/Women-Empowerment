import React from 'react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this information. Please try again.',
  onRetry,
}) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-4)',
        textAlign: 'center',
        backgroundColor: 'var(--color-error-light)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #fecaca',
        color: 'var(--color-error)',
      }}
    >
      <span style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>⚠️</span>
      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--font-size-sm)', maxWidth: '400px', marginBottom: onRetry ? 'var(--space-4)' : 0, color: 'var(--color-gray-700)' }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm">
          Try Again
        </Button>
      )}
    </div>
  );
};
