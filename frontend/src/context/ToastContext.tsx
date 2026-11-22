import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', title?: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newToast: Toast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'success', title, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'error', title, duration ?? 6000);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'warning', title, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      showToast(message, 'info', title, duration);
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      success,
      error,
      warning,
      info,
      dismissToast,
    }),
    [showToast, success, error, warning, info, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Render Container */}
      <aside
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none',
          maxWidth: '380px',
          width: 'calc(100vw - 40px)',
        }}
      >
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 size={18} />,
              bg: 'rgba(236, 253, 245, 0.96)',
              border: 'rgba(16, 185, 129, 0.35)',
              color: '#065f46',
              iconColor: '#059669',
            },
            error: {
              icon: <AlertCircle size={18} />,
              bg: 'rgba(254, 242, 242, 0.96)',
              border: 'rgba(239, 68, 68, 0.35)',
              color: '#991b1b',
              iconColor: '#dc2626',
            },
            warning: {
              icon: <AlertTriangle size={18} />,
              bg: 'rgba(255, 251, 235, 0.96)',
              border: 'rgba(245, 158, 11, 0.35)',
              color: '#92400e',
              iconColor: '#d97706',
            },
            info: {
              icon: <Info size={18} />,
              bg: 'rgba(240, 249, 255, 0.96)',
              border: 'rgba(14, 165, 233, 0.35)',
              color: '#075985',
              iconColor: '#0284c7',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: typeConfig.bg,
                border: `1px solid ${typeConfig.border}`,
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: typeConfig.color,
                transition: 'all 200ms ease-in-out',
                animation: 'slideInRight 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <div style={{ color: typeConfig.iconColor, flexShrink: 0, marginTop: '2px' }}>
                {typeConfig.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '13px', lineHeight: 1.45, fontWeight: 500 }}>
                  {toast.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '2px',
                  cursor: 'pointer',
                  color: 'inherit',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  transition: 'opacity 150ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
