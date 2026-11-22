import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
  variant?: 'glass' | 'white' | 'subtle' | 'gradient';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  padding = 'md',
  variant = 'glass',
  className = '',
  style,
  ...props
}) => {
  const paddings = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-6)',
    lg: 'var(--space-8)',
  };

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'white':
        return {
          backgroundColor: 'var(--color-white)',
          border: '1px solid var(--color-gray-200)',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'subtle':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          boxShadow: 'var(--shadow-xs)',
          backdropFilter: 'var(--backdrop-blur-sm)',
          WebkitBackdropFilter: 'var(--backdrop-blur-sm)',
        };
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,250,246,0.85) 100%)',
          border: '1px solid rgba(8, 127, 140, 0.15)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
        };
      case 'glass':
      default:
        return {
          backgroundColor: 'var(--glass-bg-card)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
          backdropFilter: 'var(--backdrop-blur)',
          WebkitBackdropFilter: 'var(--backdrop-blur)',
        };
    }
  };

  return (
    <div
      className={`weis-card ${hoverEffect ? 'hover-lift' : ''} ${className}`}
      style={{
        borderRadius: 'var(--radius-xl)',
        padding: paddings[padding],
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        cursor: hoverEffect ? 'pointer' : undefined,
        position: 'relative',
        overflow: 'hidden',
        ...getVariantStyles(),
        ...style,
      }}
      onMouseEnter={
        hoverEffect
          ? (e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = 'var(--glass-shadow-hover)';
            }
          : undefined
      }
      onMouseLeave={
        hoverEffect
          ? (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = getVariantStyles().boxShadow as string;
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
};
