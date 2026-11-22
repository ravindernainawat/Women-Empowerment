import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  id,
  style,
  disabled,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-gray-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--color-gray-400)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`weis-input ${className}`}
          style={{
            width: '100%',
            padding: '10px 14px',
            paddingLeft: leftIcon ? '40px' : '14px',
            paddingRight: rightIcon ? '40px' : '14px',
            fontSize: 'var(--font-size-sm)',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-gray-200)'}`,
            backgroundColor: disabled ? 'var(--color-gray-100)' : 'var(--color-white)',
            color: 'var(--color-gray-900)',
            outline: 'none',
            transition: 'all var(--transition-fast)',
            fontFamily: 'inherit',
            boxShadow: 'var(--shadow-xs)',
            ...style,
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-primary-500)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(8, 127, 140, 0.15)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--color-gray-200)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
            }
          }}
          {...props}
        />

        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              color: 'var(--color-gray-400)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-error)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-500)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
