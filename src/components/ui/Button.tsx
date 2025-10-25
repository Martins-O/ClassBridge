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
    'bg-gradient-to-r from-accent-primary to-neon-cyan',
    'text-background-primary font-semibold',
    'border border-accent-primary/30',
    'shadow-dark-soft',
    'hover:shadow-glow-cyan hover:scale-105',
    'active:scale-95',
    'focus-visible:ring-accent-primary'
  ),
  secondary: cn(
    'bg-gradient-to-r from-accent-secondary to-neon-purple',
    'text-text-primary font-semibold',
    'border border-accent-secondary/30',
    'shadow-dark-soft',
    'hover:shadow-glow-purple hover:scale-105',
    'active:scale-95',
    'focus-visible:ring-accent-secondary'
  ),
  ghost: cn(
    'bg-transparent text-text-primary',
    'border border-transparent',
    'hover:bg-dark-700 hover:border-border-primary',
    'focus-visible:ring-text-muted'
  ),
  danger: cn(
    'bg-gradient-to-r from-accent-danger to-neon-pink',
    'text-text-primary font-semibold',
    'border border-accent-danger/30',
    'shadow-dark-soft',
    'hover:shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-105',
    'active:scale-95',
    'focus-visible:ring-accent-danger'
  ),
  success: cn(
    'bg-gradient-to-r from-accent-success to-neon-green',
    'text-background-primary font-semibold',
    'border border-accent-success/30',
    'shadow-dark-soft',
    'hover:shadow-glow-green hover:scale-105',
    'active:scale-95',
    'focus-visible:ring-accent-success'
  ),
  outline: cn(
    'bg-transparent text-text-primary',
    'border border-border-primary',
    'hover:bg-dark-700 hover:border-accent-primary',
    'hover:text-accent-primary',
    'focus-visible:ring-accent-primary'
  ),
  terminal: cn(
    'bg-dark-800 text-neon-green font-mono',
    'border border-neon-green/30',
    'hover:bg-dark-700 hover:shadow-glow-green',
    'focus-visible:ring-neon-green'
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
  danger: 'shadow-[0_0_20px_rgba(255,0,128,0.3)] animate-glow-pulse',
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
    'rounded-lg font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background-primary',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
    'relative overflow-hidden',

    // Variant styles
    variantClasses[variant],

    // Size styles
    sizeClasses[size],

    // Glow effect
    glow && glowClasses[variant],

    // Loading state
    loading && 'cursor-wait',

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
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
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