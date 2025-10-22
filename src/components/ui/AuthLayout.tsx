import Link from 'next/link';
import ClassBridgeLogo from '@/components/ClassBridgeLogo';
import { buttonClasses } from './Button';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  helper?: React.ReactNode;
  badge?: string;
}

export function AuthLayout({ title, subtitle, children, helper, badge }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-stretch bg-surface-base">
      <aside className="hidden w-full max-w-xl flex-col justify-between border-r border-brand-100 bg-white px-12 py-12 shadow-soft lg:flex">
        <div className="space-y-8">
          <ClassBridgeLogo size="md" />
          {badge ? (
            <span className="inline-flex items-center rounded-full bg-accent-emerald/15 px-3 py-1 text-xs font-semibold text-accent-emerald">
              {badge}
            </span>
          ) : null}
          <h1 className="text-3xl font-semibold text-ink-900">
            Orchestrate every learning journey with confidence.
          </h1>
          <p className="text-sm leading-relaxed text-ink-500">
            ClassBridge centralises enrolment, assessment, and community communication so leaders stay proactive and every mentor knows their next action.
          </p>
          <ul className="space-y-3 text-sm text-ink-500">
            <li>• Governance dashboards spanning cohorts, classes, and assessments.</li>
            <li>• Secure onboarding for mentors, students, and guardians.</li>
            <li>• Advisor-led implementation and migration support.</li>
          </ul>
        </div>
        <div className="space-y-4 text-sm text-ink-400">
          <p>Need assistance? <Link href="/" className="text-brand-600 underline">Contact support</Link></p>
          <p className="text-ink-300">&copy; {new Date().getFullYear()} ClassBridge. All rights reserved.</p>
        </div>
      </aside>
      <main className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <ClassBridgeLogo size="sm" />
            <Link href="/register" className={buttonClasses({ variant: 'secondary', size: 'sm' })}>
              Request demo
            </Link>
          </div>
          <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-soft">
            <h2 className="text-2xl font-semibold text-ink-900">{title}</h2>
            <p className="mt-2 text-sm text-ink-500">{subtitle}</p>
            <div className="mt-6 space-y-6">{children}</div>
          </div>
          {helper ? <div className="mt-6 text-center text-sm text-ink-500">{helper}</div> : null}
        </div>
      </main>
    </div>
  );
}
