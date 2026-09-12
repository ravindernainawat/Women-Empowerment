import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  id,
  style,
  rows = 4,
  ...props
}) => {
  const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', width: '100%' }}>
      {label && (
        <label
          htmlFor={areaId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-gray-700)',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          fontSize: 'var(--font-size-base)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-gray-300)'}`,
          backgroundColor: 'var(--color-white)',
          color: 'var(--color-gray-900)',
          fontFamily: 'inherit',
          resize: 'vertical',
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
