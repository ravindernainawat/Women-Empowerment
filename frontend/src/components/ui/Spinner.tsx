import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; color?: string }> = ({
  size = 'md',
  color = 'var(--color-primary-500)',
}) => {
  const dims = { sm: '16px', md: '32px', lg: '48px' };
  const borderDims = { sm: '2px', md: '3px', lg: '4px' };

  return (
    <div
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: dims[size],
        height: dims[size],
        border: `${borderDims[size]} solid var(--color-gray-200)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
