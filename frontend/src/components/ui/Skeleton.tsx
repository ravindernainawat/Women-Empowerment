import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '1rem',
  borderRadius,
  variant = 'rect',
  style,
  className = '',
  ...props
}) => {
  const getRadius = () => {
    if (borderRadius) return borderRadius;
    if (variant === 'circle') return 'var(--radius-full)';
    if (variant === 'text') return 'var(--radius-xs)';
    return 'var(--radius-md)';
  };

  return (
    <div
      className={`weis-skeleton ${className}`}
      style={{
        width: variant === 'circle' && typeof width === 'number' ? height : width,
        height,
        borderRadius: getRadius(),
        backgroundColor: 'var(--color-gray-200)',
        backgroundImage: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0, rgba(255, 255, 255, 0.5) 50%, rgba(255, 255, 255, 0) 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};
