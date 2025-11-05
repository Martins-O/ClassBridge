import { cn } from '@/lib/utils';

interface GradientHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  tone?: 'brand' | 'light';
}

export function GradientHeader({ title, description, action, className, tone = 'light' }: GradientHeaderProps) {
  const toneClasses =
    tone === 'brand'
      ? 'relative overflow-hidden rounded-2xl bg-card-gradient p-8 shadow-glass border border-white/30 backdrop-blur-xl text-white dark:bg-gradient-to-br dark:from-primary-600 dark:to-primary-800 dark:border-primary-700/30'
      : 'relative overflow-hidden rounded-2xl border border-brand-100 dark:border-muted-700 bg-white dark:bg-muted-900 p-8 shadow-soft text-ink-900 dark:text-white';

  return (
    <header className={cn(toneClasses, className)}>
      {tone === 'brand' ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
      ) : null}
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-[0.3em]',
              tone === 'brand' ? 'text-white/70' : 'text-ink-400 dark:text-muted-400'
            )}
          >
            ClassBridge
          </p>
          <h1 className={cn('mt-2 text-3xl font-semibold sm:text-4xl', tone === 'brand' ? 'text-white' : 'text-ink-900 dark:text-white')}>
            {title}
          </h1>
          {description ? (
            <p className={cn('mt-3 max-w-2xl text-base', tone === 'brand' ? 'text-white/80' : 'text-ink-500 dark:text-muted-300')}>
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="flex items-center gap-3">{action}</div> : null}
      </div>
    </header>
  );
}
