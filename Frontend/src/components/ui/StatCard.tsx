import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  trend?: {
    value: string;
    tone?: 'up' | 'down' | 'neutral';
    caption?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

const trendToneMap: Record<'up' | 'down' | 'neutral', string> = {
  up: 'text-success',
  down: 'text-danger',
  neutral: 'text-ink-400',
};

export function StatCard({ label, value, trend, icon, className }: StatCardProps) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/30 bg-surface-elevated/95 p-6 shadow-soft backdrop-blur-xl', className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_55%)]" />
      <div className="relative grid gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink-400">{label}</p>
          {icon ? <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-500">{icon}</span> : null}
        </div>
        <div className="text-3xl font-semibold text-ink-900">{value}</div>
        {trend ? (
          <div className="flex flex-col text-sm">
            <span className={cn('font-medium', trendToneMap[trend.tone ?? 'neutral'])}>{trend.value}</span>
            {trend.caption ? <span className="text-xs text-ink-400">{trend.caption}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
