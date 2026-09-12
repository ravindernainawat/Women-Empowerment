import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverEffect = false,
  padding = 'md',
  style,
  ...props
}) => {
  const paddings = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-8)',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--color-gray-200)',
        padding: paddings[padding],
        transition: hoverEffect ? 'transform var(--transition-fast), box-shadow var(--transition-fast)' : undefined,
        cursor: hoverEffect ? 'pointer' : undefined,
        ...style,
      }}
      onMouseEnter={
        hoverEffect
          ? (e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }
          : undefined
      }
      onMouseLeave={
        hoverEffect
          ? (e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
};
