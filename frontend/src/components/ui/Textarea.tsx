import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  characterCount?: { current: number; max?: number };
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  characterCount,
  id,
  style,
  className = '',
  disabled,
  rows = 4,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error && textareaId ? `${textareaId}-error` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor={textareaId}
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: 'var(--color-gray-700)',
            }}
          >
            {label}
          </label>
          {characterCount && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-gray-400)' }}>
              {characterCount.current}
              {characterCount.max ? ` / ${characterCount.max}` : ''}
            </span>
          )}
        </div>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className={`weis-textarea ${className}`}
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: 'var(--font-size-sm)',
          borderRadius: 'var(--radius-md)',
          border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-gray-200)'}`,
          backgroundColor: disabled ? 'var(--color-gray-100)' : 'var(--color-white)',
          color: 'var(--color-gray-900)',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all var(--transition-fast)',
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

      {error && (
        <span
          id={errorId}
          role="alert"
          style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', fontWeight: 500 }}
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
