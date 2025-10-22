import { cn } from '@/lib/utils';

interface PageShellProps {
  className?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | 'full';
}

const containerMap: Record<Exclude<PageShellProps['maxWidth'], undefined>, string> = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function PageShell({ className, children, maxWidth = 'xl' }: PageShellProps) {
  return (
    <div className={cn('min-h-screen bg-brand-gradient/40 px-4 pb-20 pt-16 sm:px-6 lg:px-10', className)}>
      <div className={cn('mx-auto w-full', containerMap[maxWidth])}>{children}</div>
    </div>
  );
}
