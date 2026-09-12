import React from 'react';

export interface ProgressRingProps {
  score: number; // 0 to 100
  size?: number; // diameter in px
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  // Determine stroke color based on score readiness
  const getColor = (s: number) => {
    if (s >= 75) return 'var(--color-primary-500)';
    if (s >= 50) return 'var(--color-warning)';
    return 'var(--color-accent-500)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            stroke="var(--color-gray-200)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Animated Value Stroke */}
          <circle
            stroke={getColor(normalizedScore)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-in-out',
              strokeLinecap: 'round',
            }}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-gray-900)' }}>
            {normalizedScore}%
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Ready
          </span>
        </div>
      </div>

      {label && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-gray-800)', fontSize: 'var(--font-size-base)' }}>
            {label}
          </p>
          {sublabel && (
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
              {sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
