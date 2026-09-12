import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'safety';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'var(--font-weight-medium)' as any,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
    fontFamily: 'inherit',
    gap: 'var(--space-2)',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: 'var(--space-1) var(--space-3)', fontSize: 'var(--font-size-sm)' },
    md: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--font-size-base)' },
    lg: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--font-size-lg)' },
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--color-primary-500)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-primary-500)',
    },
    secondary: {
      backgroundColor: 'var(--color-accent-500)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-accent-500)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary-500)',
      borderColor: 'var(--color-primary-500)',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-error)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-gray-700)',
      borderColor: 'transparent',
    },
    safety: {
      backgroundColor: 'var(--color-safety-500)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-safety-500)',
    },
  };

  return (
    <button
      style={{
        ...baseStyles,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 0.75s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
};
