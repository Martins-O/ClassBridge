import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withBorder?: boolean;
  withGlow?: boolean;
}

export function Card({
  className,
  children,
  withBorder = false,
  withGlow = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-elevated/95 backdrop-blur-xl shadow-soft transition-transform duration-300 hover:-translate-y-0.5',
        withBorder && 'border border-white/40',
        withGlow && 'shadow-glass',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
