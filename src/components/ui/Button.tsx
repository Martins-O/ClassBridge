import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-700 text-white shadow-soft transition-colors hover:bg-brand-800 focus-visible:ring-brand-200',
  secondary:
    'bg-white text-ink-700 border border-brand-200 shadow-soft hover:border-brand-400 hover:text-brand-700 focus-visible:ring-brand-200',
  ghost:
    'bg-transparent text-ink-600 hover:text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-100',
  destructive:
    'bg-danger text-white shadow-soft hover:bg-danger/90 focus-visible:ring-danger/30',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm h-9 px-4',
  md: 'text-sm h-11 px-5',
  lg: 'text-base h-12 px-6',
};

export function buttonClasses({ variant = 'primary', size = 'md', className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle disabled:opacity-50 disabled:cursor-not-allowed',
    variantClasses[variant],
    sizeClasses[size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses({ variant, size, className })}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
