import React from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an issue while retrieving this information. Please try again.',
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
        padding: 'var(--space-8) var(--space-6)',
        textAlign: 'center',
        backgroundColor: 'var(--color-error-light)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid #fecaca',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)',
          marginBottom: 'var(--space-3)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <AlertCircle size={26} />
      </div>

      <h3
        style={{
          fontSize: 'var(--font-size-base)',
          fontWeight: 700,
          color: 'var(--color-gray-900)',
          marginBottom: 'var(--space-1)',
          fontFamily: "'Plus Jakarta Sans', var(--font-family)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          maxWidth: '400px',
          lineHeight: 1.5,
          marginBottom: onRetry ? 'var(--space-4)' : 0,
          color: 'var(--color-gray-600)',
        }}
      >
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
