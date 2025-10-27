import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'primary'    // Neon cyan primary button
  | 'secondary'  // Purple accent button
  | 'ghost'      // Transparent with hover
  | 'danger'     // Neon pink for destructive actions
  | 'success'    // Neon green for success actions
  | 'outline'    // Outline style
  | 'terminal';  // Terminal/console style

type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean; // Add neon glow effect
  loading?: boolean; // Show loading state
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-brand-500 text-white font-semibold',
    'border border-brand-500',
    'shadow-card',
    'hover:bg-brand-600 hover:shadow-card-hover',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
    'transition-all duration-150'
  ),
  secondary: cn(
    'bg-secondary-500 text-white font-semibold',
    'border border-secondary-500',
    'shadow-card',
    'hover:bg-secondary-600 hover:shadow-card-hover',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-secondary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
    'transition-all duration-150'
  ),
  ghost: cn(
    'bg-transparent text-muted-600',
    'border border-transparent',
    'hover:bg-muted-100 hover:border-muted-200 hover:text-muted-900',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
    'transition-all duration-150'
  ),
  danger: cn(
    'bg-red-500 text-white font-semibold',
    'border border-red-500',
    'shadow-card',
    'hover:bg-red-600 hover:shadow-card-hover',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-150'
  ),
  success: cn(
    'bg-green-500 text-white font-semibold',
    'border border-green-500',
    'shadow-card',
    'hover:bg-green-600 hover:shadow-card-hover',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-150'
  ),
  outline: cn(
    'bg-transparent text-gray-700',
    'border border-gray-300',
    'hover:bg-gray-50 hover:border-primary-500',
    'hover:text-primary-600',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-150'
  ),
  terminal: cn(
    'bg-gray-800 text-green-400 font-mono',
    'border border-green-400/30',
    'hover:bg-gray-700 hover:shadow-card-hover',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    'transition-all duration-150'
  ),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm h-8 px-3',
  md: 'text-sm h-10 px-4',
  lg: 'text-base h-11 px-6',
  xl: 'text-lg h-12 px-8',
};

const glowClasses: Record<ButtonVariant, string> = {
  primary: 'shadow-card-hover',
  secondary: 'shadow-card-soft',
  ghost: '',
  danger: 'shadow-card-soft',
  success: 'shadow-card-soft',
  outline: '',
  terminal: 'shadow-card-soft',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  glow = false,
  loading = false,
  className
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  loading?: boolean;
  className?: string;
} = {}) {
  return cn(
    // Base styles
    'inline-flex items-center justify-center gap-2',
    'rounded-lg font-medium',
    'focus-visible:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none',
    'relative overflow-hidden',
    'select-none', // Prevent text selection

    // Accessibility improvements
    'motion-safe:transition-all motion-safe:duration-150',
    'motion-reduce:transition-none motion-reduce:hover:scale-100',

    // Variant styles
    variantClasses[variant],

    // Size styles
    sizeClasses[size],

    // Glow effect
    glow && glowClasses[variant],

    // Loading state
    loading && 'cursor-wait pointer-events-none',

    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    glow = false,
    loading = false,
    disabled,
    children,
    type = 'button',
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={buttonClasses({ variant, size, glow, loading, className })}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...(loading && { 'aria-label': `Loading...` })}
        {...props}
      >
        {loading && (
          <div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export specialized button components
export const TerminalButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="terminal" {...props} />
);

export const GlowButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, 'glow'>>(
  (props, ref) => <Button ref={ref} glow {...props} />
);

export const LoadingButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, children, ...props }, ref) => (
    <Button ref={ref} loading={loading} {...props}>
      {loading ? 'Loading...' : children}
    </Button>
  )
);

TerminalButton.displayName = 'TerminalButton';
GlowButton.displayName = 'GlowButton';
LoadingButton.displayName = 'LoadingButton';
