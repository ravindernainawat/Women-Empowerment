import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'safety'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
  | 'outline';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)', border: '1px solid var(--color-primary-200)' },
    accent: { backgroundColor: '#f5e8f7', color: 'var(--color-accent-600)', border: '1px solid #ebd2ef' },
    safety: { backgroundColor: 'var(--color-safety-100)', color: 'var(--color-safety-600)', border: '1px solid #bed2e8' },
    success: { backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', border: '1px solid #bbf7d0' },
    warning: { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)', border: '1px solid #fde68a' },
    error: { backgroundColor: 'var(--color-error-light)', color: 'var(--color-error)', border: '1px solid #fecaca' },
    neutral: { backgroundColor: 'var(--color-gray-100)', color: 'var(--color-gray-700)', border: '1px solid var(--color-gray-300)' },
    outline: { backgroundColor: 'transparent', color: 'var(--color-gray-700)', border: '1px solid var(--color-gray-300)' },
  };

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: 'var(--font-size-xs)' },
    md: { padding: '4px 10px', fontSize: 'var(--font-size-sm)' },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 'var(--font-weight-medium)' as any,
        borderRadius: 'var(--radius-full)',
        textTransform: 'capitalize',
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
    >
      {children}
    </span>
  );
};
