import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  style,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-gray-700)',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-base)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
          backgroundColor: disabled ? 'var(--color-gray-100)' : 'var(--color-white)',
          color: 'var(--color-gray-900)',
          transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          fontFamily: 'inherit',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span role="alert" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)' }}>
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
