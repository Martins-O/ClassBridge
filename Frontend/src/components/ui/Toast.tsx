'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastIntent = 'success' | 'info' | 'warning' | 'danger';

type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  intent?: ToastIntent;
  duration?: number;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const intentStyles: Record<ToastIntent, string> = {
  success: 'bg-success/15 border-success/35 text-success',
  info: 'bg-brand-500/12 border-brand-500/35 text-brand-700',
  warning: 'bg-warning/15 border-warning/40 text-warning',
  danger: 'bg-danger/15 border-danger/30 text-danger',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    const toastWithDefaults: ToastMessage = {
      id,
      intent: 'info',
      duration: 4500,
      ...toast,
    };
    setToasts((prev) => [...prev, toastWithDefaults]);

    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, toastWithDefaults.duration);

    return () => clearTimeout(timeout);
  }, []);

  const contextValue = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 flex-col gap-3 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto rounded-2xl border px-5 py-4 shadow-soft backdrop-blur-xl',
              'bg-surface-elevated/95 text-ink-700',
              toast.intent ? intentStyles[toast.intent] : null
            )}
          >
            <p className="text-sm font-semibold text-current">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-sm text-current/80">{toast.description}</p>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
