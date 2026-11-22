import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'safety' | 'coral' | 'gradient';
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
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.65 : 1,
    transition: 'all var(--transition-fast)',
    textDecoration: 'none',
    fontFamily: "'Plus Jakarta Sans', var(--font-family)",
    gap: 'var(--space-2)',
    boxShadow: variant === 'primary' || variant === 'gradient' ? 'var(--shadow-sm)' : 'none',
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: 'var(--font-size-xs)' },
    md: { padding: '9px 18px', fontSize: 'var(--font-size-sm)' },
    lg: { padding: '12px 24px', fontSize: 'var(--font-size-base)' },
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
      color: 'var(--color-primary-600)',
      borderColor: 'var(--color-primary-200)',
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
    coral: {
      backgroundColor: 'var(--color-coral-500)',
      color: 'var(--color-white)',
      borderColor: 'var(--color-coral-500)',
    },
    gradient: {
      background: 'var(--gradient-hero)',
      color: 'var(--color-white)',
      borderColor: 'transparent',
      boxShadow: 'var(--shadow-glow)',
    },
  };

  return (
    <button
      className={`weis-button ${className}`}
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
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};
