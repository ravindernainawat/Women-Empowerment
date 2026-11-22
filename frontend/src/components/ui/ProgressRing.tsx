import React from 'react';

export interface ProgressRingProps {
  score: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  variant?: 'teal' | 'coral' | 'violet' | 'dynamic';
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  variant = 'dynamic',
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  const gradientId = `ring-grad-${size}-${Math.round(score)}`;

  // Determine gradient stops based on readiness
  const getGradientStops = () => {
    if (variant === 'teal') return { start: '#087F8C', end: '#2DD4BF' };
    if (variant === 'coral') return { start: '#F28B82', end: '#FB7185' };
    if (variant === 'violet') return { start: '#7C3D8C', end: '#A78BFA' };

    // Dynamic based on score
    if (normalizedScore >= 75) return { start: '#087F8C', end: '#10B981' };
    if (normalizedScore >= 50) return { start: '#D97706', end: '#FBBF24' };
    return { start: '#7C3D8C', end: '#A78BFA' };
  };

  const { start, end } = getGradientStops();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={start} />
              <stop offset="100%" stopColor={end} />
            </linearGradient>
          </defs>

          {/* Background Track with soft tint */}
          <circle
            stroke="var(--color-gray-100)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />

          {/* Animated Gradient Stroke */}
          <circle
            stroke={`url(#${gradientId})`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              strokeLinecap: 'round',
            }}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center Percentage Display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'var(--space-2)',
          }}
        >
          <span
            style={{
              fontSize: size > 120 ? 'var(--font-size-2xl)' : 'var(--font-size-xl)',
              fontWeight: 800,
              color: 'var(--color-gray-900)',
              lineHeight: 1,
              fontFamily: "'Plus Jakarta Sans', var(--font-family)",
              letterSpacing: '-0.03em',
            }}
          >
            {normalizedScore}%
          </span>
          {sublabel && (
            <span
              style={{
                fontSize: '10px',
                color: 'var(--color-gray-500)',
                fontWeight: 600,
                marginTop: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-gray-700)',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
