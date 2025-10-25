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
    'bg-gradient-to-r from-semantic-primary-500 to-semantic-primary-400',
    'text-white font-semibold',
    'border border-semantic-primary-500/30',
    'shadow-dark-soft',
    'hover:from-semantic-primary-400 hover:to-semantic-primary-300 hover:shadow-glow-cyan',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-semantic-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'transition-all duration-150'
  ),
  secondary: cn(
    'bg-semantic-secondary-600 text-text-primary font-semibold',
    'border border-semantic-secondary-500/30',
    'shadow-dark-soft',
    'hover:bg-semantic-secondary-500 hover:shadow-dark-medium',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-semantic-secondary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'transition-all duration-150'
  ),
  ghost: cn(
    'bg-transparent text-text-primary',
    'border border-transparent',
    'hover:bg-dark-700 hover:border-border-primary',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-text-muted focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'transition-all duration-150'
  ),
  danger: cn(
    'bg-gradient-to-r from-semantic-danger-500 to-semantic-danger-400',
    'text-white font-semibold',
    'border border-semantic-danger-500/30',
    'shadow-dark-soft',
    'hover:from-semantic-danger-400 hover:to-semantic-danger-300 hover:shadow-glow-pink',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-semantic-danger-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'transition-all duration-150'
  ),
  success: cn(
    'bg-gradient-to-r from-semantic-success-500 to-semantic-success-400',
    'text-white font-semibold',
    'border border-semantic-success-500/30',
    'shadow-dark-soft',
    'hover:from-semantic-success-400 hover:to-semantic-success-300 hover:shadow-glow-green',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-semantic-success-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'transition-all duration-150'
  ),
  outline: cn(
    'bg-transparent text-text-primary',
    'border border-border-primary',
    'hover:bg-dark-700 hover:border-semantic-primary-500',
    'hover:text-semantic-primary-500',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-semantic-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
    'transition-all duration-150'
  ),
  terminal: cn(
    'bg-dark-800 text-neon-green font-mono',
    'border border-neon-green/30',
    'hover:bg-dark-700 hover:shadow-glow-green',
    'hover:scale-[1.02] active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-neon-green focus-visible:ring-offset-2 focus-visible:ring-offset-background-primary',
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
  primary: 'shadow-glow-cyan animate-glow-pulse',
  secondary: 'shadow-glow-purple animate-glow-pulse',
  ghost: '',
  danger: 'shadow-glow-pink animate-glow-pulse',
  success: 'shadow-glow-green animate-glow-pulse',
  outline: '',
  terminal: 'shadow-glow-green animate-glow-pulse',
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