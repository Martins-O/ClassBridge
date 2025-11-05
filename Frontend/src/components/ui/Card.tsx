import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'terminal' | 'glow' | 'elevated';
  interactive?: boolean; // Add hover effects
  neonBorder?: 'cyan' | 'purple' | 'green' | 'pink' | 'none';
  children: ReactNode;
}

const variantClasses = {
  default: cn(
    'bg-white',
    'border border-muted-200',
    'shadow-card',
    'dark:bg-muted-900/80 dark:border-muted-800'
  ),
  glass: cn(
    'backdrop-blur-sm bg-white/70 dark:bg-muted-900/60',
    'border border-muted-200/60 dark:border-muted-800/60'
  ),
  terminal: cn(
    'bg-muted-900 text-emerald-400',
    'border border-emerald-500/30',
    'shadow-card',
    'font-mono'
  ),
  glow: cn(
    'bg-white',
    'border border-brand-500/20',
    'shadow-card-hover',
    'dark:bg-muted-900/80'
  ),
  elevated: cn(
    'bg-white',
    'border border-muted-200',
    'shadow-card-soft',
    'dark:bg-muted-900/80 dark:border-muted-800'
  ),
};

const neonBorderClasses = {
  cyan: 'border-brand-500 shadow-card-hover',
  purple: 'border-secondary-500 shadow-card-soft',
  green: 'border-emerald-500 shadow-card-soft',
  pink: 'border-rose-500 shadow-card-soft',
  none: '',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    interactive = false,
    neonBorder = 'none',
    children,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'rounded-lg overflow-hidden',

          // Variant styles
          variantClasses[variant],

          // Neon border
          neonBorder !== 'none' && neonBorderClasses[neonBorder],

          // Interactive effects with accessibility
          interactive && cn(
            'cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base',
            'motion-safe:transition-all motion-safe:duration-200',
            'motion-safe:hover:scale-[1.02] motion-safe:hover:shadow-card-hover',
            'motion-safe:active:scale-[0.98]',
            'motion-reduce:transition-none motion-reduce:hover:scale-100'
          ),

          // Non-interactive cards still get subtle transitions
          !interactive && 'motion-safe:transition-all motion-safe:duration-200',

          className
        )}
        {...(interactive && {
          role: 'button',
          tabIndex: 0,
          'aria-pressed': 'false'
        })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Specialized card components
export const TerminalCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="terminal" {...props} />
);

export const GlassCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="glass" {...props} />
);

export const GlowCard = forwardRef<HTMLDivElement, Omit<CardProps, 'variant'>>(
  (props, ref) => <Card ref={ref} variant="glow" {...props} />
);

// Content sections for cards
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'px-6 py-4 border-b border-muted-200',
        'bg-muted-100/60 dark:border-muted-800 dark:bg-muted-900/60',
        className
      )}
      {...props}
    />
  )
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
);

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4 border-t border-muted-200 bg-muted-100/40 dark:border-muted-800 dark:bg-muted-900/50', className)}
      {...props}
    />
  )
);

// Status cards with different themes
export const StatusCard = forwardRef<HTMLDivElement, CardProps & {
  status: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description?: string;
}>(({ status, title, description, className, children, ...props }, ref) => {
  const statusConfig = {
    success: {
      borderColor: 'border-accent-success',
      glowColor: 'shadow-glow-green',
      iconColor: 'text-accent-success',
      bgAccent: 'bg-accent-success/5'
    },
    warning: {
      borderColor: 'border-accent-warning',
      glowColor: 'shadow-[0_0_20px_rgba(255,225,53,0.3)]',
      iconColor: 'text-accent-warning',
      bgAccent: 'bg-accent-warning/5'
    },
    danger: {
      borderColor: 'border-accent-danger',
      glowColor: 'shadow-[0_0_20px_rgba(255,0,128,0.3)]',
      iconColor: 'text-accent-danger',
      bgAccent: 'bg-accent-danger/5'
    },
    info: {
      borderColor: 'border-accent-info',
      glowColor: 'shadow-[0_0_20px_rgba(0,112,243,0.3)]',
      iconColor: 'text-accent-info',
      bgAccent: 'bg-accent-info/5'
    }
  };

  const config = statusConfig[status];

  return (
    <Card
      ref={ref}
      className={cn(
        config.borderColor,
        config.glowColor,
        config.bgAccent,
        className
      )}
      {...props}
    >
      <CardContent>
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5', config.iconColor)}>
            {/* Status icon will be determined by the status */}
            <div className="w-5 h-5 rounded-full border-2 border-current" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
            {description && (
              <p className="text-text-secondary text-sm">{description}</p>
            )}
            {children}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TerminalCard.displayName = 'TerminalCard';
GlassCard.displayName = 'GlassCard';
GlowCard.displayName = 'GlowCard';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';
StatusCard.displayName = 'StatusCard';
