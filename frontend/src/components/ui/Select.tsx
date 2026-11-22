import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  id,
  style,
  className = '',
  disabled,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1-5)', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-gray-700)',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`weis-select ${className}`}
          style={{
            width: '100%',
            padding: '10px 38px 10px 14px',
            fontSize: 'var(--font-size-sm)',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${error ? 'var(--color-error)' : 'var(--color-gray-200)'}`,
            backgroundColor: disabled ? 'var(--color-gray-100)' : 'var(--color-white)',
            color: 'var(--color-gray-900)',
            fontFamily: 'inherit',
            cursor: disabled ? 'not-allowed' : 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
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
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          style={{
            position: 'absolute',
            right: '12px',
            color: 'var(--color-gray-400)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </div>

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
