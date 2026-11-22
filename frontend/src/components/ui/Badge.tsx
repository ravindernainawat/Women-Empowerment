import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'safety'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'outline'
  | 'coral'
  | 'mint'
  | 'verified';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  hasDot?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  hasDot = false,
  style,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary-50)',
      color: 'var(--color-primary-700)',
      border: '1px solid var(--color-primary-200)',
    },
    accent: {
      backgroundColor: 'var(--color-accent-50)',
      color: 'var(--color-accent-600)',
      border: '1px solid var(--color-accent-200)',
    },
    safety: {
      backgroundColor: 'var(--color-safety-50)',
      color: 'var(--color-safety-600)',
      border: '1px solid var(--color-safety-100)',
    },
    success: {
      backgroundColor: 'var(--color-success-light)',
      color: 'var(--color-success)',
      border: '1px solid #bbf7d0',
    },
    warning: {
      backgroundColor: 'var(--color-warning-light)',
      color: 'var(--color-warning)',
      border: '1px solid #fde68a',
    },
    error: {
      backgroundColor: 'var(--color-error-light)',
      color: 'var(--color-error)',
      border: '1px solid #fecaca',
    },
    neutral: {
      backgroundColor: 'var(--color-gray-100)',
      color: 'var(--color-gray-700)',
      border: '1px solid var(--color-gray-200)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-gray-700)',
      border: '1px solid var(--color-gray-300)',
    },
    coral: {
      backgroundColor: 'var(--color-coral-50)',
      color: 'var(--color-coral-700)',
      border: '1px solid var(--color-coral-200)',
    },
    mint: {
      backgroundColor: 'var(--color-mint-50)',
      color: 'var(--color-mint-600)',
      border: '1px solid var(--color-mint-200)',
    },
    verified: {
      backgroundColor: 'rgba(8, 127, 140, 0.08)',
      color: 'var(--color-primary-600)',
      border: '1px solid rgba(8, 127, 140, 0.25)',
      fontWeight: 600,
    },
  };

  const dotColors: Record<BadgeVariant, string> = {
    primary: 'var(--color-primary-500)',
    accent: 'var(--color-accent-500)',
    safety: 'var(--color-safety-500)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    error: 'var(--color-error)',
    neutral: 'var(--color-gray-400)',
    outline: 'var(--color-gray-400)',
    coral: 'var(--color-coral-500)',
    mint: 'var(--color-mint-500)',
    verified: 'var(--color-primary-500)',
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '11px', lineHeight: '14px' },
    md: { padding: '4px 11px', fontSize: '12px', lineHeight: '16px' },
  };

  return (
    <span
      className={`weis-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        textTransform: 'capitalize',
        letterSpacing: '0.02em',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {hasDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColors[variant],
            display: 'inline-block',
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
