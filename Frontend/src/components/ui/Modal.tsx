'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, className, actions }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-surface-overlay backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative w-full max-w-xl rounded-2xl border border-white/30 bg-surface-elevated/95 shadow-glass backdrop-blur-xl',
          'animate-fadeIn',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/20 px-6 py-5">
          <div>
            {title ? <h2 className="text-xl font-semibold text-ink-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-ink-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close modal">
            <span className="text-lg">×</span>
          </Button>
        </div>
        <div className="custom-scrollbar max-h-[70vh] overflow-y-auto px-6 py-5 text-ink-600">{children}</div>
        {actions ? <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/20 px-6 py-4">{actions}</div> : null}
      </div>
    </div>,
    document.body
  );
}
