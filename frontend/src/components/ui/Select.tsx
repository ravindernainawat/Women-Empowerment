import React from 'react';

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
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-gray-700)',
          }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-base)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
          backgroundColor: 'var(--color-white)',
          color: 'var(--color-gray-900)',
          fontFamily: 'inherit',
          cursor: 'pointer',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
