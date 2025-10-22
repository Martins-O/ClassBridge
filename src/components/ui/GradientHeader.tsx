import { cn } from '@/lib/utils';

interface GradientHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function GradientHeader({ title, description, action, className }: GradientHeaderProps) {
  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card-gradient p-8 shadow-glass',
        'border border-white/30 backdrop-blur-xl text-ink-50',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.35),_transparent_55%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">ClassBridge</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-base text-brand-100/90">{description}</p>
          ) : null}
        </div>
        {action ? <div className="flex items-center gap-3">{action}</div> : null}
      </div>
    </header>
  );
}
